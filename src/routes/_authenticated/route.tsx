import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ExamResultPopup } from "@/components/ExamResultPopup";
import { DailyTasksGate } from "@/components/DailyTasksGate";

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
  return (
    <>
      <Outlet />
      <ExamResultPopup userId={user.id} />
      <DailyTasksGate userId={user.id} />
    </>
  );
}
