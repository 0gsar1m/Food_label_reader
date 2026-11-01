"""Generate original geometric app marks and a fictional test label; requires Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)
PAPER = "#F6F4ED"
GREEN = "#455B36"


def mark(size: int, transparent: bool = False) -> Image.Image:
    """Use a label and scan corners with generous Android adaptive-icon safe margins."""
    image = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0) if transparent else PAPER)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((350, 280, 674, 744), radius=12, outline=GREEN, width=16)
    for y, end in [(380, 604), (433, 604), (486, 560), (590, 604), (640, 550)]:
        draw.line((414, y, end, y), fill=GREEN, width=14)
    for points in [[(300, 370), (300, 230), (440, 230)], [(584, 230), (724, 230), (724, 370)], [(300, 654), (300, 794), (440, 794)], [(584, 794), (724, 794), (724, 654)]]:
        draw.line(points, fill=GREEN, width=18, joint="curve")
    draw.line((260, 535, 764, 535), fill=GREEN, width=12)
    return image.resize((size, size), Image.Resampling.LANCZOS)


mark(1024).save(ASSETS / "icon.png")
mark(1024, True).save(ASSETS / "adaptive-icon.png")
mark(64).save(ASSETS / "favicon.png")
label = Image.new("RGB", (1000, 750), PAPER)
draw = ImageDraw.Draw(label)
font_path = Path("C:/Windows/Fonts/arial.ttf")
font = ImageFont.truetype(str(font_path), 30) if font_path.exists() else ImageFont.load_default()
lines = ["ORNEK ETIKET / Kurgu urun", "Kakaolu yulafli biskuvi", "Icindekiler: Yulaf ezmesi (%32), bugday unu,", "seker, aycicek yagi, kakao (%6), yagsiz sut tozu,", "kabartici (sodyum hidrojen karbonat, E500), tuz.", "Alerjenler: Gluten ve sut icerir.", "Eser miktarda findik ve soya icerebilir."]
for index, line in enumerate(lines):
    draw.text((55, 70 + index * 75), line, fill=GREEN, font=font)
fixture_dir = ROOT / "tests" / "fixtures"
fixture_dir.mkdir(parents=True, exist_ok=True)
label.save(fixture_dir / "example-label.jpg", quality=90)
