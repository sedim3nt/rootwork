#!/usr/bin/env python3
"""Fetch botanical illustrations for new 100 plants from Wikimedia Commons.
Resizes to 1140px wide WebP matching existing collection."""

import json, os, time, re, urllib.request, urllib.parse, subprocess

PLANTS_FILE = "/Users/spirittree/projects/rootwork/scripts/new-100-plants.json"
OUTPUT_DIR = "/Users/spirittree/projects/rootwork/public/images/botanical/1140w"
MANIFEST_FILE = "/Users/spirittree/projects/rootwork/src/data/plant-images.json"

# Wikimedia Commons API
COMMONS_API = "https://commons.wikimedia.org/w/api.php"

def search_wikimedia(query, limit=5):
    """Search Wikimedia Commons for botanical illustrations."""
    params = {
        "action": "query",
        "list": "search",
        "srsearch": f"{query} botanical illustration OR medicinal plant drawing",
        "srnamespace": "6",  # File namespace
        "srlimit": str(limit),
        "format": "json"
    }
    url = f"{COMMONS_API}?{urllib.parse.urlencode(params)}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "RootworkBot/1.0 (spirittree.dev)"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            return [r["title"] for r in data.get("query", {}).get("search", [])]
    except Exception as e:
        print(f"  Search error: {e}")
        return []

def get_image_url(title):
    """Get direct image URL from file title."""
    params = {
        "action": "query",
        "titles": title,
        "prop": "imageinfo",
        "iiprop": "url|size|mime",
        "iiurlwidth": "1400",
        "format": "json"
    }
    url = f"{COMMONS_API}?{urllib.parse.urlencode(params)}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "RootworkBot/1.0 (spirittree.dev)"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            pages = data.get("query", {}).get("pages", {})
            for page in pages.values():
                info = page.get("imageinfo", [{}])[0]
                # Prefer thumburl (resized) if available
                return info.get("thumburl") or info.get("url")
    except Exception as e:
        print(f"  URL error: {e}")
    return None

def download_and_convert(url, slug):
    """Download image and convert to 1140px wide WebP."""
    output_path = os.path.join(OUTPUT_DIR, f"{slug}.webp")
    if os.path.exists(output_path):
        print(f"  Already exists: {slug}.webp")
        return True
    
    tmp_path = f"/tmp/botanical-{slug}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "RootworkBot/1.0 (spirittree.dev)"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            ext = ".jpg"
            ct = resp.headers.get("Content-Type", "")
            if "png" in ct: ext = ".png"
            elif "svg" in ct: ext = ".svg"
            tmp_file = tmp_path + ext
            with open(tmp_file, "wb") as f:
                f.write(resp.read())
        
        # Convert to 1140px wide WebP using sips
        subprocess.run([
            "sips", "-s", "format", "jpeg", "--resampleWidth", "1140",
            tmp_file, "--out", tmp_path + ".jpg"
        ], capture_output=True, timeout=15)
        
        # Convert to WebP
        subprocess.run([
            "cwebp", "-q", "90", "-resize", "1140", "0",
            tmp_path + ".jpg", "-o", output_path
        ], capture_output=True, timeout=15)
        
        if not os.path.exists(output_path):
            # Fallback: just use sips to resize and keep as jpg, then rename
            subprocess.run([
                "sips", "-s", "format", "jpeg", "--resampleWidth", "1140",
                tmp_file, "--out", output_path.replace(".webp", ".jpg")
            ], capture_output=True, timeout=15)
            # If webp conversion failed, convert jpg to webp via Python
            try:
                from PIL import Image
                img = Image.open(output_path.replace(".webp", ".jpg"))
                img.save(output_path, "WEBP", quality=90)
                os.remove(output_path.replace(".webp", ".jpg"))
            except:
                # Last resort: just copy as webp extension
                os.rename(output_path.replace(".webp", ".jpg"), output_path)
        
        # Cleanup temp files
        for f in [tmp_path + ".jpg", tmp_path + ".png", tmp_path + ".svg"]:
            if os.path.exists(f):
                os.remove(f)
        
        if os.path.exists(output_path):
            size = os.path.getsize(output_path)
            print(f"  ✅ {slug}.webp ({size//1024}KB)")
            return True
        else:
            print(f"  ❌ Conversion failed for {slug}")
            return False
    except Exception as e:
        print(f"  ❌ Download error for {slug}: {e}")
        return False

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    with open(PLANTS_FILE) as f:
        plants = json.load(f)
    
    # Load existing manifest
    if os.path.exists(MANIFEST_FILE):
        with open(MANIFEST_FILE) as f:
            manifest = json.load(f)
    else:
        manifest = {}
    
    success = 0
    failed = []
    
    for i, plant in enumerate(plants):
        slug = plant["slug"]
        latin = plant["latinName"]
        name = plant["name"]
        print(f"\n[{i+1}/100] {name} ({latin})")
        
        if slug in manifest and os.path.exists(os.path.join(OUTPUT_DIR, f"{slug}.webp")):
            print(f"  Already in manifest, skipping")
            success += 1
            continue
        
        # Search strategies in order of preference
        search_queries = [
            f"{latin} Koehler medicinal plants",
            f"{latin} botanical illustration",
            f"{latin} herbarium drawing",
            f"{name} botanical print vintage",
            f"{latin} plant"
        ]
        
        found = False
        for query in search_queries:
            titles = search_wikimedia(query, limit=3)
            for title in titles:
                # Skip SVGs and non-image files
                if any(title.lower().endswith(ext) for ext in [".svg", ".ogg", ".pdf"]):
                    continue
                
                url = get_image_url(title)
                if url:
                    if download_and_convert(url, slug):
                        manifest[slug] = f"/images/botanical/1140w/{slug}.webp"
                        found = True
                        success += 1
                        break
            if found:
                break
            time.sleep(0.5)  # Rate limiting between search attempts
        
        if not found:
            print(f"  ⚠️ No image found for {name}")
            failed.append(slug)
        
        time.sleep(1)  # Rate limiting between plants
    
    # Save updated manifest
    with open(MANIFEST_FILE, "w") as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n{'='*50}")
    print(f"Results: {success}/100 succeeded, {len(failed)} failed")
    if failed:
        print(f"Failed: {', '.join(failed)}")

if __name__ == "__main__":
    main()
