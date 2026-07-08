import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExamResultPopup } from "@/components/ExamResultPopup";
import { DailyTasksGate } from "@/components/DailyTasksGate";
import { ImpersonationBanner, isImpersonating } from "@/components/ImpersonationBanner";


export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();
  const [impersonating, setImpersonating] = useState(false);

  useEffect(() => {
    const read = () => setImpersonating(isImpersonating());
    read();
    window.addEventListener("storage", read);
    window.addEventListener("impersonation:changed", read);
    const intervalId = window.setInterval(read, 1000);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("impersonation:changed", read);
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <ImpersonationBanner />
      <Outlet />
      {!impersonating && <ExamResultPopup userId={user.id} />}
      {!impersonating && <DailyTasksGate userId={user.id} />}
    </>

  );
}
