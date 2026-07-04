#!/usr/bin/env python3
"""generate-splash.py — Generate Android splash screen images at 9 sizes.

Generates portrait + landscape splash screens for:
  - mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi
Uses a solid background color with centered text overlay.

Portrait sizes (px):
  mdpi:   320x480
  hdpi:   480x800
  xhdpi:  720x1280
  xxhdpi: 960x1600
  xxxhdpi: 1440x2560

Landscape sizes (px):
  mdpi:   480x320
  hdpi:   800x480
  xhdpi:  1280x720
  xxhdpi: 1600x960
  xxxhdpi: 2560x1440

Usage:
  ./generate-splash.py --background "#2196F3" --text "My App" [--output-dir ./res]
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("ERROR: Pillow is required. Install with: pip3 install Pillow")
    sys.exit(1)


# Splash sizes: (width, height) for portrait mode per density
SPLASH_SIZES_PORTRAIT = {
    "mdpi": (320, 480),
    "hdpi": (480, 800),
    "xhdpi": (720, 1280),
    "xxhdpi": (960, 1600),
    "xxxhdpi": (1440, 2560),
}

# Landscape: swapped width/height
SPLASH_SIZES_LANDSCAPE = {
    density: (h, w) for density, (w, h) in SPLASH_SIZES_PORTRAIT.items()
}


def hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color string to RGB tuple."""
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 3:
        hex_color = "".join(c * 2 for c in hex_color)
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def create_splash(
    width: int,
    height: int,
    bg_color: str,
    text: str,
    text_color: str = "#FFFFFF",
    output_path: Path = None,
) -> Image.Image:
    """Create a splash screen image with background color and centered text."""
    bg_rgb = hex_to_rgb(bg_color)
    text_rgb = hex_to_rgb(text_color)

    img = Image.new("RGB", (width, height), bg_rgb)
    draw = ImageDraw.Draw(img)

    # Try to find a suitable font
    font = None
    font_size = max(width, height) // 12  # Scale font to image size

    font_paths = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/System/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/TTF/DejaVuSans.ttf",
    ]

    # On macOS, Helvetica is typically in the system fonts
    try:
        import subprocess
        fc_list = subprocess.run(
            ["fc-list", ":lang=en"], capture_output=True, text=True, timeout=3
        )
        if fc_list.returncode == 0:
            # Try to find a font from fc-list
            for line in fc_list.stdout.split("\n"):
                if "DejaVuSans" in line or "Arial" in line or "Helvetica" in line:
                    font_path = line.split(":")[0].strip()
                    font_paths.insert(0, font_path)
                    break
    except Exception:
        pass

    for fp in font_paths:
        try:
            font = ImageFont.truetype(fp, font_size)
            break
        except (IOError, OSError):
            continue

    if font is None:
        font = ImageFont.load_default()

    # Center text
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
    except AttributeError:
        # Fallback for older Pillow
        text_w, text_h = draw.textsize(text, font=font)

    x = (width - text_w) // 2
    y = (height - text_h) // 2

    # Draw shadow for readability
    draw.text((x + 2, y + 2), text, font=font, fill=(0, 0, 0, 80))
    draw.text((x, y), text, font=font, fill=text_rgb)

    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        img.save(str(output_path), "PNG")
        print(f"  Created: {output_path} ({width}x{height})")

    return img


def generate_splash_screens(
    bg_color: str, text: str, text_color: str, output_dir: str
) -> None:
    """Generate all 9 splash screen variants."""
    output_base = Path(output_dir)
    print(f"Generating splash screens:")
    print(f"  Background color: {bg_color}")
    print(f"  Text: '{text}'")
    print(f"  Output: {output_dir}")
    print()

    # Portrait splash screens
    print("--- Portrait ---")
    for density, (width, height) in SPLASH_SIZES_PORTRAIT.items():
        out_path = (
            output_base / f"drawable-{density}" / "splash_portrait.png"
        )
        create_splash(width, height, bg_color, text, text_color, out_path)

    # Landscape splash screens
    print("--- Landscape ---")
    for density, (width, height) in SPLASH_SIZES_LANDSCAPE.items():
        out_path = (
            output_base / f"drawable-{density}" / "splash_landscape.png"
        )
        create_splash(width, height, bg_color, text, text_color, out_path)

    # Also generate a default (portrait mdpi sized) for fallback
    default_path = output_base / "drawable" / "splash.png"
    create_splash(
        SPLASH_SIZES_PORTRAIT["mdpi"][0],
        SPLASH_SIZES_PORTRAIT["mdpi"][1],
        bg_color,
        text,
        text_color,
        default_path,
    )

    print()
    print(f"All 9+ splash screens generated in '{output_dir}'")
    print("Copy the drawable-* directories into android/app/src/main/res/")


def main():
    parser = argparse.ArgumentParser(
        description="Generate Android splash screen images for all densities."
    )
    parser.add_argument(
        "--background",
        default="#2196F3",
        help="Background color in hex (default: #2196F3 Material Blue)",
    )
    parser.add_argument(
        "--text",
        default="My App",
        help="Centered text on splash screen (default: 'My App')",
    )
    parser.add_argument(
        "--text-color",
        default="#FFFFFF",
        help="Text color in hex (default: #FFFFFF)",
    )
    parser.add_argument(
        "--output-dir",
        default="./res",
        help="Output directory (default: ./res)",
    )
    args = parser.parse_args()

    generate_splash_screens(args.background, args.text, args.text_color, args.output_dir)


if __name__ == "__main__":
    main()
