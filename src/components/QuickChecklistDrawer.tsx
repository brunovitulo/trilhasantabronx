import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import checklistHtml from "@/content/embalar/checklist.html?raw";

export function QuickChecklistDrawer() {
  const [open, setOpen] = useState(false);
  // Force iframe to remount when reopened so checklist state resets.
  const [nonce, setNonce] = useState(0);

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setNonce((n) => n + 1);
      }}
    >
      <SheetTrigger asChild>
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
      </SheetTrigger>
      <SheetContent side="right" className="p-0 w-full sm:max-w-md flex flex-col">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="text-base">Checklist de embalagem</SheetTitle>
        </SheetHeader>
        <iframe
          key={nonce}
          src="/embalar/checklist.html"
          title="Checklist de embalagem"
          className="flex-1 w-full border-0"
        />
      </SheetContent>
    </Sheet>
  );
}
