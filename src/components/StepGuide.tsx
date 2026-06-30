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

// Paleta de cores por posição do passo no fluxo.
// Cada passo recebe um par (bg / fg) distinto, com semântica:
//   0 → azul (conteúdo)
//   1 → teal (revisão)
//   2 → âmbar (ação)
//   3+ (último) → verde (confirmar)
const STEP_PALETTE: Array<{ bg: string; fg: string }> = [
  { bg: "oklch(0.92 0.06 250)", fg: "oklch(0.45 0.18 250)" }, // azul
  { bg: "oklch(0.92 0.07 195)", fg: "oklch(0.45 0.15 195)" }, // teal
  { bg: "oklch(0.93 0.10 80)", fg: "oklch(0.50 0.16 70)" }, // âmbar
  { bg: "oklch(0.92 0.07 150)", fg: "oklch(0.45 0.14 150)" }, // verde
];
const STEP_PALETTE_DARK: Array<{ bg: string; fg: string }> = [
  { bg: "oklch(0.45 0.18 250 / 22%)", fg: "oklch(0.85 0.12 250)" },
  { bg: "oklch(0.45 0.15 195 / 22%)", fg: "oklch(0.85 0.12 195)" },
  { bg: "oklch(0.50 0.16 70 / 22%)", fg: "oklch(0.86 0.13 80)" },
  { bg: "oklch(0.45 0.14 150 / 22%)", fg: "oklch(0.85 0.12 150)" },
];

function paletteFor(idx: number, isLast: boolean) {
  // O último passo do fluxo é sempre "confirmar" → verde.
  if (isLast) return { light: STEP_PALETTE[3], dark: STEP_PALETTE_DARK[3] };
  const i = idx % 3; // alterna entre azul / teal / âmbar
  return { light: STEP_PALETTE[i], dark: STEP_PALETTE_DARK[i] };
}

/**
 * Stepper compacto horizontal usado no topo de cada subtarefa.
 * Os passos quebram em múltiplas linhas (sem scroll horizontal) e cada
 * badge recebe uma cor distinta para reforçar a sequência visual.
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
        flexWrap: "wrap",
        alignItems: "center",
        rowGap: 8,
        columnGap: 6,
        border: "1px solid var(--border-subtle)",
      }}
    >
      {steps.map((s, i) => {
        const Icon = s.icon;
        const tooltip = s.description ? `${s.title} — ${s.description}` : s.title;
        const isLast = i === steps.length - 1;
        const pal = paletteFor(i, isLast);
        const completedBg = "var(--bg-success)";
        const completedFg = "var(--text-success)";
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
                className="step-guide-badge"
                data-step={i}
                style={
                  {
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: s.completed ? completedBg : pal.light.bg,
                    color: s.completed ? completedFg : pal.light.fg,
                    flexShrink: 0,
                    // Permite override em dark via CSS var custom.
                    ["--sg-bg-dark" as string]: s.completed
                      ? "var(--bg-success)"
                      : pal.dark.bg,
                    ["--sg-fg-dark" as string]: s.completed
                      ? "var(--text-success)"
                      : pal.dark.fg,
                  } as React.CSSProperties
                }
              >
                {s.completed ? (
                  <Check size={13} strokeWidth={3} />
                ) : (
                  <Icon size={13} strokeWidth={2.5} />
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
            {!isLast && (
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
