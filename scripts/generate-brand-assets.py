from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
APP = ROOT / "app"


def font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()


def centered_text(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], text: str, image_font, fill):
    bbox = draw.textbbox((0, 0), text, font=image_font)
    width = bbox[2] - bbox[0]
    height = bbox[3] - bbox[1]
    x = box[0] + (box[2] - box[0] - width) / 2 - bbox[0]
    y = box[1] + (box[3] - box[1] - height) / 2 - bbox[1]
    draw.text((x, y), text, font=image_font, fill=fill)


def draw_mark(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size), "#5ee4ad")
    draw = ImageDraw.Draw(img)
    pad = max(2, size // 12)
    draw.rectangle((pad, pad, size - pad, size - pad), outline="#06100c", width=max(1, size // 28))
    centered_text(draw, (0, 0, size, size), "F", font(int(size * 0.58), True), "#06100c")
    return img


def draw_og() -> Image.Image:
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), "#07090b")
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, w, h), fill="#07090b")
    draw.rectangle((64, 64, 208, 208), fill="#5ee4ad")
    centered_text(draw, (64, 64, 208, 208), "F", font(86, True), "#06100c")
    draw.text((240, 82), "Finansanalytik", font=font(54, True), fill="#f8fafc")
    draw.text((242, 150), "DAGLIG MARKNADSANALYS", font=font(20, True), fill="#9fb3c8")
    draw.text((72, 286), "Få dagens marknadsbild gratis", font=font(66, True), fill="#f8fafc")
    draw.text(
        (76, 378),
        "Svensk marknadsbrief med 10 analysområden, primärkällor och daglig data.",
        font=font(30, False),
        fill="#c7d1dd",
    )
    labels = ["Makro", "Ränta", "Börs", "Valutor", "Råvaror", "Riskbild"]
    x, y = 76, 476
    for label in labels:
        text_w = draw.textbbox((0, 0), label, font=font(22, True))[2]
        draw.rectangle((x, y, x + text_w + 36, y + 48), outline="#26313d", width=2, fill="#0d1117")
        draw.text((x + 18, y + 12), label, font=font(22, True), fill="#5ee4ad")
        x += text_w + 52
    return img


def main():
    PUBLIC.mkdir(parents=True, exist_ok=True)
    for size, name in [
        (48, "favicon-48.png"),
        (192, "icon-192.png"),
        (512, "icon-512.png"),
        (180, "apple-touch-icon.png"),
    ]:
        draw_mark(size).save(PUBLIC / name)
    draw_mark(256).convert("RGBA").save(
        APP / "favicon.ico",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )
    draw_og().save(PUBLIC / "og-finansanalytik.png", optimize=True)


if __name__ == "__main__":
    main()
