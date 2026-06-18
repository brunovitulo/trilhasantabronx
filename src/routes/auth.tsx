import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Entrar — Santa Bronx Formação" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate({ to: "/", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Não consegui entrar", { description: error.message });
      return;
    }
    navigate({ to: "/", replace: true });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Não consegui cadastrar", { description: error.message });
      return;
    }
    toast.success("Cadastro feito! Pode entrar.");
  }

  const inputCls =
    "bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary/60 focus-visible:border-white/20";

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-10">
      {/* halos roxos sutis */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-700/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <img
          src={logo}
          alt="Santa Bronx"
          className="h-20 w-20 rounded-full ring-2 ring-white/10 shadow-[0_0_40px_rgba(168,85,247,0.35)] mb-4"
        />
        <h1 className="text-white text-2xl font-bold tracking-tight">Santa Bronx</h1>
        <p className="text-white/60 text-sm mb-6">Formação de Atendente</p>

        <Card className="w-full border-white/10 bg-white/5 backdrop-blur-xl text-white shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Acessar a trilha</CardTitle>
            <CardDescription className="text-white/60">
              Use seu login individual para salvar seu progresso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
                <TabsTrigger
                  value="signin"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
                >
                  Cadastrar
                </TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-white/80">E-mail</Label>
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-white/80">Senha</Label>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-fuchsia-600 text-white hover:opacity-90 border-0 shadow-lg shadow-primary/30"
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-white/80">Nome completo</Label>
                    <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email2" className="text-white/80">E-mail</Label>
                    <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password2" className="text-white/80">Senha</Label>
                    <Input id="password2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-fuchsia-600 text-white hover:opacity-90 border-0 shadow-lg shadow-primary/30"
                  >
                    {loading ? "Cadastrando..." : "Criar conta"}
                  </Button>
                  <p className="text-xs text-white/50 text-center">
                    O primeiro cadastro vira admin automaticamente.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
