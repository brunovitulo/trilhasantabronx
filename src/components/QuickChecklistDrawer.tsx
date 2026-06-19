import { useState } from "react";
import { ClipboardCheck, Package, LayoutGrid, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import checklistEmbalarHtml from "@/content/embalar/checklist.html?raw";
import checklistOrganizacaoHtml from "@/content/organizacao/checklist.html?raw";
import checklistAppPedidosHtml from "@/content/responsabilidade/app-checklist.html?raw";

type ChecklistKey = "embalar" | "organizacao" | "app_pedidos";

const CHECKLISTS: Record<ChecklistKey, { title: string; html: string; label: string; Icon: typeof Package }> = {
  embalar: { title: "Checklist de embalagem", label: "Checklist de embalagem", html: checklistEmbalarHtml, Icon: Package },
  organizacao: { title: "Checklist — Organização da loja", label: "Checklist de organização da loja", html: checklistOrganizacaoHtml, Icon: LayoutGrid },
  app_pedidos: { title: "Checklist — App de Pedidos", label: "Checklist do app de pedidos", html: checklistAppPedidosHtml, Icon: FileText },
};

export function QuickChecklistDrawer() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<ChecklistKey | null>(null);
  const [nonce, setNonce] = useState(0);

  function pick(key: ChecklistKey) {
    setMenuOpen(false);
    setNonce((n) => n + 1);
    setActive(key);
  }

  const current = active ? CHECKLISTS[active] : null;

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 hover:text-white gap-1.5"
            aria-label="Abrir checklists"
            title="Checklists"
          >
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Checklists</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-2">
          <button
            type="button"
            onClick={() => pick("embalar")}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent transition-colors"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Package className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">Checklist de embalagem</span>
          </button>
          <button
            type="button"
            onClick={() => pick("organizacao")}
            className="mt-1 w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent transition-colors"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">Checklist de organização da loja</span>
          </button>
        </PopoverContent>
      </Popover>

      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent
          className="p-0 w-[90vw] h-[90vh] max-w-[90vw] sm:max-w-[90vw] flex flex-col gap-0 [&>button]:hidden overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
            <DialogTitle className="text-base">{current?.title ?? ""}</DialogTitle>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {current && (
            <iframe
              key={nonce}
              srcDoc={current.html}
              title={current.title}
              className="flex-1 w-full border-0 bg-white"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
