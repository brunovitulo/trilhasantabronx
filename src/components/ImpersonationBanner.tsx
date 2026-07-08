import { useEffect, useState } from "react";
import { Eye, LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BACKUP_KEY = "impersonation:admin-session";
const INFO_KEY = "impersonation:target";

type Backup = { access_token: string; refresh_token: string };
type Info = { name: string | null; email: string };

export function isImpersonating(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(BACKUP_KEY);
}

export async function startImpersonation(params: {
  tokenHash: string;
  email: string;
  name: string | null;
}) {
  const { data: sessionData, error: sErr } = await supabase.auth.getSession();
  if (sErr || !sessionData.session) throw new Error("Sessão de admin não encontrada.");
  const backup: Backup = {
    access_token: sessionData.session.access_token,
    refresh_token: sessionData.session.refresh_token,
  };
  const info: Info = { name: params.name, email: params.email };

  const { error } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: params.tokenHash,
  });
  if (error) throw new Error(error.message);

  // Persist AFTER successful swap so a failure doesn't strand the admin.
  localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
  localStorage.setItem(INFO_KEY, JSON.stringify(info));
}

export function ImpersonationBanner() {
  const [info, setInfo] = useState<Info | null>(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const read = () => {
      const raw = localStorage.getItem(INFO_KEY);
      const has = !!localStorage.getItem(BACKUP_KEY);
      setInfo(has && raw ? (JSON.parse(raw) as Info) : null);
    };
    read();
    window.addEventListener("storage", read);
    const t = window.setInterval(read, 1000);
    return () => {
      window.removeEventListener("storage", read);
      window.clearInterval(t);
    };
  }, []);

  if (!info) return null;

  async function exit() {
    setExiting(true);
    try {
      const raw = localStorage.getItem(BACKUP_KEY);
      if (!raw) throw new Error("Backup de sessão não encontrado.");
      const backup = JSON.parse(raw) as Backup;
      const { error } = await supabase.auth.setSession(backup);
      if (error) throw new Error(error.message);
      localStorage.removeItem(BACKUP_KEY);
      localStorage.removeItem(INFO_KEY);
      window.location.href = "/admin";
    } catch (err) {
      toast.error("Falha ao voltar", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
      setExiting(false);
    }
  }

  return (
    <>
      {/* Spacer so page content isn't hidden under the fixed banner */}
      <div aria-hidden className="h-11" />
      <div className="fixed inset-x-0 top-0 z-[200] border-b border-amber-400/40 bg-amber-500/95 shadow-lg backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-amber-950 min-w-0">
            <Eye className="h-4 w-4 shrink-0" />
            <span className="truncate">
              Visualizando como{" "}
              <strong className="font-semibold">{info.name ?? info.email}</strong>
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={exit}
            disabled={exiting}
            className="h-8 gap-1.5 rounded-full bg-amber-950 text-amber-50 hover:bg-amber-900 shrink-0"
          >
            {exiting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
            Sair da visualização
          </Button>
        </div>
      </div>
    </>
  );
}
