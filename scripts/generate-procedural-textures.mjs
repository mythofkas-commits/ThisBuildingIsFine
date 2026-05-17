import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { deflateSync } from "node:zlib";

const root = process.cwd();

const assets = [
  {
    path: "public/assets/textures/generated/m9-office-carpet.png",
    width: 256,
    height: 256,
    pixel: carpetPixel
  },
  {
    path: "public/assets/textures/generated/m9-wall-subtle-variation.png",
    width: 256,
    height: 256,
    pixel: wallPixel
  },
  {
    path: "public/assets/textures/generated/m9-ceiling-tile-light-panel.png",
    width: 256,
    height: 256,
    pixel: ceilingPixel
  },
  {
    path: "public/assets/textures/generated/m9-elevator-checkout-panel.png",
    width: 256,
    height: 256,
    pixel: elevatorPixel
  },
  {
    path: "public/assets/textures/generated/m9-incident-report-paper.png",
    width: 256,
    height: 256,
    pixel: paperPixel
  },
  {
    path: "public/assets/textures/generated/m9-clarity-abstract-overlay.png",
    width: 256,
    height: 256,
    pixel: clarityPixel
  }
];

const posters = [
  {
    path: "public/assets/posters/generated/m9-policy-poster-hallway.svg",
    title: "PLEASE MAINTAIN",
    subtitle: "UNCERTAINTY",
    footer: "Compliance appreciates flexible certainty.",
    accent: "#8d9a83"
  },
  {
    path: "public/assets/posters/generated/m9-policy-poster-meeting.svg",
    title: "OPTIONAL MEETINGS",
    subtitle: "MAY ATTEND YOU",
    footer: "Attendance is a two-way hallway.",
    accent: "#9a8f66"
  },
  {
    path: "public/assets/posters/generated/m9-policy-poster-records.svg",
    title: "FORMS REMEMBER",
    subtitle: "VERSION HISTORY",
    footer: "Please initial any memory you disturb.",
    accent: "#8b7f75"
  },
  {
    path: "public/assets/posters/generated/m9-meeting-agenda-card.svg",
    title: "AGENDA",
    subtitle: "ITEM 1: YOU",
    footer: "Item 2: minutes disagree politely.",
    accent: "#a66f55"
  }
];

for (const asset of assets) {
  writeFile(asset.path, encodePng(asset.width, asset.height, asset.pixel));
}

for (const poster of posters) {
  writeFile(poster.path, posterSvg(poster));
}

console.log(`Generated ${assets.length + posters.length} M9 procedural visual assets.`);

function writeFile(path, content) {
  const absolutePath = join(root, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content);
}

function encodePng(width, height, pixel) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let offset = 0;

  for (let y = 0; y < height; y += 1) {
    raw[offset] = 0;
    offset += 1;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a = 255] = pixel(x, y, width, height);
      raw[offset++] = clamp(r);
      raw[offset++] = clamp(g);
      raw[offset++] = clamp(b);
      raw[offset++] = clamp(a);
    }
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", Buffer.concat([
      uint32(width),
      uint32(height),
      Buffer.from([8, 6, 0, 0, 0])
    ])),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  return Buffer.concat([
    uint32(data.length),
    typeBuffer,
    data,
    uint32(crc32(Buffer.concat([typeBuffer, data])))
  ]);
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0);
  return buffer;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function noise(x, y, seed = 1) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

function carpetPixel(x, y) {
  const weave = (x % 16 === 0 || y % 16 === 0) ? -10 : 0;
  const thread = Math.sin(x * 0.45) * 5 + Math.cos(y * 0.33) * 4;
  const speck = noise(x, y, 2) > 0.985 ? 18 : 0;
  return [116 + weave + thread + speck, 111 + weave + thread, 86 + weave + thread / 2, 255];
}

function wallPixel(x, y) {
  const seam = x % 96 < 2 ? -9 : 0;
  const panel = Math.floor(x / 96) % 2 === 0 ? 4 : -2;
  const scuff = noise(x, y, 3) > 0.992 ? -18 : 0;
  return [187 + seam + panel + scuff, 184 + seam + panel + scuff, 160 + seam + panel + scuff, 255];
}

function ceilingPixel(x, y) {
  const grid = x % 64 < 2 || y % 64 < 2 ? -18 : 0;
  const light = x > 88 && x < 168 && y > 102 && y < 154 ? 28 : 0;
  const grit = (noise(x, y, 4) - 0.5) * 9;
  return [211 + grid + light + grit, 209 + grid + light + grit, 185 + grid + light + grit, 255];
}

function elevatorPixel(x, y) {
  const band = Math.floor(x / 34) % 2 === 0 ? 12 : -8;
  const brush = Math.sin(y * 0.7) * 5;
  const button = (x - 206) ** 2 + (y - 72) ** 2 < 210 || (x - 206) ** 2 + (y - 122) ** 2 < 210 ? 34 : 0;
  return [101 + band + brush + button, 104 + band + brush + button, 98 + band + brush + button, 255];
}

function paperPixel(x, y) {
  const rule = y % 34 === 0 ? -18 : 0;
  const margin = x > 30 && x < 34 ? -24 : 0;
  const stamp = x > 154 && x < 230 && y > 34 && y < 70 ? 22 : 0;
  const fiber = (noise(x, y, 5) - 0.5) * 10;
  return [232 + rule + margin + fiber, 224 + rule + margin - stamp / 3 + fiber, 199 + rule + margin - stamp + fiber, 255];
}

function clarityPixel(x, y) {
  const base = 198 + (noise(x, y, 6) - 0.5) * 8;
  const lineA = Math.abs((x + y * 0.62) % 58 - 29) < 1.6 ? 36 : 0;
  const lineB = Math.abs((x * 0.8 - y) % 74 - 37) < 1.4 ? 28 : 0;
  return [base - lineB, base + lineA, base + lineB, 210];
}

function posterSvg({ title, subtitle, footer, accent }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="704" viewBox="0 0 512 704">
  <rect width="512" height="704" fill="#eee4c8"/>
  <rect x="0" y="0" width="512" height="84" fill="${accent}"/>
  <rect x="36" y="122" width="440" height="432" fill="#f7f0da" stroke="#3a3429" stroke-width="8"/>
  <path d="M64 586H448M64 620H382M64 654H420" stroke="#b9ad87" stroke-width="10" stroke-linecap="square"/>
  <path d="M82 174H430M82 468H430" stroke="${accent}" stroke-width="14"/>
  <text x="256" y="66" font-family="Arial, sans-serif" font-size="34" fill="#2f2b22" text-anchor="middle" font-weight="700">BUILDING POLICY</text>
  <text x="256" y="270" font-family="Arial, sans-serif" font-size="46" fill="#2f2b22" text-anchor="middle" font-weight="700">${escapeXml(title)}</text>
  <text x="256" y="336" font-family="Arial, sans-serif" font-size="42" fill="#2f2b22" text-anchor="middle" font-weight="700">${escapeXml(subtitle)}</text>
  <text x="256" y="410" font-family="Arial, sans-serif" font-size="25" fill="#554d3c" text-anchor="middle">${escapeXml(footer)}</text>
  <text x="256" y="676" font-family="Arial, sans-serif" font-size="20" fill="#665d49" text-anchor="middle">Form M9-visual / Retain until replaced</text>
</svg>
`;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
