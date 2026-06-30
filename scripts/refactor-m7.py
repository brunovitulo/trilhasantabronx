#!/usr/bin/env python3
"""Refactor topics.ts to convert M7 subcategories from 4 steps to 3:
- Remove .produtos subtask object (kind: product_links)
- Remove .apostila subtask object (kind: inline_html)
- Insert a new .bloco subtask (kind: product_block) where .produtos used to be
- Rewrite .fixacao title from "(7 questões)" to "(12 questões)"
"""
import re
import sys
from pathlib import Path

PATH = Path("src/data/topics.ts")
src = PATH.read_text()

# Find all id: "produtos.<slug>.produtos" matches and slice the object literal.
def find_object_span(text, start_idx):
    """Given an index inside a `{ ... }` object literal, find the matching outer braces.
    Returns (open_idx, close_idx_exclusive_of_trailing_comma_newline)."""
    # Walk back to find the opening `{`
    i = start_idx
    depth = 0
    while i >= 0:
        ch = text[i]
        if ch == '}':
            depth += 1
        elif ch == '{':
            if depth == 0:
                open_idx = i
                break
            depth -= 1
        i -= 1
    else:
        raise ValueError("opening brace not found")
    # Walk forward from open_idx to find matching close
    depth = 0
    i = open_idx
    in_str = None
    while i < len(text):
        ch = text[i]
        if in_str:
            if ch == '\\':
                i += 2
                continue
            if ch == in_str:
                in_str = None
        else:
            if ch in ("'", '"', '`'):
                in_str = ch
            elif ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    close_idx = i + 1
                    # consume trailing comma and newline
                    j = close_idx
                    while j < len(text) and text[j] in ', \t':
                        j += 1
                    if j < len(text) and text[j] == '\n':
                        j += 1
                    return open_idx, j
        i += 1
    raise ValueError("close brace not found")

slugs = []
for m in re.finditer(r'id:\s*"produtos\.([a-z_]+)\.produtos"', src):
    slug = m.group(1)
    slugs.append((m.start(), slug))

# Extract per-slug: prefix from .produtos title, links, source from .apostila
# Title format: "1. Cosméticos — Excitantes — Ver produtos reais no site"
# prefix = "1. Cosméticos — Excitantes —"
parsed = {}
for pos, slug in slugs:
    # produtos object
    o_open, o_close = find_object_span(src, pos)
    prod_obj = src[o_open:o_close]
    title_m = re.search(r'title:\s*"([^"]+)"', prod_obj)
    title_text = title_m.group(1)
    prefix = title_text.rsplit("—", 1)[0].rstrip() + " —"

    # Extract links array (label/url pairs).
    links = []
    for lm in re.finditer(r'\{\s*label:\s*"((?:[^"\\]|\\.)*)",\s*url:\s*"([^"]+)"\s*\}', prod_obj):
        label = lm.group(1).replace('\\"', '"')
        url = lm.group(2)
        links.append((label, url))

    # apostila object: search for `id: "produtos.<slug>.apostila"`
    am = re.search(rf'id:\s*"produtos\.{re.escape(slug)}\.apostila"', src)
    a_open, a_close = find_object_span(src, am.start())
    apost_obj = src[a_open:a_close]
    source_m = re.search(r'source:\s*"(produtos_[a-z_]+)"', apost_obj)
    source = source_m.group(1).replace("produtos_", "")  # store bare slug

    # fixacao title (to rewrite)
    fm = re.search(rf'id:\s*"produtos\.{re.escape(slug)}\.fixacao"', src)

    parsed[slug] = {
        "prefix": prefix,
        "links": links,
        "source": source,
        "produtos_span": (o_open, o_close),
        "apostila_span": (a_open, a_close),
    }

# Apply replacements from the END of the file backwards so indices stay valid.
# For each slug: (a) replace produtos block with new bloco; (b) delete apostila block.
# Also update fixacao title (in place find/replace per slug after).

operations = []  # (start, end, replacement)
for slug, info in parsed.items():
    o_open, o_close = info["produtos_span"]
    a_open, a_close = info["apostila_span"]
    prefix = info["prefix"]
    links = info["links"]
    indent = "      "  # standard 6-space inside subtasks

    products_lines = []
    for label, url in links:
        # Escape backslashes and double quotes for embedding inside double-quoted strings.
        label_escaped = label.replace("\\", "\\\\").replace('"', '\\"')
        products_lines.append(f'{indent}    {{ name: "{label_escaped}", url: "{url}" }},')

    new_block = (
        f'{indent}{{\n'
        f'{indent}  id: "produtos.{slug}.bloco",\n'
        f'{indent}  kind: "product_block",\n'
        f'{indent}  title: "{prefix} Conteúdo e produtos",\n'
        f'{indent}  description: "Estude o conteúdo da categoria e revise os produtos reais (preço atualizado em tempo real).",\n'
        f'{indent}  source: "{info["source"]}",\n'
        f'{indent}  products: [\n'
        + "\n".join(products_lines) + "\n"
        f'{indent}  ],\n'
        f'{indent}  confirmLabel: "Estudei o conteúdo e revisei todos os produtos com preço atualizado.",\n'
        f'{indent}}},\n'
    )

    operations.append((o_open, o_close, new_block))
    operations.append((a_open, a_close, ""))  # delete apostila

# Sort descending by start
operations.sort(key=lambda x: x[0], reverse=True)
out = src
for start, end, repl in operations:
    out = out[:start] + repl + out[end:]

# Rewrite "(7 questões)" -> "(12 questões)" inside produtos.* fixacao titles.
# Be precise: only fixacao titles in the M7 subcategories.
out = re.sub(
    r'(id:\s*"produtos\.[a-z_]+\.fixacao"[\s\S]{0,400}?title:\s*")([^"]+)"',
    lambda m: m.group(1) + m.group(2).replace("(7 questões)", "(12 questões)") + '"',
    out,
)

PATH.write_text(out)
print(f"Refactored {len(parsed)} subcategories.")
