import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Redefinir senha — Santa Bronx" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // O Supabase processa o token de recuperação no carregamento e dispara
    // o evento PASSWORD_RECOVERY. Também checamos sessão já existente.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não conferem.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error("Não consegui atualizar a senha", { description: error.message });
      return;
    }
    toast.success("Senha atualizada! Já pode entrar.");
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const inputCls =
    "bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary/60 focus-visible:border-white/20";

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/15 blur-3xl" />

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <img
          src={logo}
          alt="Santa Bronx"
          className="h-20 w-20 rounded-full ring-2 ring-white/10 shadow-[0_0_40px_rgba(168,85,247,0.35)] mb-4"
        />
        <h1 className="text-white text-2xl font-bold tracking-tight">Redefinir senha</h1>
        <p className="text-white/60 text-sm mb-6">Crie uma nova senha para sua conta</p>

        <Card className="w-full border-white/10 bg-white/5 backdrop-blur-xl text-white shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Nova senha</CardTitle>
            <CardDescription className="text-white/60">
              {ready
                ? "Digite a nova senha duas vezes para confirmar."
                : "Validando seu link de recuperação..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ready ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-white/80">Nova senha</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-white/80">Confirmar senha</Label>
                  <Input
                    id="confirm"
                    type="password"
                    required
                    minLength={6}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-fuchsia-600 text-white hover:opacity-90 border-0 shadow-lg shadow-primary/30"
                >
                  {loading ? "Salvando..." : "Salvar nova senha"}
                </Button>
              </form>
            ) : (
              <p className="text-sm text-white/60 text-center py-4">
                Se você veio aqui sem clicar no link do e-mail, peça uma nova recuperação na tela de entrada.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
