import { useEffect, useState } from "react";
import { Eye, LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BACKUP_KEY = "impersonation:admin-session";
const INFO_KEY = "impersonation:target";

type Backup = {
  access_token: string;
  refresh_token: string;
  storageKey?: string | null;
  storageValue?: string | null;
  savedAt?: string;
};
type Info = { name: string | null; email: string };

function findAuthStorageKey() {
  if (typeof window === "undefined") return null;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && /^sb-.+-auth-token$/.test(key)) return key;
  }
  return null;
}

function readJwtExpiry(token: string) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized)) as { exp?: number };
    return typeof decoded.exp === "number" ? decoded.exp : null;
  } catch {
    return null;
  }
}

function patchStoredSessionFromTokens(backup: Backup) {
  const key = backup.storageKey || findAuthStorageKey();
  if (!key) return false;
  const existingRaw = localStorage.getItem(key);
  const expiresAt = readJwtExpiry(backup.access_token) ?? Math.floor(Date.now() / 1000) + 3600;
  const sessionPatch = {
    access_token: backup.access_token,
    refresh_token: backup.refresh_token,
    token_type: "bearer",
    expires_at: expiresAt,
    expires_in: Math.max(0, expiresAt - Math.floor(Date.now() / 1000)),
  };

  try {
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    if (existing && typeof existing === "object" && "currentSession" in existing) {
      localStorage.setItem(
        key,
        JSON.stringify({
          ...existing,
          currentSession: { ...(existing.currentSession ?? {}), ...sessionPatch },
        }),
      );
    } else if (existing && typeof existing === "object" && "session" in existing) {
      localStorage.setItem(
        key,
        JSON.stringify({
          ...existing,
          session: { ...(existing.session ?? {}), ...sessionPatch },
        }),
      );
    } else {
      localStorage.setItem(key, JSON.stringify({ ...existing, ...sessionPatch }));
    }
    return true;
  } catch {
    localStorage.setItem(key, JSON.stringify(sessionPatch));
    return true;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error("Tempo esgotado ao restaurar sessão.")), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

export function isImpersonating(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(BACKUP_KEY);
}

export function forceStopImpersonationNow(): { restored: boolean } {
  if (typeof window === "undefined") return { restored: false };
  const raw = localStorage.getItem(BACKUP_KEY);
  if (!raw) {
    localStorage.removeItem(INFO_KEY);
    return { restored: false };
  }

  let restored = false;
  try {
    const backup = JSON.parse(raw) as Backup;
    if (backup.storageKey && backup.storageValue) {
      localStorage.setItem(backup.storageKey, backup.storageValue);
      restored = true;
    } else if (backup.access_token && backup.refresh_token) {
      restored = patchStoredSessionFromTokens(backup);
    }
  } catch {
    restored = false;
  }

  localStorage.removeItem(BACKUP_KEY);
  localStorage.removeItem(INFO_KEY);
  return { restored };
}

function readImpersonationInfo(): Info | null {
  if (typeof window === "undefined") return null;
  if (!localStorage.getItem(BACKUP_KEY)) return null;
  const raw = localStorage.getItem(INFO_KEY);
  if (!raw) return { name: null, email: "usuário visualizado" };
  try {
    return JSON.parse(raw) as Info;
  } catch {
    return { name: null, email: "usuário visualizado" };
  }
}

export async function stopImpersonation(): Promise<{ restored: boolean }> {
  const raw = localStorage.getItem(BACKUP_KEY);
  if (!raw) {
    localStorage.removeItem(INFO_KEY);
    return { restored: false };
  }

  let backup: Backup | null = null;
  try {
    backup = JSON.parse(raw) as Backup;
  } catch {
    localStorage.removeItem(BACKUP_KEY);
    localStorage.removeItem(INFO_KEY);
    return { restored: false };
  }

  try {
    if (backup.storageKey && backup.storageValue) {
      return forceStopImpersonationNow();
    }

    const { error } = await withTimeout(
      supabase.auth.setSession({
        access_token: backup.access_token,
        refresh_token: backup.refresh_token,
      }),
      3500,
    );
    if (error) throw new Error(error.message);
    localStorage.removeItem(BACKUP_KEY);
    localStorage.removeItem(INFO_KEY);
    return { restored: true };
  } catch {
    const patched = forceStopImpersonationNow().restored;
    if (patched) return { restored: true };
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    return { restored: false };
  }
}

export async function startImpersonation(params: {
  tokenHash: string;
  email: string;
  name: string | null;
}) {
  const { data: sessionData, error: sErr } = await supabase.auth.getSession();
  if (sErr || !sessionData.session) throw new Error("Sessão de admin não encontrada.");
  const storageKey = findAuthStorageKey();
  const backup: Backup = {
    access_token: sessionData.session.access_token,
    refresh_token: sessionData.session.refresh_token,
    storageKey,
    storageValue: storageKey ? localStorage.getItem(storageKey) : null,
    savedAt: new Date().toISOString(),
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
      setInfo(readImpersonationInfo());
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
    const result = forceStopImpersonationNow();
    window.location.replace(result.restored ? "/admin" : "/auth");
  }

  return (
    <>
      {/* Spacer so page content isn't hidden under the fixed banner */}
      <div aria-hidden className="h-11" />
      <div className="fixed inset-x-0 top-0 z-[2147483647] border-b border-amber-400/40 bg-amber-500/95 shadow-lg backdrop-blur-xl">
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
            onPointerDownCapture={(event) => {
              event.preventDefault();
              event.stopPropagation();
              exit();
            }}
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
