"""Remove near-white background from product photo and export hero asset."""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image


def remove_white_background(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    arr = np.array(rgba, dtype=np.float32)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    max_rgb = np.maximum(np.maximum(r, g), b)
    min_rgb = np.minimum(np.minimum(r, g), b)
    sat = max_rgb - min_rgb
    white_score = np.clip((max_rgb - 198.0) / 57.0, 0.0, 1.0) * np.clip(1.0 - sat / 40.0, 0.0, 1.0)
    arr[..., 3] = np.clip(a * (1.0 - white_score), 0, 255)
    out = Image.fromarray(arr.astype(np.uint8), "RGBA")
    bbox = out.getbbox()
    return out.crop(bbox) if bbox else out


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    default_src = (
        Path.home()
        / "AppData"
        / "Roaming"
        / "Cursor"
        / "User"
        / "workspaceStorage"
        / "473bc95f4f3be156d2ebe00ede362b4a"
        / "images"
        / "30ch39r-dn400-117c8968-6448-47f4-acd2-46b10d71da37-e2855b31-071f-4bae-bc5d-2951e85a3c60.png"
    )
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else default_src
    out_dir = root / "public" / "images"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_png = out_dir / "hero-valve.png"
    out_webp = out_dir / "hero-valve.webp"

    img = Image.open(src)
    cutout = remove_white_background(img)
    cutout.save(out_png, optimize=True)
    # optional webp via pillow if available
    try:
        cutout.save(out_webp, format="WEBP", quality=92, method=6)
    except Exception:
        pass

    print(f"source={src}")
    print(f"saved={out_png} size={cutout.size}")
    if out_webp.exists():
        print(f"saved={out_webp}")


if __name__ == "__main__":
    main()
