// Atividade de revisão por atendente.
// Mostra sessões diárias (módulos e grupos de produtos) + estado de
// mestria dos flashcards do Módulo 7.

import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  Sparkles,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TOPICS } from "@/data/topics";
import { PRODUCT_REVISION_GROUPS } from "@/data/produtosRevisao";

type Completion = {
  id: string;
  review_key: string;
  review_date: string;
  score_correct: number;
  score_total: number;
  metadata: Record<string, unknown> | null;
  completed_at: string;
};

type Mastery = {
  group_id: string;
  subcategory_id: string;
  product_slug: string;
  mastered_at: string | null;
  next_review_date: string | null;
  attempts: number;
  last_attempt_at: string | null;
};

type AnswerRow = {
  question: string;
  options?: string[];
  correctIndex: number;
  chosenIndex: number | null;
  correct: boolean;
  productName?: string;
};

function resolveTitle(reviewKey: string): string {
  if (reviewKey.startsWith("produtos:")) {
    const gid = reviewKey.slice("produtos:".length);
    const g = PRODUCT_REVISION_GROUPS.find((x) => x.id === gid);
    return g ? `Produtos · ${g.title}` : `Produtos · ${gid}`;
  }
  const t = TOPICS.find((x) => x.id === reviewKey);
  return t?.title ?? reviewKey;
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ReviewActivitySection({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [comps, setComps] = useState<Completion[]>([]);
  const [mastery, setMastery] = useState<Mastery[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [{ data: cData }, { data: mData }] = await Promise.all([
        supabase
          .from("daily_review_completions")
          .select("id, review_key, review_date, score_correct, score_total, metadata, completed_at")
          .eq("user_id", userId)
          .order("review_date", { ascending: false })
          .order("completed_at", { ascending: false }),
        supabase
          .from("product_flashcard_mastery")
          .select("group_id, subcategory_id, product_slug, mastered_at, next_review_date, attempts, last_attempt_at")
          .eq("user_id", userId)
          .order("attempts", { ascending: false }),
      ]);
      if (!alive) return;
      setComps((cData ?? []) as Completion[]);
      setMastery((mData ?? []) as Mastery[]);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  const byDay = useMemo(() => {
    const map: Record<string, Completion[]> = {};
    for (const c of comps) (map[c.review_date] ??= []).push(c);
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [comps]);

  const masteryByGroup = useMemo(() => {
    const map: Record<string, Mastery[]> = {};
    for (const m of mastery) (map[m.group_id] ??= []).push(m);
    return map;
  }, [mastery]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
          <Brain className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold leading-tight">Atividade de revisão diária</h3>
          <p className="text-[11px] text-muted-foreground">
            Sessões completadas, com respostas e progresso dos flashcards do Módulo 7.
          </p>
        </div>
      </div>

      {byDay.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground text-center">
          Nenhuma sessão de revisão registrada ainda.
        </Card>
      ) : (
        <div className="space-y-4">
          {byDay.map(([day, list]) => (
            <div key={day} className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="font-semibold uppercase tracking-wide">{fmtDate(day)}</span>
                <span>· {list.length} sessão{list.length > 1 ? "es" : ""}</span>
              </div>
              <div className="space-y-2">
                {list.map((c) => {
                  const isOpen = !!expanded[c.id];
                  const pct = c.score_total > 0 ? Math.round((c.score_correct / c.score_total) * 100) : 0;
                  const good = pct >= 70;
                  const answers = (c.metadata as { answers?: AnswerRow[] } | null)?.answers ?? [];
                  return (
                    <div key={c.id} className="rounded-2xl border border-border/60 bg-card/40">
                      <button
                        type="button"
                        onClick={() => setExpanded((p) => ({ ...p, [c.id]: !isOpen }))}
                        className="w-full text-left p-3.5 flex items-start gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{resolveTitle(c.review_key)}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            {c.score_total > 0 ? (
                              <Badge
                                variant="outline"
                                className={`font-mono ${good ? "text-emerald-300 border-emerald-500/40" : "text-amber-300 border-amber-500/40"}`}
                              >
                                {c.score_correct}/{c.score_total} · {pct}%
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground border-border/60">
                                sem quiz
                              </Badge>
                            )}
                            <span>
                              {new Date(c.completed_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {answers.length > 0 && <span>· {answers.length} respostas</span>}
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground mt-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground mt-1" />
                        )}
                      </button>
                      {isOpen && answers.length > 0 && (
                        <div className="border-t border-border/60 p-3.5 space-y-2.5">
                          {answers.map((a, i) => (
                            <div
                              key={i}
                              className={`rounded-xl border p-3 ${
                                a.correct ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"
                              }`}
                            >
                              <p className="text-xs font-semibold flex items-center gap-1.5">
                                {a.correct ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-rose-400" />
                                )}
                                {a.productName ? `${a.productName} · ` : ""}
                                {i + 1}. {a.question}
                              </p>
                              {a.options && (
                                <div className="mt-1.5 text-[11px] text-muted-foreground space-y-0.5">
                                  <p>
                                    <span className="font-semibold text-emerald-300">Correta:</span>{" "}
                                    {String.fromCharCode(97 + a.correctIndex)}) {a.options[a.correctIndex]}
                                  </p>
                                  {a.chosenIndex !== null && a.chosenIndex !== a.correctIndex && (
                                    <p>
                                      <span className="font-semibold text-rose-300">Atendente respondeu:</span>{" "}
                                      {String.fromCharCode(97 + a.chosenIndex)}) {a.options[a.chosenIndex]}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flashcards do Módulo 7 */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-tight">Flashcards de produtos (Módulo 7)</h3>
            <p className="text-[11px] text-muted-foreground">
              Quantas vezes cada produto voltou para a fila por erro repetido.
            </p>
          </div>
        </div>
        {mastery.length === 0 ? (
          <Card className="p-5 text-sm text-muted-foreground text-center">
            Nenhuma tentativa de flashcard ainda.
          </Card>
        ) : (
          <div className="space-y-3">
            {Object.entries(masteryByGroup).map(([gid, list]) => {
              const grp = PRODUCT_REVISION_GROUPS.find((g) => g.id === gid);
              return (
                <div key={gid} className="rounded-2xl border border-border/60 bg-card/40 p-3.5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">{grp?.title ?? gid}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {list.map((m) => {
                      const isMastered = !!m.mastered_at;
                      const bounceBack = Math.max(0, m.attempts - 1);
                      return (
                        <div
                          key={`${m.subcategory_id}/${m.product_slug}`}
                          className={`text-[11px] rounded-lg border px-2.5 py-1.5 flex items-center justify-between gap-2 ${
                            isMastered
                              ? "border-emerald-500/30 bg-emerald-500/5"
                              : bounceBack >= 2
                              ? "border-rose-500/40 bg-rose-500/10"
                              : "border-border/60 bg-card/30"
                          }`}
                        >
                          <span className="truncate" title={m.product_slug}>
                            {m.product_slug.replace(/-/g, " ")}
                          </span>
                          <span className="flex items-center gap-1.5 shrink-0">
                            {isMastered ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <span className="text-rose-300 font-semibold">×{bounceBack}</span>
                            )}
                            <span className="text-muted-foreground">{m.attempts}t</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
