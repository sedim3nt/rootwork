#!/usr/bin/env python3
"""Merge 100 new plants into existing Rootwork data files."""
import json, os

ROOT = "/Users/spirittree/projects/rootwork"
EXISTING = os.path.join(ROOT, "src/data/plants.json")
NEW = os.path.join(ROOT, "scripts/new-100-plants.json")
FAMILIES = os.path.join(ROOT, "src/data/families.json")
CATEGORIES = os.path.join(ROOT, "src/data/categories.json")

def main():
    with open(EXISTING) as f:
        existing = json.load(f)
    with open(NEW) as f:
        new_plants = json.load(f)
    
    existing_slugs = {p["slug"] for p in existing}
    
    # Add sourceFile field to new plants (matching existing format)
    added = 0
    skipped = 0
    for plant in new_plants:
        if plant["slug"] in existing_slugs:
            print(f"  SKIP (duplicate): {plant['name']}")
            skipped += 1
            continue
        plant["sourceFile"] = f"expansion/{plant['slug']}.md"
        existing.append(plant)
        existing_slugs.add(plant["slug"])
        added += 1
    
    # Sort by name
    existing.sort(key=lambda p: p["name"])
    
    # Write merged plants
    with open(EXISTING, "w") as f:
        json.dump(existing, f, indent=2)
    
    # Rebuild families.json
    families = {}
    for p in existing:
        fam = p.get("family", "Unknown")
        fam_latin = p.get("familyLatin", "")
        if fam not in families:
            families[fam] = {"name": fam, "latin": fam_latin, "plants": []}
        families[fam]["plants"].append({"slug": p["slug"], "name": p["name"]})
    
    families_list = sorted(families.values(), key=lambda f: f["name"])
    with open(FAMILIES, "w") as f:
        json.dump(families_list, f, indent=2)
    
    # Rebuild categories.json from therapeutic uses
    categories = {}
    use_keywords = {
        "Anti-inflammatory": ["anti-inflammatory", "inflammation"],
        "Digestive": ["digestive", "stomach", "gastric", "nausea", "gut"],
        "Respiratory": ["respiratory", "cough", "bronch", "lung", "asthma"],
        "Immune Support": ["immune", "antimicrobial", "antiviral", "antibacterial"],
        "Nervous System": ["anxiety", "sleep", "insomnia", "nerv", "sedative", "calm"],
        "Pain Relief": ["pain", "analgesic", "headache", "migraine"],
        "Skin & Wound": ["skin", "wound", "burn", "dermat", "topical"],
        "Heart & Circulation": ["heart", "cardiovascular", "blood pressure", "circulat"],
        "Women's Health": ["menstrual", "menopaus", "pregnan", "fertility", "PMS", "uterine"],
        "Men's Health": ["prostate", "testosterone", "libido", "erectile"],
        "Liver Support": ["liver", "hepat", "detox", "bile"],
        "Kidney & Urinary": ["kidney", "urinary", "bladder", "diuretic"],
        "Adaptogenic": ["adaptogen", "stress", "cortisol", "stamina", "endurance"],
        "Cognitive": ["brain", "memory", "cognitive", "focus", "neuroprotect"],
        "Antioxidant": ["antioxidant", "free radical"],
        "Blood Sugar": ["blood sugar", "diabetes", "insulin", "glycemi"],
        "Bone & Joint": ["bone", "joint", "arthrit", "osteo"],
        "Eye Health": ["eye", "vision", "macula"],
    }
    
    for p in existing:
        all_uses = " ".join(p.get("traditionalUses", []) + p.get("modernUses", [])).lower()
        for cat, keywords in use_keywords.items():
            if any(kw in all_uses for kw in keywords):
                if cat not in categories:
                    categories[cat] = {"name": cat, "plants": []}
                if not any(pp["slug"] == p["slug"] for pp in categories[cat]["plants"]):
                    categories[cat]["plants"].append({"slug": p["slug"], "name": p["name"]})
    
    categories_list = sorted(categories.values(), key=lambda c: c["name"])
    with open(CATEGORIES, "w") as f:
        json.dump(categories_list, f, indent=2)
    
    print(f"\n✅ Merged: {added} new plants added ({skipped} skipped)")
    print(f"Total plants: {len(existing)}")
    print(f"Total families: {len(families_list)}")
    print(f"Total categories: {len(categories_list)}")

if __name__ == "__main__":
    main()
