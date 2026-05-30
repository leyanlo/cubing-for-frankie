import { mkdir, writeFile } from "node:fs/promises";

const outDir = new URL("../diagrams/", import.meta.url);

const colors = {
  white: "#ffffff",
  yellow: "#ffd33d",
  blue: "#3f73d8",
  green: "#4aa564",
  red: "#df5a4f",
  orange: "#f19a3e",
  neutral: "#cbd5e1",
  gray: "#94a3b8",
  dark: "#15191f",
  ink: "#3151ad",
};

function cellGrid(face) {
  return Array.from({ length: 9 }, (_, index) => face?.[index] ?? colors.neutral);
}

function interp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function quadPoint(q, u, v) {
  const top = interp(q[0], q[1], u);
  const bottom = interp(q[3], q[2], u);
  return interp(top, bottom, v);
}

function polygon(points, fill, stroke = colors.dark, width = 1.7) {
  const d = points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
  return `<polygon points="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
}

function drawFace(q, face) {
  const cells = cellGrid(face);
  let svg = "";
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const u0 = col / 3;
      const u1 = (col + 1) / 3;
      const v0 = row / 3;
      const v1 = (row + 1) / 3;
      svg += polygon(
        [
          quadPoint(q, u0, v0),
          quadPoint(q, u1, v0),
          quadPoint(q, u1, v1),
          quadPoint(q, u0, v1),
        ],
        cells[row * 3 + col],
      );
    }
  }
  return svg;
}

function arrow({ x1, y1, x2, y2, color = colors.ink, heads = "end" }) {
  const vector = { x: x2 - x1, y: y2 - y1 };
  const vectorLength = Math.hypot(vector.x, vector.y) || 1;
  const unit = { x: vector.x / vectorLength, y: vector.y / vectorLength };
  const perp = { x: -unit.y, y: unit.x };
  const headLength = 11;
  const headWidth = 9;
  const hasStartHead = heads === "both" || heads === "start";
  const hasEndHead = heads === "both" || heads === "end";
  const startBase = hasStartHead ? { x: x1 + unit.x * headLength, y: y1 + unit.y * headLength } : { x: x1, y: y1 };
  const endBase = hasEndHead ? { x: x2 - unit.x * headLength, y: y2 - unit.y * headLength } : { x: x2, y: y2 };
  const head = (tip, base) => [
    tip,
    { x: base.x + perp.x * headWidth / 2, y: base.y + perp.y * headWidth / 2 },
    { x: base.x - perp.x * headWidth / 2, y: base.y - perp.y * headWidth / 2 },
  ];
  const polygonPoints = (points) => points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
  return `
    <path d="M ${startBase.x.toFixed(2)} ${startBase.y.toFixed(2)} L ${endBase.x.toFixed(2)} ${endBase.y.toFixed(2)}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
    ${hasStartHead ? `<polygon points="${polygonPoints(head({ x: x1, y: y1 }, startBase))}" fill="${color}" stroke="${color}" stroke-linejoin="round"/>` : ""}
    ${hasEndHead ? `<polygon points="${polygonPoints(head({ x: x2, y: y2 }, endBase))}" fill="${color}" stroke="${color}" stroke-linejoin="round"/>` : ""}
  `;
}

function cubeSvg({ title, top, front, right, arrows = "" }) {
  const topQuad = [
    { x: 55, y: 57 },
    { x: 91, y: 33 },
    { x: 157, y: 33 },
    { x: 121, y: 57 },
  ];
  const frontQuad = [
    { x: 55, y: 57 },
    { x: 121, y: 57 },
    { x: 121, y: 123 },
    { x: 55, y: 123 },
  ];
  const rightQuad = [
    { x: 121, y: 57 },
    { x: 157, y: 33 },
    { x: 157, y: 99 },
    { x: 121, y: 123 },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 188 150" role="img" aria-labelledby="title">
  <title id="title">${title}</title>
  <rect width="188" height="150" fill="white"/>
  <path d="M55 123h66l36-24V33H91L55 57z" fill="#000" opacity="0.04"/>
  ${drawFace(topQuad, top)}
  ${drawFace(rightQuad, right)}
  ${drawFace(frontQuad, front)}
  ${arrows}
</svg>
`;
}

function cubeLeftSvg({ title, top, front, left, arrows = "" }) {
  const topQuad = [
    { x: 31, y: 33 },
    { x: 97, y: 33 },
    { x: 133, y: 57 },
    { x: 67, y: 57 },
  ];
  const frontQuad = [
    { x: 67, y: 57 },
    { x: 133, y: 57 },
    { x: 133, y: 123 },
    { x: 67, y: 123 },
  ];
  const leftQuad = [
    { x: 31, y: 33 },
    { x: 67, y: 57 },
    { x: 67, y: 123 },
    { x: 31, y: 99 },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 188 150" role="img" aria-labelledby="title">
  <title id="title">${title}</title>
  <rect width="188" height="150" fill="white"/>
  <path d="M67 123h66V57L97 33H31v66z" fill="#000" opacity="0.04"/>
  ${drawFace(topQuad, top)}
  ${drawFace(leftQuad, left)}
  ${drawFace(frontQuad, front)}
  ${arrows}
</svg>
`;
}

function cubeBottomSvg({ title, bottom, front, right, arrows = "" }) {
  const depth = { x: 38, y: 24 };
  const frontQuad = [
    { x: 44, y: 22 },
    { x: 110, y: 22 },
    { x: 110, y: 88 },
    { x: 44, y: 88 },
  ];
  const rightQuad = [
    frontQuad[1],
    { x: frontQuad[1].x + depth.x, y: frontQuad[1].y + depth.y },
    { x: frontQuad[2].x + depth.x, y: frontQuad[2].y + depth.y },
    frontQuad[2],
  ];
  const bottomQuad = [
    frontQuad[3],
    frontQuad[2],
    { x: frontQuad[2].x + depth.x, y: frontQuad[2].y + depth.y },
    { x: frontQuad[3].x + depth.x, y: frontQuad[3].y + depth.y },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 188 150" role="img" aria-labelledby="title">
  <title id="title">${title}</title>
  <rect width="188" height="150" fill="white"/>
  <path d="M44 22h66l38 24v66H82L44 88z" fill="#000" opacity="0.04"/>
  ${drawFace(frontQuad, front)}
  ${drawFace(rightQuad, right)}
  ${drawFace(bottomQuad, bottom)}
  ${arrows}
</svg>
`;
}

function cubeBottomLeftSvg({ title, bottom, front, left, arrows = "" }) {
  const depth = { x: -38, y: 24 };
  const frontQuad = [
    { x: 78, y: 22 },
    { x: 144, y: 22 },
    { x: 144, y: 88 },
    { x: 78, y: 88 },
  ];
  const leftQuad = [
    frontQuad[0],
    { x: frontQuad[0].x + depth.x, y: frontQuad[0].y + depth.y },
    { x: frontQuad[3].x + depth.x, y: frontQuad[3].y + depth.y },
    frontQuad[3],
  ];
  const bottomQuad = [
    frontQuad[3],
    frontQuad[2],
    { x: frontQuad[2].x + depth.x, y: frontQuad[2].y + depth.y },
    { x: frontQuad[3].x + depth.x, y: frontQuad[3].y + depth.y },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 188 150" role="img" aria-labelledby="title">
  <title id="title">${title}</title>
  <rect width="188" height="150" fill="white"/>
  <path d="M78 22h66v66l-38 24H40V46z" fill="#000" opacity="0.04"/>
  ${drawFace(leftQuad, left)}
  ${drawFace(frontQuad, front)}
  ${drawFace(bottomQuad, bottom)}
  ${arrows}
</svg>
`;
}

function faceSvg({ title, cells, marks = "", arrows = "" }) {
  let grid = "";
  const size = 34;
  const start = 21;
  const cellColors = cellGrid(cells);
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      grid += `<rect x="${start + col * size}" y="${start + row * size}" width="${size}" height="${size}" fill="${cellColors[row * 3 + col]}" stroke="${colors.dark}" stroke-width="2"/>`;
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144" role="img" aria-labelledby="title">
  <title id="title">${title}</title>
  <rect width="144" height="144" fill="white"/>
  ${grid}
  ${marks}
  ${arrows}
</svg>
`;
}

function sideMarks(names) {
  const marks = {
    tlTop: { x: 27, y: 12, width: 22, height: 7 },
    tlLeft: { x: 12, y: 27, width: 7, height: 22 },
    trTop: { x: 95, y: 12, width: 22, height: 7 },
    trRight: { x: 125, y: 27, width: 7, height: 22 },
    brRight: { x: 125, y: 95, width: 7, height: 22 },
    brBottom: { x: 95, y: 125, width: 22, height: 7 },
    blBottom: { x: 27, y: 125, width: 22, height: 7 },
    blLeft: { x: 12, y: 95, width: 7, height: 22 },
  };

  return names.map((name) => {
    const mark = marks[name];
    return `<rect x="${mark.x}" y="${mark.y}" width="${mark.width}" height="${mark.height}" rx="3" fill="${colors.yellow}" stroke="${colors.dark}" stroke-width="1.4"/>`;
  }).join("");
}

const n = colors.neutral;
const w = colors.white;
const y = colors.yellow;
const b = colors.blue;
const g = colors.green;
const r = colors.red;
const o = colors.orange;
const gray = colors.gray;

const cubeFiles = {
  "daisy.svg": cubeSvg({
    title: "White daisy around the yellow center",
    top: [n, w, n, w, y, w, n, w, n],
    front: [n, n, n, n, b, n, n, n, n],
    right: [n, n, n, n, r, n, n, n, n],
  }),
  "cross.svg": cubeBottomSvg({
    title: "White cross on the bottom with side colors matched",
    bottom: [n, w, n, w, w, w, n, w, n],
    front: [n, n, n, n, b, n, n, b, n],
    right: [n, n, n, n, r, n, n, r, n],
  }),
  "corner-right-slot.svg": cubeBottomSvg({
    title: "White red blue corner in the right slot",
    bottom: [n, w, gray, w, w, w, n, w, n],
    front: [n, n, b, n, b, n, n, b, gray],
    right: [w, n, n, n, r, n, gray, r, n],
    arrows: arrow({ x1: 116.5, y1: 36, x2: 116.5, y2: 90 }),
  }),
  "corner-left-slot.svg": cubeBottomLeftSvg({
    title: "White red blue corner in the left slot",
    bottom: [gray, w, n, w, w, w, n, w, n],
    front: [b, n, n, n, b, n, gray, b, n],
    left: [w, n, n, n, r, n, gray, r, n],
    arrows: arrow({ x1: 71.5, y1: 36, x2: 71.5, y2: 90 }),
  }),
  "corner-double-right-slot.svg": cubeBottomSvg({
    title: "White red blue corner for double right kick",
    bottom: [n, w, gray, w, w, w, n, w, n],
    front: [n, n, r, n, b, n, n, b, gray],
    right: [b, n, n, n, r, n, gray, r, n],
    arrows: arrow({ x1: 116.5, y1: 36, x2: 116.5, y2: 90 }),
  }),
  "second-layer-right.svg": cubeSvg({
    title: "Move an edge into the right side of the second layer",
    top: [n, n, n, r, y, n, n, n, n],
    front: [n, b, n, n, b, gray, b, b, b],
    right: [n, r, n, gray, r, n, r, r, r],
    arrows: arrow({ x1: 88, y1: 68, x2: 110, y2: 90 }),
  }),
  "second-layer-left.svg": cubeLeftSvg({
    title: "Move an edge into the left side of the second layer",
    top: [n, n, n, n, y, n, n, o, n],
    front: [n, b, n, gray, b, b, b, b, b],
    left: [n, n, n, n, o, gray, o, o, o],
    arrows: arrow({ x1: 100, y1: 68, x2: 78, y2: 90 }),
  }),
};

const faceFiles = {
  "oll-dot.svg": faceSvg({
    title: "Last layer edge orientation dot case",
    cells: [n, n, n, n, y, n, n, n, n],
  }),
  "oll-l.svg": faceSvg({
    title: "Last layer edge orientation L case",
    cells: [n, y, n, y, y, n, n, n, n],
  }),
  "oll-line.svg": faceSvg({
    title: "Last layer edge orientation line case",
    cells: [n, n, n, y, y, y, n, n, n],
  }),
  "oll-cross.svg": faceSvg({
    title: "Last layer edge orientation cross",
    cells: [n, y, n, y, y, y, n, y, n],
  }),
  "corner-orient-sune.svg": faceSvg({
    title: "Corner orientation Sune case",
    cells: [n, y, n, y, y, y, y, y, n],
    marks: sideMarks(["tlLeft", "trTop", "brRight"]),
  }),
  "corner-orient-antisune.svg": faceSvg({
    title: "Corner orientation Anti-Sune case",
    cells: [n, y, n, y, y, y, n, y, y],
    marks: sideMarks(["tlTop", "trRight", "blLeft"]),
  }),
  "corner-orient-h.svg": faceSvg({
    title: "Corner orientation H case",
    cells: [n, y, n, y, y, y, n, y, n],
    marks: sideMarks(["tlTop", "trTop", "brBottom", "blBottom"]),
  }),
  "corner-orient-pi.svg": faceSvg({
    title: "Corner orientation Pi case",
    cells: [n, y, n, y, y, y, n, y, n],
    marks: sideMarks(["tlLeft", "trRight", "brRight", "blLeft"]),
  }),
  "corner-orient-t.svg": faceSvg({
    title: "Corner orientation T case",
    cells: [y, y, y, y, y, y, n, y, n],
    marks: sideMarks(["brRight", "blLeft"]),
  }),
  "corner-orient-u.svg": faceSvg({
    title: "Corner orientation U case",
    cells: [n, y, n, y, y, y, y, y, y],
    marks: sideMarks(["tlTop", "trTop"]),
  }),
  "corner-orient-l.svg": faceSvg({
    title: "Corner orientation L case",
    cells: [y, y, n, y, y, y, n, y, y],
    marks: sideMarks(["trTop", "blBottom"]),
  }),
  "corner-orient-solved.svg": faceSvg({
    title: "Solved corner orientation case",
    cells: Array(9).fill(y),
  }),
  "corner-position.svg": faceSvg({
    title: "Position last layer corners",
    cells: Array(9).fill(y),
    arrows: arrow({ x1: 106, y1: 32, x2: 106, y2: 112, heads: "both" }),
  }),
  "edge-position.svg": faceSvg({
    title: "Position last layer edges",
    cells: Array(9).fill(y),
    arrows: `
      ${arrow({ x1: 37, y1: 72, x2: 72, y2: 37 })}
      ${arrow({ x1: 72, y1: 37, x2: 107, y2: 72 })}
      ${arrow({ x1: 107, y1: 72, x2: 37, y2: 72 })}
    `,
  }),
};

await mkdir(outDir, { recursive: true });

const selectedFiles = new Set(process.argv.slice(2));
const allFiles = { ...cubeFiles, ...faceFiles };
const filesToWrite = selectedFiles.size > 0
  ? Object.fromEntries(Object.entries(allFiles).filter(([name]) => selectedFiles.has(name)))
  : allFiles;

for (const [name, svg] of Object.entries(filesToWrite)) {
  await writeFile(new URL(name, outDir), svg, "utf8");
}
