#!/usr/bin/env python3
"""Scrape each Module 7 product page and extract category-bound chips (v2)."""
import json, re, asyncio
import httpx
from bs4 import BeautifulSoup

PRODUCTS = json.load(open('/tmp/scrape/products.json'))

COSMETIC_SUBS = {"excitantes","perfumes_feromonios","adstringente","estimulantes_sexuais","retardante","lubrificante","anestesicos"}
VIBRATOR_SUBS = {"vibrador_rabbit","sugador_de_clitoris","vibrador_de_calcinha","maquina_de_sexo","vibrador_de_casal","vibrador_de_aplicativo","varinha_magica","mini_vibrador"}

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; SantaBronxBot/1.0)"}

def cat(sub):
    if sub in COSMETIC_SUBS: return "cosmetic"
    if sub in VIBRATOR_SUBS: return "vibrator"
    return "accessory"

def fetch_text(html):
    soup = BeautifulSoup(html, "html.parser")
    title = soup.find("h1", class_=re.compile("product_title"))
    title_text = title.get_text(" ", strip=True) if title else ""
    short = soup.find("div", class_=re.compile("woocommerce-product-details__short-description"))
    short_text = short.get_text(" ", strip=True) if short else ""
    long_div = soup.find(id="tab-description") or soup.find("div", class_=re.compile("woocommerce-Tabs-panel--description"))
    long_text = ""
    if long_div:
        # Strip aside / related / cross-sells before reading text.
        for sec in long_div.find_all(["section","aside","ul"], class_=re.compile("related|cross|products|upsell")):
            sec.decompose()
        long_text = long_div.get_text(" ", strip=True)
        long_text = long_text[:4000]  # cap; related blocks past 4k anyway
    return title_text + " | " + short_text + " | " + long_text

def norm(s):
    s = s.lower()
    repl = {"á":"a","à":"a","â":"a","ã":"a","é":"e","ê":"e","í":"i","ó":"o","ô":"o","õ":"o","ú":"u","ç":"c"}
    for k,v in repl.items(): s = s.replace(k,v)
    return s

# ---- Per-subcategory allowed chip TYPES ----
# COSMETICS subcategory-specific effect whitelists
COSMETIC_EFFECT_WHITELIST = {
    "excitantes":            {"Vibra","Aquece","Refresca","Suga","Pulsa","Shock","Aumenta sensibilidade","Anestesia","Lubrifica","Vasodilatador"},
    "perfumes_feromonios":   set(),  # no effects at all
    "adstringente":          set(),
    "estimulantes_sexuais":  {"Vasodilatador","Aumenta sensibilidade"},
    "retardante":            {"Anestesia"},
    "lubrificante":          {"Lubrifica"},
    "anestesicos":           {"Anestesia"},
}

EFFECT_PATTERNS = [
    ("Vibra",            r"\bvibra(?:nte|c[ao]o|coes)?\b"),
    ("Aquece",           r"\baquec(?:e|imento|edor)\b|\befeito\s+termico\b"),
    ("Refresca",         r"\brefresc(?:a|ancia|ante)\b|\bgelado\b|\bmentol\b"),
    ("Suga",             r"\bsuc[cç]ao\b|\bsuga(?:dor)?\b"),
    ("Pulsa",            r"\bpulsa(?:nte)?\b(?!\s*sangu)|\befeito\s+pulsa"),
    ("Shock",            r"\bshock\b|\bchoque\b"),
    ("Lubrifica",        r"\blubrifica(?:nte|cao)?\b"),
    ("Anestesia",        r"\banest[eé]si(?:co|a|ante)\b|\bdessensibiliz|\breduz(?:ir)?\s+(?:a\s+)?sensibilidade"),
    ("Vasodilatador",    r"\bvasodilatador(?:a|es)?\b"),
    ("Aumenta sensibilidade", r"\baumenta(?:r)?\s+(?:a\s+)?sensibilidade\b|\bintensifica\s+(?:o\s+)?prazer\b"),
]

def extract_cosmetic(name, text, sub):
    allowed = COSMETIC_EFFECT_WHITELIST.get(sub, set())
    chips = []
    t = norm(name + " " + text)
    n = norm(name)
    if allowed:
        for label, pat in EFFECT_PATTERNS:
            if label not in allowed: continue
            if re.search(pat, t):
                chips.append(label)
    # Audience from name only
    if re.search(r"\bunissex\b", n): chips.append("Unissex")
    elif re.search(r"\bfeminin|\bfemme\b|\blady\b", n): chips.append("Feminino")
    elif re.search(r"\bmasculin|\bselvage\b|\bmacho\b|\bspray\b", n): chips.append("Masculino")
    elif re.search(r"\bcasal\b", n): chips.append("Para casal")
    # Beijavel — only excitantes and lubrificantes
    if sub in {"excitantes","lubrificante","estimulantes_sexuais"}:
        if re.search(r"\bbeij[áa]vel\b", norm(name + " " + text[:1500])):
            chips.append("Beijável")
    out = []
    for c in chips:
        if c not in out: out.append(c)
    return out[:5]

def extract_vibrator(name, text, sub):
    chips = []
    t = norm(name + " " + text)
    n = norm(name)
    m = re.search(r"\b(\d{1,2})\s*(?:modos|vibra(?:coes|cao)|funcoes|frequencias|velocidades)\b", n)
    if not m:
        m = re.search(r"\b(\d{1,2})\s*(?:modos|vibra(?:coes|cao)|funcoes|frequencias|velocidades)\b", t)
    if m:
        chips.append(f"{m.group(1)} modos")
    if re.search(r"\brecarreg[áa]vel\b|\bcarregamento\s+usb\b|\bbateria\s+integrada\b", n+" "+t):
        chips.append("Recarregável")
    elif re.search(r"\b(?:a\s+pilha|pilhas?\b|baterias?\s+aaa?\b)", n+" "+t):
        chips.append("A pilha")
    # Stimulation: prefer name signal; expand by subcategory defaults
    if "clitoris" in n or sub in {"sugador_de_clitoris","vibrador_de_calcinha"}: chips.append("Clitóris")
    if re.search(r"\bponto\s*g\b", n) or sub == "vibrador_rabbit": chips.append("Ponto G")
    if "anal" in n or "prostata" in n: chips.append("Anal")
    if "duplo" in n or "dupla" in n: chips.append("Duplo")
    if "corporal" in n or sub == "varinha_magica": chips.append("Corporal")
    # Usage
    if "casal" in n or sub == "vibrador_de_casal":
        chips.append("Para casal")
    elif sub in {"sugador_de_clitoris","mini_vibrador","vibrador_de_calcinha","varinha_magica","vibrador_rabbit"}:
        chips.append("Individual")
    out = []
    for c in chips:
        if c not in out: out.append(c)
    return out[:5]

def extract_accessory(name, text, sub):
    chips = []
    t = norm(name + " " + text)
    n = norm(name)
    materials = [
        ("Cyberskin", r"\bcyber\s*skin\b"),
        ("Silicone",  r"\b(?:em|de|material[:\s]+)?\s*silicone\b|silicone\s+(?:cir[uú]rgico|m[ée]dico|m[aá]cio|premium)"),
        ("ABS",       r"\bem\s+abs\b|\bplastico\s+abs\b|material[:\s]+abs"),
        ("TPE",       r"\btpe\b"),
        ("Metal",     r"\bem\s+metal\b|\ba[çc]o\s+inox|\bcromado\b|\bem\s+aco\b"),
        ("Vidro",     r"\bvidro\s+temperado\b|\bem\s+vidro\b"),
        ("Couro",     r"\bcouro\b|\bcourino\b"),
    ]
    for label, pat in materials:
        if re.search(pat, n) or re.search(pat, t[:1500]):
            chips.append(label); break
    # Size from name
    if re.search(r"\bgrande\b|\bgg\b|\(g\)|\s-\s*g\b|\s-\s*gg\b|\bversao\s+g\b", n):
        chips.append("G")
    elif re.search(r"\bmedi[ao]\b|\(m\)|\s-\s*m\b|\bversao\s+m\b|tamanho\s+m\b", n):
        chips.append("M")
    elif re.search(r"\bpequen[ao]\b|\(p\)|\s-\s*p\b|\bversao\s+p\b|tamanho\s+p\b", n):
        chips.append("P")
    # Specific use — strict
    if sub == "plug_anal" or "anal" in n: chips.append("Anal")
    if sub in {"capas_penianas","anel_peniano","masturbador_masculino","penis_realistico"}:
        chips.append("Peniano")
    if sub == "roupas":
        chips.append("Lingerie")
    if sub == "sado":
        chips.append("BDSM")
    if "casal" in n: chips.append("Para casal")
    out = []
    for c in chips:
        if c not in out: out.append(c)
    return out[:5]

async def fetch_one(client, p):
    try:
        r = await client.get(p["url"], timeout=20, headers=HEADERS, follow_redirects=True)
        if r.status_code != 200:
            return p["slug"], None, f"HTTP {r.status_code}"
        return p["slug"], r.text, None
    except Exception as e:
        return p["slug"], None, str(e)

async def main():
    async with httpx.AsyncClient(http2=False) as client:
        sem = asyncio.Semaphore(10)
        async def bound(p):
            async with sem:
                return await fetch_one(client, p)
        results = await asyncio.gather(*[bound(p) for p in PRODUCTS])
    out = {}
    errors = []
    # Need name — re-extract from m7Products.ts
    name_map = {}
    src = open('src/data/m7Products.ts').read()
    for m in re.finditer(r'productSlug: "([^"]+)",\s*productName: "([^"]+)"', src):
        name_map[m.group(1)] = m.group(2)

    for (slug, html, err), p in zip(results, PRODUCTS):
        name = name_map.get(slug, slug.replace("-"," "))
        text = "" if err or not html else fetch_text(html)
        if err: errors.append((slug, err))
        c = cat(p["sub"])
        if c == "cosmetic":
            chips = extract_cosmetic(name, text, p["sub"])
        elif c == "vibrator":
            chips = extract_vibrator(name, text, p["sub"])
        else:
            chips = extract_accessory(name, text, p["sub"])
        # Ensure at least 2 chips when possible (don't pad fake; just allow 0 if nothing matches)
        out[slug] = chips
    json.dump(out, open('/tmp/scrape/chips.json','w'), ensure_ascii=False, indent=1)
    from collections import Counter
    dist = Counter(len(v) for v in out.values())
    print(f"DONE: {len(out)} products, {len(errors)} errors, dist={dict(sorted(dist.items()))}")
    for e in errors[:5]: print(" err:", e)

asyncio.run(main())
