import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SALON = path.join(ROOT, "salon");
const BRAND = path.join(ROOT, "public", "brand");
const IMAGES = path.join(ROOT, "public", "images", "salon");
const OG = path.join(ROOT, "public", "og");
const APP = path.join(ROOT, "app");

const LOGO_FILE = "WhatsApp Image 2026-10-18 at 11.27.57.jpeg";

// Circle measured from the supplied logo: x 78–1000, y 82–1017.
const CIRCLE = { left: 69, top: 79, size: 940 };
// White lettering measured inside the circle.
const WORDMARK = { left: 120, top: 470, width: 844, height: 148 };

async function ensureDirs() {
  for (const dir of [BRAND, IMAGES, OG, APP]) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function makeMark() {
  const source = path.join(SALON, LOGO_FILE);
  const circle = await sharp(source)
    .extract({
      left: CIRCLE.left,
      top: CIRCLE.top,
      width: CIRCLE.size,
      height: CIRCLE.size,
    })
    .resize(1024, 1024)
    .png()
    .toBuffer();

  const mask = Buffer.from(
    `<svg width="1024" height="1024"><circle cx="512" cy="512" r="512" fill="#fff"/></svg>`,
  );

  const mark = await sharp(circle)
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  await sharp(mark).resize(1024, 1024).png().toFile(path.join(BRAND, "hair-and-co-mark.png"));
  await sharp(mark).resize(512, 512).png().toFile(path.join(BRAND, "hair-and-co-mark-512.png"));
  await sharp(mark).resize(128, 128).png().toFile(path.join(BRAND, "hair-and-co-mark-128.png"));
  await sharp(mark).resize(512, 512).png().toFile(path.join(APP, "icon.png"));
  await sharp(mark).resize(180, 180).png().toFile(path.join(APP, "apple-icon.png"));

  return mark;
}

async function makeWordmarks() {
  const source = path.join(SALON, LOGO_FILE);
  const region = await sharp(source)
    .extract(WORDMARK)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = region;
  const pixels = info.width * info.height;

  async function build(file: string, rgb: [number, number, number]) {
    const rgba = Buffer.alloc(pixels * 4);
    for (let i = 0; i < pixels; i++) {
      rgba[i * 4] = rgb[0];
      rgba[i * 4 + 1] = rgb[1];
      rgba[i * 4 + 2] = rgb[2];
      rgba[i * 4 + 3] = data[i];
    }
    await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
      .trim({ threshold: 1 })
      .png()
      .toFile(path.join(BRAND, file));
  }

  await build("wordmark-black.png", [11, 11, 11]);
  await build("wordmark-white.png", [255, 255, 255]);
}

async function makePhotos() {
  const photos: Array<{ source: string; out: string; crop?: boolean }> = [
    { source: "WhatsApp Image 2026-10-18 at 11.29.31 (1).jpeg", out: "hero.webp" },
    { source: "WhatsApp Image 2026-10-18 at 11.29.31.jpeg", out: "salon-floor.webp" },
    { source: "WhatsApp Image 2026-10-18 at 11.29.00.jpeg", out: "styling-station.webp" },
    { source: "WhatsApp Image 2026-10-18 at 11.29.30 (1).jpeg", out: "mirror-station.webp" },
    { source: "WhatsApp Image 2026-10-18 at 11.29.30.jpeg", out: "wash-house.webp" },
    { source: "WhatsApp Image 2026-10-18 at 11.29.30.jpeg", out: "detail.webp", crop: true },
  ];

  for (const photo of photos) {
    const input = sharp(path.join(SALON, photo.source)).rotate();
    if (photo.crop) {
      input.extract({ left: 220, top: 380, width: 1300, height: 1625 });
    }
    await input
      .resize({ width: 1600, height: photo.crop ? 2000 : 1600, fit: "cover", withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(path.join(IMAGES, photo.out));
  }
}

async function makeOg(mark: Buffer) {
  const wordmark = await sharp(path.join(BRAND, "wordmark-white.png"))
    .resize({ width: 720 })
    .png()
    .toBuffer();

  const wordmarkMeta = await sharp(wordmark).metadata();
  const wmWidth = wordmarkMeta.width ?? 720;
  const wmHeight = wordmarkMeta.height ?? 108;
  const wmTop = 205;
  const lineTop = wmTop + wmHeight + 56;

  const label = Buffer.from(
    `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <text x="600" y="${lineTop + 72}" text-anchor="middle" fill="#ffffff" opacity="0.72"
        font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="8">NEWPORT · SYDNEY</text>
    </svg>`,
  );

  const base = sharp({
    create: { width: 1200, height: 630, channels: 4, background: "#0b0b0b" },
  }).png();

  await base
    .composite([
      { input: wordmark, left: Math.round((1200 - wmWidth) / 2), top: wmTop },
      {
        input: Buffer.from(
          `<svg width="1200" height="630"><rect x="500" y="${lineTop}" width="200" height="1" fill="#ffffff" opacity="0.35"/></svg>`,
        ),
        left: 0,
        top: 0,
      },
      { input: label, left: 0, top: 0 },
    ])
    .jpeg({ quality: 88 })
    .toFile(path.join(OG, "hair-and-co.jpg"));

  // Small mark is also rendered for use in emails/social where the wordmark is too wide.
  await sharp(mark)
    .resize(400, 400)
    .png()
    .toFile(path.join(OG, "hair-and-co-mark.png"));
}

async function main() {
  await ensureDirs();
  const mark = await makeMark();
  await makeWordmarks();
  await makePhotos();
  await makeOg(mark);
  console.log("Assets prepared in public/brand, public/images/salon, public/og and app/");
}

main();
