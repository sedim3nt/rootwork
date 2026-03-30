#!/usr/bin/env python3
"""
Fetch botanical illustrations from Wikimedia Commons for each plant.
Searches by latin name, downloads the best illustration, resizes to 1140w webp.
"""

import json
import os
import re
import time
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path

PLANTS_JSON = Path(__file__).parent.parent / "src" / "data" / "plants.json"
RAW_DIR = Path(__file__).parent.parent / "public" / "images" / "botanical" / "raw"
SIZED_DIR = Path(__file__).parent.parent / "public" / "images" / "botanical" / "1140w"

RAW_DIR.mkdir(parents=True, exist_ok=True)
SIZED_DIR.mkdir(parents=True, exist_ok=True)

def search_wikimedia(query):
    """Search Wikimedia Commons for botanical illustration."""
    # Try multiple search strategies
    searches = [
        f"{query} botanical illustration",
        f"{query} botanical drawing",
        f"{query} botanical plate",
        f"{query} Köhler",  # Köhler's Medicinal Plants - famous reference
        f"{query} botanical",
    ]
    
    for search_query in searches:
        params = urllib.parse.urlencode({
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": f"filetype:bitmap {search_query}",
            "gsrnamespace": "6",  # File namespace
            "gsrlimit": "5",
            "prop": "imageinfo",
            "iiprop": "url|size|mime",
            "iiurlwidth": "1400",
        })
        
        url = f"https://commons.wikimedia.org/w/api.php?{params}"
        req = urllib.request.Request(url, headers={"User-Agent": "Rootwork/1.0 (spirittree.dev)"})
        
        try:
            resp = urllib.request.urlopen(req, timeout=15)
            data = json.loads(resp.read())
            pages = data.get("query", {}).get("pages", {})
            
            # Filter for actual botanical illustrations (prefer larger images)
            candidates = []
            for page_id, page in pages.items():
                info = page.get("imageinfo", [{}])[0]
                width = info.get("width", 0)
                height = info.get("height", 0)
                mime = info.get("mime", "")
                title = page.get("title", "").lower()
                
                # Skip tiny images, non-images, and photos (prefer illustrations)
                if width < 800 or "image/" not in mime:
                    continue
                
                # Prefer illustrations over photos
                score = 0
                if "illustration" in title or "botanical" in title or "plate" in title:
                    score += 10
                if "köhler" in title or "koehler" in title:
                    score += 15  # Köhler's is the gold standard
                if "drawing" in title or "sketch" in title:
                    score += 5
                if width >= 1200:
                    score += 3
                if "photo" in title or "photograph" in title:
                    score -= 10
                    
                thumb_url = info.get("thumburl") or info.get("url")
                orig_url = info.get("url")
                
                candidates.append({
                    "title": page.get("title", ""),
                    "url": orig_url,
                    "thumb_url": thumb_url,
                    "width": width,
                    "height": height,
                    "score": score,
                })
            
            if candidates:
                # Return best scoring candidate
                candidates.sort(key=lambda c: c["score"], reverse=True)
                return candidates[0]
                
        except Exception as e:
            continue
    
    return None


def download_image(url, dest_path):
    """Download image to path."""
    req = urllib.request.Request(url, headers={"User-Agent": "Rootwork/1.0 (spirittree.dev)"})
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        with open(dest_path, "wb") as f:
            f.write(resp.read())
        return True
    except Exception as e:
        print(f"    Download error: {e}")
        return False


def resize_to_webp(src_path, dest_path, target_width=1140):
    """Resize image to target width and save as lossless webp."""
    try:
        from PIL import Image
        im = Image.open(src_path)
        
        # Calculate new height maintaining aspect ratio
        ratio = target_width / im.width
        new_height = int(im.height * ratio)
        
        # Only resize if larger than target
        if im.width > target_width:
            im = im.resize((target_width, new_height), Image.LANCZOS)
        
        # Convert to RGB if needed (some PNGs have alpha)
        if im.mode in ("RGBA", "P"):
            im = im.convert("RGB")
        
        im.save(dest_path, "WEBP", lossless=True)
        return True
    except Exception as e:
        print(f"    Resize error: {e}")
        return False


def main():
    with open(PLANTS_JSON) as f:
        plants = json.load(f)
    
    print(f"Processing {len(plants)} plants...")
    
    found = 0
    failed = []
    
    for i, plant in enumerate(plants):
        slug = plant["slug"]
        name = plant["name"]
        latin = plant["latinName"]
        
        raw_path = RAW_DIR / f"{slug}.jpg"
        webp_path = SIZED_DIR / f"{slug}.webp"
        
        # Skip if already processed
        if webp_path.exists():
            print(f"[{i+1}/{len(plants)}] {name} — already done")
            found += 1
            continue
        
        print(f"[{i+1}/{len(plants)}] {name} ({latin})...")
        
        # Search by latin name first (more specific)
        result = search_wikimedia(latin)
        
        if not result:
            # Try common name
            result = search_wikimedia(name)
        
        if not result:
            print(f"    ❌ No illustration found")
            failed.append(slug)
            time.sleep(1)
            continue
        
        print(f"    Found: {result['title'][:60]} ({result['width']}x{result['height']}, score={result['score']})")
        
        # Download
        if not raw_path.exists():
            if not download_image(result["url"], str(raw_path)):
                failed.append(slug)
                time.sleep(1)
                continue
        
        # Resize to 1140w webp
        if resize_to_webp(str(raw_path), str(webp_path)):
            found += 1
            print(f"    ✅ Saved {webp_path.name}")
        else:
            failed.append(slug)
        
        # Rate limit: 1 request per second for Wikimedia
        time.sleep(1.5)
    
    print(f"\nDone: {found} found, {len(failed)} failed")
    if failed:
        print(f"Failed: {', '.join(failed)}")
    
    # Write manifest
    manifest = {}
    for f in SIZED_DIR.glob("*.webp"):
        manifest[f.stem] = f"/images/botanical/1140w/{f.name}"
    
    manifest_path = Path(__file__).parent.parent / "src" / "data" / "plant-images.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"Manifest written: {len(manifest)} images")


if __name__ == "__main__":
    main()
