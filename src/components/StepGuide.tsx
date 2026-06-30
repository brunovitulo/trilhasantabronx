import type { LucideIcon } from "lucide-react";
import { Check, ChevronRight } from "lucide-react";

export type GuideStep = {
  icon: LucideIcon;
  /** Label curto exibido inline (2-3 palavras). */
  title: string;
  /** Instrução completa, mostrada como tooltip no hover/tap. */
  description?: string;
  /** Marca o passo como concluído (badge verde com check). */
  completed?: boolean;
};

/**
 * Stepper compacto horizontal usado no topo de cada subtarefa.
 * Mantém todas as instruções originais como tooltip (atributo `title`)
 * para preservar o contexto sem ocupar espaço vertical.
 */
export function StepGuide({
  steps,
  // Mantido por compatibilidade — não exibido na versão compacta.
  title: _title,
}: {
  steps: GuideStep[];
  title?: string;
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <div
      className="mb-3"
      style={{
        background: "var(--surface-1)",
        borderRadius: 10,
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        overflowX: "auto",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {steps.map((s, i) => {
        const Icon = s.icon;
        const tooltip = s.description
          ? `${s.title} — ${s.description}`
          : s.title;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              title={tooltip}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
                cursor: s.description ? "help" : "default",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: s.completed ? "var(--bg-success)" : "var(--bg-pro)",
                  color: s.completed ? "var(--text-success)" : "var(--text-pro)",
                  flexShrink: 0,
                }}
              >
                {s.completed ? (
                  <Check size={12} strokeWidth={3} />
                ) : (
                  <Icon size={12} strokeWidth={2.5} />
                )}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                {s.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight
                size={13}
                style={{ color: "var(--text-muted)", flexShrink: 0 }}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
