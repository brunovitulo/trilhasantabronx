import { useState } from "react";
import { ClipboardCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import checklistHtml from "@/content/embalar/checklist.html?raw";

export function QuickChecklistDrawer() {
  const [open, setOpen] = useState(false);
  const [nonce, setNonce] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setNonce((n) => n + 1);
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 hover:text-white gap-1.5"
          aria-label="Abrir checklist de embalagem"
          title="Checklist de embalagem"
        >
          <ClipboardCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Checklist</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="p-0 w-[90vw] h-[90vh] max-w-[90vw] sm:max-w-[90vw] flex flex-col gap-0 [&>button]:hidden overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
          <DialogTitle className="text-base">Checklist de embalagem</DialogTitle>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <iframe
          key={nonce}
          srcDoc={checklistHtml}
          title="Checklist de embalagem"
          className="flex-1 w-full border-0 bg-white"
        />
      </DialogContent>
    </Dialog>
  );
}
