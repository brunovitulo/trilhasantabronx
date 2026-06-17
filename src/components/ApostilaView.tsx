import { useRef, useState } from "react";
import { ChevronDown, Download, Printer } from "lucide-react";
import type { ApostilaBadgeColor, ApostilaItem, ApostilaSection } from "@/data/topics";

const BADGE_CLASSES: Record<ApostilaBadgeColor, string> = {
  purple: "bg-violet-100 text-violet-700 border-violet-300",
  pink: "bg-pink-100 text-pink-700 border-pink-300",
  blue: "bg-sky-100 text-sky-700 border-sky-300",
  green: "bg-emerald-100 text-emerald-700 border-emerald-300",
  orange: "bg-orange-100 text-orange-700 border-orange-300",
  gray: "bg-zinc-100 text-zinc-700 border-zinc-300",
};

function Row({ item }: { item: ApostilaItem }) {
  return (
    <div className="flex items-start gap-2 sm:gap-3 py-2 border-b border-zinc-200 last:border-b-0">
      <span
        className={`shrink-0 text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${BADGE_CLASSES[item.badgeColor]}`}
      >
        {item.badge}
      </span>
      <div className="min-w-0">
        <strong className="block text-sm font-semibold text-zinc-900">
          {item.title}
        </strong>
        <span className="text-[13px] text-zinc-600 leading-relaxed">
          {item.description}
        </span>
      </div>
    </div>
  );
}

function SectionCard({ section }: { section: ApostilaSection }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-zinc-200 bg-zinc-50">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ backgroundColor: section.iconBg }}
        >
          {section.icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-sm sm:text-[15px] leading-tight text-zinc-900">{section.title}</h3>
          <p className="text-[11px] sm:text-xs text-zinc-600 mt-0.5">{section.subtitle}</p>
        </div>
      </div>
      <div className="px-3 sm:px-4 pb-3">
        {section.items.map((item, i) => (
          <Row key={i} item={item} />
        ))}
        {section.tip && (
          <div className="mt-3 rounded-xl border-l-4 border-amber-400 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-900 leading-relaxed">
            <strong className="text-amber-800">{section.tip.label}: </strong>
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-[9px] font-bold tracking-[2px] uppercase text-violet-600 mb-1.5">
        Pergunta {n.toString().padStart(2, "0")}
      </div>
      <p className="text-[13.5px] font-semibold text-zinc-900 leading-snug mb-2">
        {q}
      </p>
      {open && (
        <div className="text-[13px] text-zinc-700 bg-zinc-50 rounded-lg p-3 leading-relaxed mb-2 border border-zinc-200">
          {a}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-[12.5px] font-semibold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1"
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
  title,
  intro,
  sections,
  extrasTitle,
  extras,
  faq,
}: {
  title?: string;
  intro: string;
  sections: ApostilaSection[];
  extrasTitle?: string;
  extras?: ApostilaItem[];
  faq?: { question: string; answer: string }[];
}) {
  const printRef = useRef<HTMLDivElement>(null);

  const openPrintWindow = (autoPrint: boolean) => {
    if (!printRef.current) return;
    const html = printRef.current.innerHTML;
    const docTitle = title ?? "Apostila";
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) return;
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${docTitle}</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #18181b; padding: 32px; max-width: 820px; margin: 0 auto; }
  h1 { font-size: 24px; font-weight: 800; margin-bottom: 16px; }
  @media print { body { padding: 0; } .no-print { display: none; } }
</style>
</head><body>
<h1>${docTitle}</h1>
${html}
<script>${autoPrint ? "window.onload=()=>setTimeout(()=>window.print(),400);" : ""}</script>
</body></html>`);
    win.document.close();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          onClick={() => openPrintWindow(true)}
          className="inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Baixar PDF
        </button>
        <button
          type="button"
          onClick={() => openPrintWindow(false)}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-200 hover:bg-zinc-300 text-zinc-900 text-xs font-semibold px-4 py-2 transition-colors"
        >
          <Printer className="h-3.5 w-3.5" />
          Abrir para imprimir
        </button>
      </div>

      <div className="rounded-3xl bg-white text-zinc-900 p-5 sm:p-7 shadow-xl border border-zinc-200">
        <div ref={printRef} className="space-y-5">
          <div className="rounded-2xl bg-violet-50 border border-violet-200 p-4">
            <div className="text-[10px] font-semibold tracking-[3px] uppercase text-violet-700 mb-2">
              Conceito base
            </div>
            <p className="text-[14px] text-zinc-800 leading-relaxed">{intro}</p>
          </div>

          <div>
            <div className="text-[10px] font-semibold tracking-[3px] uppercase text-violet-700 mb-3">
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
              <div className="text-[10px] font-semibold tracking-[3px] uppercase text-violet-700 mb-3">
                {extrasTitle ?? "Outros produtos"}
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm px-4 py-2">
                {extras.map((item, i) => (
                  <Row key={i} item={item} />
                ))}
              </div>
            </div>
          )}

          {faq && faq.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold tracking-[3px] uppercase text-violet-700 mb-1">
                Perguntas de fixação
              </div>
              <p className="text-xs text-zinc-600 mb-3">
                Responda mentalmente — clique em <span className="text-violet-700 font-semibold">ver resposta</span> para conferir.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {faq.map((f, i) => (
                  <FaqCard key={i} q={f.question} a={f.answer} n={i + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
