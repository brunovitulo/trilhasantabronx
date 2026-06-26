import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type GuideStep = {
  icon: LucideIcon;
  title: string;
  description?: string;
};

/**
 * Micro passo-a-passo numerado exibido no topo de cada subtarefa.
 * Visual escuro/premium com destaque em verde água/turquesa.
 */
export function StepGuide({
  steps,
  title = "Como fazer este passo",
}: {
  steps: GuideStep[];
  title?: string;
}) {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4 mb-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5eead4] mb-3">
        {title}
      </p>
      <ol className="space-y-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isLast = i === steps.length - 1;
          return (
            <li
              key={i}
              className={cn(
                "flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-2.5 sm:p-3",
                isLast && "border-[#5eead4]/30 bg-[#5eead4]/[0.06]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-wider",
                  isLast
                    ? "bg-[#5eead4]/20 text-[#5eead4] border border-[#5eead4]/40"
                    : "bg-white/10 text-foreground/80 border border-white/15",
                )}
                aria-hidden
              >
                {isLast ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
              </span>
              <Icon
                className="h-4 w-4 shrink-0 mt-1"
                style={{ color: isLast ? "#5eead4" : "#A78BFA" }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] sm:text-sm font-semibold leading-tight text-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1.5">
                    Passo {i + 1}
                  </span>
                  {s.title}
                </p>
                {s.description && (
                  <p className="mt-0.5 text-[12px] sm:text-[13px] leading-snug text-muted-foreground">
                    {s.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
