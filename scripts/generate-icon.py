#!/usr/bin/env python3
"""generate-icon.py — Generate Android adaptive icons from a source image.

Takes an input image and generates:
  - icon-{48,72,96,144,192,512}.png for various resolutions
  - ic_launcher.xml for adaptive icon configuration
  - ic_launcher_round.xml for round adaptive icon

Usage:
  ./generate-icon.py input.png [--output-dir ./res]
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow is required. Install with: pip3 install Pillow")
    sys.exit(1)


# Standard Android icon sizes
ICON_SIZES = {
    48: "mdpi",
    72: "hdpi",
    96: "xhdpi",
    144: "xxhdpi",
    192: "xxxhdpi",
    512: "playstore",
}

# Adaptive icon XML template
ADAPTIVE_ICON_XML = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
"""

ADAPTIVE_ICON_ROUND_XML = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
"""

IC_BACKGROUND_COLOR_XML = """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
"""


def resize_and_save(img: Image.Image, size: int, output_path: Path) -> None:
    """Resize an image to the given size (square) and save as PNG."""
    resized = img.resize((size, size), Image.LANCZOS)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    resized.save(str(output_path), "PNG")
    print(f"  Created: {output_path} ({size}x{size})")


def generate_icons(input_path: str, output_dir: str = "./res") -> None:
    """Generate all icon sizes and XML configurations."""
    # Open input image
    img = Image.open(input_path)

    # Convert to RGBA if not already
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    # Ensure square — crop to center square if not
    w, h = img.size
    if w != h:
        size = min(w, h)
        left = (w - size) // 2
        top = (h - size) // 2
        img = img.crop((left, top, left + size, top + size))
        print(f"  Cropped image to {size}x{size} (center square)")

    output_base = Path(output_dir)
    print(f"Generating icons from: {input_path}")
    print(f"Output directory: {output_dir}")
    print()

    # Generate all size variants
    for size, qualifier in ICON_SIZES.items():
        # Standard mipmap directory
        if qualifier == "playstore":
            out_path = output_base / "playstore" / f"icon-{size}.png"
        else:
            out_path = output_base / f"mipmap-{qualifier}" / f"icon-{size}.png"
        resize_and_save(img, size, out_path)

    # Generate ic_launcher foreground (use the 192px version as foreground)
    foreground_dir = output_base / "mipmap-anydpi-v26"
    foreground_dir.mkdir(parents=True, exist_ok=True)

    # Copy the 192px version as the foreground drawable
    foreground_img = img.resize((192, 192), Image.LANCZOS)
    foreground_path = foreground_dir / "ic_launcher_foreground.png"
    foreground_img.save(str(foreground_path), "PNG")
    print(f"  Created: {foreground_path} (foreground for adaptive icon)")

    # Also create in each mipmap density
    for qualifier in ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"]:
        fg_dir = output_base / f"mipmap-{qualifier}"
        fg_img_path = fg_dir / "ic_launcher_foreground.png"
        fg_img = img.resize((48, 48), Image.LANCZOS)
        fg_img.save(str(fg_img_path), "PNG")

    # Generate XML files
    xml_dir = output_base / "mipmap-anydpi-v26"
    xml_dir.mkdir(parents=True, exist_ok=True)

    ic_launcher_path = xml_dir / "ic_launcher.xml"
    ic_launcher_path.write_text(ADAPTIVE_ICON_XML)
    print(f"  Created: {ic_launcher_path}")

    ic_launcher_round_path = xml_dir / "ic_launcher_round.xml"
    ic_launcher_round_path.write_text(ADAPTIVE_ICON_ROUND_XML)
    print(f"  Created: {ic_launcher_round_path}")

    # Generate color resource
    values_dir = output_base / "values"
    values_dir.mkdir(parents=True, exist_ok=True)
    colors_path = values_dir / "ic_launcher_background.xml"
    colors_path.write_text(IC_BACKGROUND_COLOR_XML)
    print(f"  Created: {colors_path}")

    print()
    print("All icons and XML configuration generated successfully!")
    print(f"Copy the contents of '{output_dir}' into your android/app/src/main/res/ directory.")
    print("Or for Capacitor: copy into android/app/src/main/res/")


def main():
    parser = argparse.ArgumentParser(
        description="Generate Android adaptive icons from a source image."
    )
    parser.add_argument("input", help="Input image file (PNG, JPG, etc.)")
    parser.add_argument(
        "--output-dir",
        default="./res",
        help="Output directory for generated resources (default: ./res)",
    )
    args = parser.parse_args()

    if not os.path.isfile(args.input):
        print(f"ERROR: Input file not found: {args.input}")
        sys.exit(1)

    generate_icons(args.input, args.output_dir)


if __name__ == "__main__":
    main()
