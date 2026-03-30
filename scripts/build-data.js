#!/usr/bin/env node
/**
 * Parse Obsidian vault → structured JSON for Rootwork.
 * Reads plant profiles, family files, and category files.
 * Outputs: src/data/plants.json, src/data/families.json, src/data/categories.json
 */

const fs = require('fs');
const path = require('path');

const VAULT_DIR = path.join(process.env.HOME, 'Documents/SetupVault/medicine/NATURAL');
const OUT_DIR = path.join(__dirname, '..', 'src', 'data');

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseMarkdown(content) {
  const sections = {};
  let currentH2 = null;
  let currentH3 = null;
  const lines = content.split('\n');
  
  // Get title from first H1
  const titleLine = lines.find(l => l.startsWith('# '));
  const title = titleLine ? titleLine.replace(/^# /, '').trim() : '';
  
  // Extract Latin name from title or Basic Info
  let latinName = '';
  const latinMatch = title.match(/\(([^)]+)\)/);
  if (latinMatch) latinName = latinMatch[1];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      currentH2 = line.replace(/^## /, '').trim();
      currentH3 = null;
      if (!sections[currentH2]) sections[currentH2] = { text: [], subsections: {} };
    } else if (line.startsWith('### ')) {
      currentH3 = line.replace(/^### /, '').trim();
      if (currentH2 && !sections[currentH2].subsections[currentH3]) {
        sections[currentH2].subsections[currentH3] = [];
      }
    } else if (currentH2) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (currentH3) {
        sections[currentH2].subsections[currentH3].push(trimmed);
      } else {
        sections[currentH2].text.push(trimmed);
      }
    }
  }

  return { title, latinName, sections };
}

function extractField(sections, sectionName, fieldName) {
  const section = sections[sectionName];
  if (!section) return '';
  const allText = [...section.text, ...Object.values(section.subsections).flat()];
  for (const line of allText) {
    if (line.toLowerCase().includes(fieldName.toLowerCase())) {
      const match = line.match(/\*\*[^*]+\*\*:?\s*(.+)/);
      if (match) return match[1].trim();
    }
  }
  return '';
}

function extractList(sections, sectionName, subsectionName) {
  const section = sections[sectionName];
  if (!section) return [];
  const lines = subsectionName
    ? (section.subsections[subsectionName] || [])
    : section.text;
  return lines
    .filter(l => l.startsWith('- '))
    .map(l => l.replace(/^- \*\*[^*]+\*\*:?\s*/, '').replace(/^- /, '').trim());
}

function parsePlantFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { title, latinName, sections } = parseMarkdown(content);
  
  // Extract name without latin
  const commonName = title.replace(/\s*\([^)]+\)/, '').trim();
  
  const family = extractField(sections, 'Basic Information', 'Plant Family');
  const nativeRange = extractField(sections, 'Basic Information', 'Native Range');
  const habitat = extractField(sections, 'Basic Information', 'Habitat');
  
  // Active compounds
  const compounds = extractList(sections, 'Medicinal Properties', 'Active Compounds');
  
  // Traditional uses
  const traditionalUses = extractList(sections, 'Medicinal Properties', 'Traditional Uses');
  const modernUses = extractList(sections, 'Medicinal Properties', 'Modern Applications');
  
  // Parts used
  const partsUsed = extractList(sections, 'Medicinal Properties', 'Parts Used');
  
  // Preparations
  const preparations = extractList(sections, 'Preparation Methods', 'Traditional Preparations');
  
  // Safety
  const contraindications = extractList(sections, 'Safety Information', 'Contraindications');
  const sideEffects = extractList(sections, 'Safety Information', 'Side Effects');
  const drugInteractions = extractList(sections, 'Safety Information', 'Drug Interactions');
  
  // Description subsections
  const description = {};
  if (sections['Plant Description']) {
    for (const [key, lines] of Object.entries(sections['Plant Description'].subsections)) {
      description[key.toLowerCase()] = lines.join(' ').replace(/^- /, '');
    }
  }

  return {
    slug: slugify(commonName),
    name: commonName,
    latinName,
    family: family.replace(/\s*\([^)]+\)/, '').trim(),
    familyLatin: (family.match(/\(([^)]+)\)/) || ['', ''])[1],
    nativeRange,
    habitat,
    description,
    compounds,
    partsUsed,
    traditionalUses,
    modernUses,
    preparations,
    contraindications,
    sideEffects,
    drugInteractions,
  };
}

function parseFamilyFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { title, sections } = parseMarkdown(content);
  
  const name = title.replace(/\s*\([^)]+\)/, '').trim();
  const commonName = (title.match(/\(([^)]+)\)/) || ['', ''])[1];
  
  // Extract characteristics
  const chars = sections['Family Characteristics'] || { text: [], subsections: {} };
  const characteristics = {};
  for (const line of chars.text) {
    const match = line.match(/\*\*([^*]+)\*\*:?\s*(.+)/);
    if (match) characteristics[match[1].trim()] = match[2].trim();
  }
  
  // Extract plant links
  const plantsSection = sections['Plants in this Family'] || { text: [], subsections: {} };
  const plantRefs = plantsSection.text.join(' ')
    .match(/\[\[([^\]]+)\]\]/g)?.map(m => m.replace(/[\[\]]/g, '')) || [];

  return {
    slug: slugify(name),
    name,
    commonName,
    characteristics,
    plantRefs,
  };
}

function parseCategoryFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { title, sections } = parseMarkdown(content);
  
  const name = title.trim();
  
  const uses = sections['Traditional Uses'] || { text: [], subsections: {} };
  const usesList = uses.text.filter(l => l.startsWith('- ')).map(l => l.replace(/^- /, ''));
  
  const plantsSection = sections['Plants in this Category'] || { text: [], subsections: {} };
  const plantRefs = plantsSection.text.join(' ')
    .match(/\[\[([^\]]+)\]\]/g)?.map(m => m.replace(/[\[\]]/g, '')) || [];

  return {
    slug: slugify(name),
    name,
    uses: usesList,
    plantRefs,
  };
}

// Main
fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs.readdirSync(VAULT_DIR).filter(f => f.endsWith('.md'));

const plants = [];
const families = [];
const categories = [];

for (const file of files) {
  const filePath = path.join(VAULT_DIR, file);
  
  if (/^\d+/.test(file)) {
    // Plant file
    try {
      const plant = parsePlantFile(filePath);
      plant.sourceFile = file;
      plants.push(plant);
    } catch (e) {
      console.error(`Error parsing plant ${file}: ${e.message}`);
    }
  } else if (file.includes('Family')) {
    try {
      families.push(parseFamilyFile(filePath));
    } catch (e) {
      console.error(`Error parsing family ${file}: ${e.message}`);
    }
  } else if (!file.startsWith('.') && !file.startsWith('00-')) {
    try {
      categories.push(parseCategoryFile(filePath));
    } catch (e) {
      console.error(`Error parsing category ${file}: ${e.message}`);
    }
  }
}

// Sort
plants.sort((a, b) => a.name.localeCompare(b.name));
families.sort((a, b) => a.name.localeCompare(b.name));
categories.sort((a, b) => a.name.localeCompare(b.name));

// Write
fs.writeFileSync(path.join(OUT_DIR, 'plants.json'), JSON.stringify(plants, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'families.json'), JSON.stringify(families, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'categories.json'), JSON.stringify(categories, null, 2));

console.log(`Parsed: ${plants.length} plants, ${families.length} families, ${categories.length} categories`);
console.log(`Written to ${OUT_DIR}`);
