import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Shield } from "lucide-react";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AppHeader({ isAdmin }: { isAdmin: boolean }) {
  const navigate = useNavigate();

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
    </header>
  );
}
