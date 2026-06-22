import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Shield, Brain, FileText } from "lucide-react";

import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import { SubmissionHistoryDialog } from "@/components/SubmissionHistoryDialog";
import {
  AdminPendingBell,
  ADMIN_OPEN_CORRECTION_EVENT,
  type AdminOpenCorrectionDetail,
} from "@/components/AdminPendingBell";
import { CorrectionDialog, type CorrectionTarget } from "@/components/CorrectionDialog";
import { QuickChecklistDrawer } from "@/components/QuickChecklistDrawer";
import { DailyTasksButton } from "@/components/DailyTasksButton";

export function AppHeader({ isAdmin }: { isAdmin: boolean }) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [correction, setCorrection] = useState<CorrectionTarget | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<AdminOpenCorrectionDetail>).detail;
      if (!detail) return;
      setCorrection({
        id: detail.submissionId,
        user_id: detail.userId,
        subtask_id: detail.subtaskId,
        created_at: detail.createdAt,
        full_name: detail.fullName,
      });
    };
    window.addEventListener(ADMIN_OPEN_CORRECTION_EVENT, onOpen);
    return () => window.removeEventListener(ADMIN_OPEN_CORRECTION_EVENT, onOpen);
  }, [isAdmin]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="bg-[var(--brand-deep)] text-white">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <img
            src={logo}
            alt="Santa Bronx"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
          />
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">
              Santa Bronx
            </div>
            <div className="text-base font-semibold leading-tight truncate">
              Formação de Atendente
            </div>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {userId && <NotificationBell userId={userId} />}
          {isAdmin && <AdminPendingBell />}
          {userId && <DailyTasksButton />}
          <QuickChecklistDrawer />
          {userId && !isAdmin && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setHistoryOpen(true)}
              className="text-white hover:bg-white/10 hover:text-white gap-1.5"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Minhas provas</span>
            </Button>
          )}
          <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white gap-1.5">
            <Link to="/revisao">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Revisão</span>
            </Link>
          </Button>
          {isAdmin && (
            <Button asChild variant="secondary" size="sm" className="gap-1.5">
              <Link to="/admin">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </Button>
          )}

          <Button
            onClick={handleSignOut}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
      {userId && !isAdmin && (
        <SubmissionHistoryDialog
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          userId={userId}
        />
      )}
    </header>
  );
}
