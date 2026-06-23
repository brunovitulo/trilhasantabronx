// Helpers compartilhados para a Revisão do Dia.
// A fila é derivada das datas de conclusão dos tópicos — sem agendamento prévio.

export type DailyReviewQueueItem = {
  topicId: string;
  topicTitle: string;
  dayInWindow: 1 | 2; // 1º ou 2º dia de revisão
  hasQuiz: boolean;
  hasContent: boolean;
};

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
