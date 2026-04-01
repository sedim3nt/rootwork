import plants from '@/data/plants.json';
import families from '@/data/families.json';
import categories from '@/data/categories.json';

export type Plant = (typeof plants)[number];
export type Family = (typeof families)[number];
export type Category = (typeof categories)[number];

export { plants, families, categories };

/** Resolve plantRefs (e.g. "18-Elderberry") to actual plant objects */
export function resolvePlantRefs(refs: string[]): Plant[] {
  return refs
    .filter((ref) => !ref.startsWith('00-'))
    .map((ref) => {
      const prefix = ref + '.md';
      return plants.find((p) => p.sourceFile === prefix);
    })
    .filter((p): p is Plant => p != null);
}

/** Get plants that belong to a given botanical family */
export function getPlantsByFamily(familyName: string): Plant[] {
  return plants.filter((p) => p.family === familyName);
}

/** Find the family object for a given family name */
export function getFamilyByName(familyName: string): Family | undefined {
  // Match by checking if the family name appears in the family's name field
  return families.find((f) => {
    const fName = f.name.replace(' Family', '');
    return fName === familyName || f.latin === familyName;
  });
}

/** Get plants that share uses with a given plant */
export function getRelatedPlants(plant: Plant, limit = 6): Plant[] {
  const familyPlants = plants.filter((p) => p.family === plant.family && p.slug !== plant.slug);
  const others = plants.filter((p) => p.family !== plant.family && p.slug !== plant.slug);

  // Score others by shared traditional/modern uses
  const scored = others.map((p) => {
    const sharedUses = plant.traditionalUses.filter((u) =>
      p.traditionalUses.some((pu) => pu.toLowerCase().includes(u.toLowerCase().split(' ')[0]))
    ).length;
    return { plant: p, score: sharedUses };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score);

  return [...familyPlants.slice(0, 3), ...scored.slice(0, limit - Math.min(familyPlants.length, 3)).map((s) => s.plant)].slice(0, limit);
}
