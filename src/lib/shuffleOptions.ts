// Embaralhamento determinístico de alternativas por questão.
// A ordem é fixada para sempre por questão (seed baseada no texto),
// garantindo que a resposta correta não fique sempre na mesma letra
// e que cada usuário veja a mesma ordem em todas as sessões.

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleQuestion<T extends { question: string; options?: string[]; correctIndex?: number }>(
  q: T,
): T {
  if (!Array.isArray(q.options) || q.options.length < 2 || typeof q.correctIndex !== "number") {
    return q;
  }
  const seed = hashString(q.question + "|" + q.options.join("¦"));
  const rand = mulberry32(seed);
  const idxs = q.options.map((_, i) => i);
  for (let i = idxs.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
  }
  const newOptions = idxs.map((i) => q.options![i]);
  const newCorrect = idxs.indexOf(q.correctIndex);
  return { ...q, options: newOptions, correctIndex: newCorrect };
}
