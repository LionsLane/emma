"use client";

// QR codes for smart links. Drawn as one SVG path from the encoder's modules (no innerHTML),
// with SVG (print) and PNG (WhatsApp, posts) downloads. Quiet zone of 4 modules, error level M.

import qrcode from "qrcode-generator";
import { useMemo } from "react";

function matrix(text: string): boolean[][] {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}

const QUIET = 4;
function pathFor(m: boolean[][]): string {
  let d = "";
  m.forEach((row, r) => row.forEach((dark, c) => { if (dark) d += `M${c + QUIET} ${r + QUIET}h1v1h-1z`; }));
  return d;
}

export function svgString(text: string): string {
  const m = matrix(text), size = m.length + QUIET * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#ffffff"/><path d="${pathFor(m)}" fill="#000000"/></svg>`;
}

function download(name: string, href: string) {
  const a = document.createElement("a");
  a.href = href; a.download = name; a.click();
}

export function downloadSvg(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([svgString(text)], { type: "image/svg+xml" }));
  download(`${name}.svg`, url);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadPng(text: string, name: string, px = 1024) {
  const m = matrix(text), size = m.length + QUIET * 2, scale = Math.floor(px / size);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  m.forEach((row, r) => row.forEach((dark, c) => { if (dark) ctx.fillRect((c + QUIET) * scale, (r + QUIET) * scale, scale, scale); }));
  download(`${name}.png`, canvas.toDataURL("image/png"));
}

export function QRCode({ text, size = 180, label }: { text: string; size?: number; label: string }) {
  const { d, n } = useMemo(() => { const m = matrix(text); return { d: pathFor(m), n: m.length + QUIET * 2 }; }, [text]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges" role="img" aria-label={label} style={{ borderRadius: 8, background: "#fff" }}>
      <rect width={n} height={n} fill="#fff" />
      <path d={d} fill="#000" />
    </svg>
  );
}
