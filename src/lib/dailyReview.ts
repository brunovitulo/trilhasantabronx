// Helpers compartilhados para a Revisão do Dia.
// Toda a lógica de agendamento ocorre no servidor — aqui ficam apenas tipos e utilitários puros.

import type { ProductRevisionGroupId } from "@/data/produtosRevisao";

/** Plano por módulo: em quais dias após a conclusão a revisão aparece + quantas perguntas e o que mostrar. */
export type ModuleReviewPlan = {
  topicId: string;
  /** Offsets de dias (em relação à conclusão do tópico) em que a revisão aparece na fila. */
  dayOffsets: number[];
  /** Quantidade de perguntas sorteadas por sessão. */
  quizCount: number;
  /** Mostra etapa de "reler apostila"? */
  hasApostila: boolean;
  /** Mostra etapa de checklist? */
  hasChecklist: boolean;
  /** Tempo estimado exibido. */
  estimatedMinutes: string;
};

export const MODULE_REVIEW_PLANS: ModuleReviewPlan[] = [
  // Módulos 1-3: D+1 e D+2, com apostila + checklist + 5 perguntas
  { topicId: "apresentacao", dayOffsets: [1, 2], quizCount: 5, hasApostila: true, hasChecklist: true, estimatedMinutes: "8-10" },
  { topicId: "embalar", dayOffsets: [1, 2], quizCount: 5, hasApostila: true, hasChecklist: true, estimatedMinutes: "8-10" },
  { topicId: "responsabilidade", dayOffsets: [1, 2], quizCount: 5, hasApostila: true, hasChecklist: true, estimatedMinutes: "8-10" },
  // Módulos 4-5: D+1, D+3, D+5, sem apostila — checklist + 5 perguntas
  { topicId: "objecoes", dayOffsets: [1, 3, 5], quizCount: 5, hasApostila: false, hasChecklist: true, estimatedMinutes: "5-7" },
  { topicId: "vendas", dayOffsets: [1, 3, 5], quizCount: 5, hasApostila: false, hasChecklist: true, estimatedMinutes: "5-7" },
  // Módulo 6: D+1, D+4, D+7, D+10 — checklist + 6 perguntas
  { topicId: "dores", dayOffsets: [1, 4, 7, 10], quizCount: 6, hasApostila: false, hasChecklist: true, estimatedMinutes: "7-10" },
];

export type ProductGroupQueueItem = {
  kind: "product-group";
  reviewKey: string; // "produtos:<groupId>"
  groupId: ProductRevisionGroupId;
  title: string;
  phase: 1 | 2 | 3;
  cycle: number;
  /** Quantas sessões já foram concluídas no ciclo atual (antes de hoje). */
  sessionsDoneInCycle: number;
  estimatedMinutes: string;
};

export type ModuleQueueItem = {
  kind: "module";
  reviewKey: string; // = topicId
  topicId: string;
  title: string;
  hasApostila: boolean;
  hasChecklist: boolean;
  quizCount: number;
  dayOffset: number;
  /** Posição da sessão dentro do plano (1..N). */
  sessionIndex: number;
  totalSessions: number;
  estimatedMinutes: string;
};

export type ReviewQueueItem = ModuleQueueItem | ProductGroupQueueItem;

// YYYY-MM-DD no fuso America/Sao_Paulo, consistente entre cliente e servidor.
export function spDateKey(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

// Diferença em dias inteiros entre duas datas YYYY-MM-DD (b - a).
export function daysBetween(aISO: string, bISO: string): number {
  const a = new Date(`${aISO}T00:00:00Z`).getTime();
  const b = new Date(`${bISO}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86400000);
}

/** Soma N dias a uma data YYYY-MM-DD e devolve YYYY-MM-DD. */
export function addDaysIso(dateIso: string, days: number): string {
  const t = new Date(`${dateIso}T00:00:00Z`).getTime() + days * 86400000;
  return spDateKey(new Date(t));
}

/** Para o Módulo 7: define quais offsets de dia (em relação ao cycle_anchor_date) cada fase usa. */
export const PRODUCT_PHASE_DAYS: Record<1 | 2 | 3, number[]> = {
  1: [1, 2],
  2: [4, 5],
  3: [7],
};

/** Total de sessões previstas em cada fase (para exibição). */
export const PRODUCT_PHASE_SESSIONS: Record<1 | 2 | 3, number> = {
  1: 2,
  2: 2,
  3: 1,
};

/** Sortear N índices distintos de um array de tamanho `length` usando seed baseada em string (determinístico). */
export function sampleIndices(length: number, count: number, seed: string): number[] {
  const idx = Array.from({ length }, (_, i) => i);
  if (count >= length) return idx;
  // Fisher-Yates com PRNG seedado.
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, count).sort((a, b) => a - b);
}
