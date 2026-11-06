"""Combine docs/00..17 into docs/EmmaComplete.md with a table of contents.
Links between docs ("(05BrandGuidelines.md)") become in-page anchors."""
import re
import sys
from pathlib import Path

docs = Path(sys.argv[1])
files = sorted(p for p in docs.glob("[0-9][0-9]*.md"))
anchors = {p.name: f"part{p.name[:2]}" for p in files}

def title_of(text: str) -> str:
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return ""

parts, toc = [], []
for p in files:
    text = p.read_text(encoding="utf-8")
    for name, anchor in anchors.items():
        text = text.replace(f"]({name})", f"](#{anchor})")
    # Demote headings one level so each document sits under its part heading.
    text = re.sub(r"^(#{1,5}) ", lambda m: "#" + m.group(1) + " ", text, flags=re.M)
    title = title_of(p.read_text(encoding="utf-8"))
    toc.append(f"- [{title}](#{anchors[p.name]})")
    parts.append(f'<a id="{anchors[p.name]}"></a>\n\n{text.strip()}\n')

broken = re.findall(r"\]\((?!#|https?:|mailto:)([^)]+\.md)\)", "\n".join(parts))
header = (
    "# EMMA · The Complete Build Pack\n\n"
    "**Version 2.0 · 15 October 2026 · LionsLane**\n\n"
    "Every EMMA document in one file: product, brand, design, screens, architecture, data, API, AI, "
    "billing, security, mobile, legal, plan and agent rules. Generated from `docs/00Readme.md` to "
    "`docs/17AgentRules.md`; edit those files, not this one.\n\n"
    "## Contents\n\n" + "\n".join(toc) + "\n\n---\n\n"
)
out = docs / "EmmaComplete.md"
out.write_text(header + "\n---\n\n".join(parts), encoding="utf-8")
print(f"{out} written: {len(files)} parts, {out.stat().st_size:,} bytes")
print("broken relative .md links:", broken or "none")
