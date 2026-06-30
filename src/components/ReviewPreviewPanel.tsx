// Painel de preview de revisões para o admin.
// Abre a tela /revisao-do-dia em modo visualização para qualquer módulo
// ou grupo de produtos do Módulo 7.

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Eye, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TOPICS } from "@/data/topics";
import { PRODUCT_REVISION_GROUPS } from "@/data/produtosRevisao";

export function ReviewPreviewPanel() {
  const [open, setOpen] = useState(false);

  return (
    <Card className="mb-4 border-white/10 bg-white/[0.06] backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-amber-300">
            <Eye className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Visualizar revisões</p>
            <p className="text-[11px] text-muted-foreground">
              Pré-visualize qualquer revisão (sem afetar dados reais).
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t border-white/10 p-4 space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">
              Quizzes por módulo
            </p>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <Button
                  key={t.id}
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                >
                  <Link
                    to="/revisao-do-dia"
                    search={{ preview: `module:${t.id}` }}
                    target="_blank"
                  >
                    {t.title}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Flashcards de produtos (Módulo 7)
            </p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_REVISION_GROUPS.map((g) => (
                <Button
                  key={g.id}
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-full border-fuchsia-500/30 bg-fuchsia-500/5 hover:bg-fuchsia-500/10"
                >
                  <Link
                    to="/revisao-do-dia"
                    search={{ preview: `group:${g.id}` }}
                    target="_blank"
                  >
                    {g.title}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
