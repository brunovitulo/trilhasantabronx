import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ApostilaBadgeColor, ApostilaItem, ApostilaSection } from "@/data/topics";

const BADGE_CLASSES: Record<ApostilaBadgeColor, string> = {
  purple: "bg-violet-500/15 text-violet-300 border-violet-400/30",
  pink: "bg-pink-500/15 text-pink-300 border-pink-400/30",
  blue: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  green: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  orange: "bg-orange-500/15 text-orange-300 border-orange-400/30",
  gray: "bg-zinc-500/15 text-zinc-300 border-zinc-400/30",
};

function Row({ item }: { item: ApostilaItem }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-b-0">
      <span
        className={`shrink-0 text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${BADGE_CLASSES[item.badgeColor]}`}
      >
        {item.badge}
      </span>
      <div className="min-w-0">
        <strong className="block text-sm font-semibold text-foreground">
          {item.title}
        </strong>
        <span className="text-[13px] text-muted-foreground leading-relaxed">
          {item.description}
        </span>
      </div>
    </div>
  );
}

function SectionCard({ section }: { section: ApostilaSection }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-border/40">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ backgroundColor: section.iconBg }}
        >
          {section.icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-[15px] leading-tight">{section.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{section.subtitle}</p>
        </div>
      </div>
      <div className="px-4 pb-3">
        {section.items.map((item, i) => (
          <Row key={i} item={item} />
        ))}
        {section.tip && (
          <div className="mt-3 rounded-xl border-l-2 border-amber-400 bg-amber-400/10 px-3 py-2.5 text-[13px] text-amber-100/90 leading-relaxed">
            <strong className="text-amber-200">{section.tip.label}: </strong>
            {section.tip.text}
          </div>
        )}
      </div>
    </div>
  );
}

function FaqCard({ q, a, n }: { q: string; a: string; n: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-4">
      <div className="text-[9px] font-bold tracking-[2px] uppercase text-violet-300 mb-1.5">
        Pergunta {n.toString().padStart(2, "0")}
      </div>
      <p className="text-[13.5px] font-semibold text-foreground leading-snug mb-2">
        {q}
      </p>
      {open && (
        <div className="text-[13px] text-muted-foreground bg-muted/40 rounded-lg p-3 leading-relaxed mb-2">
          {a}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-[12.5px] font-semibold text-violet-300 hover:text-violet-200 inline-flex items-center gap-1"
      >
        {open ? "Ocultar" : "Ver resposta"}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}

export function ApostilaView({
  intro,
  sections,
  extrasTitle,
  extras,
  faq,
}: {
  intro: string;
  sections: ApostilaSection[];
  extrasTitle?: string;
  extras?: ApostilaItem[];
  faq?: { question: string; answer: string }[];
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-zinc-900/70 border border-border/50 p-4">
        <div className="text-[10px] font-semibold tracking-[3px] uppercase text-violet-300 mb-2">
          Conceito base
        </div>
        <p className="text-[14px] text-zinc-200 leading-relaxed">{intro}</p>
      </div>

      <div>
        <div className="text-[10px] font-semibold tracking-[3px] uppercase text-violet-300 mb-3">
          Dores e soluções
        </div>
        <div className="space-y-3">
          {sections.map((s, i) => (
            <SectionCard key={i} section={s} />
          ))}
        </div>
      </div>

      {extras && extras.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold tracking-[3px] uppercase text-violet-300 mb-3">
            {extrasTitle ?? "Outros produtos"}
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl px-4 py-2">
            {extras.map((item, i) => (
              <Row key={i} item={item} />
            ))}
          </div>
        </div>
      )}

      {faq && faq.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold tracking-[3px] uppercase text-violet-300 mb-1">
            Perguntas de fixação
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Responda mentalmente — clique em <span className="text-violet-300 font-semibold">ver resposta</span> para conferir.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {faq.map((f, i) => (
              <FaqCard key={i} q={f.question} a={f.answer} n={i + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
