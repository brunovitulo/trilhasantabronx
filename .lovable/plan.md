## Redesign da página /auth

Trocar o fundo roxo da página de login por **preto puro** e aplicar o mesmo visual glassmorphism usado no resto do app (home, tópicos, admin).

### Mudanças em `src/routes/auth.tsx`

1. **Fundo**: substituir `bg-gradient-to-br from-[var(--brand-deep)] via-purple-900 to-fuchsia-900` por um fundo preto (`bg-black`) com sutis halos roxos de fundo (blobs `blur-3xl` em `bg-primary/20` posicionados absolutamente) para manter a identidade Santa Bronx sem perder o preto dominante.
2. **Card**: aplicar a mesma classe glass usada no app (`bg-white/5 backdrop-blur-xl border border-white/10`) em vez do Card branco padrão; texto em branco/`white/70`.
3. **Tabs / Inputs / Labels**: ajustar para o tema escuro — `TabsList` translúcido, inputs com `bg-white/5 border-white/10 text-white placeholder:text-white/40`, labels em `text-white/80`.
4. **Botão Entrar/Criar conta**: usar o gradiente roxo da marca (mesma variante já usada nos CTAs do app) para criar contraste sobre o preto.
5. **Logo + título**: mantidos no topo; ajustar o ring do logo para `ring-white/10` e o subtítulo para `text-white/60`.

Nada de lógica de auth muda — apenas estilos.
