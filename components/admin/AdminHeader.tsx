import { logoutAction } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import type { AdminSessionPayload } from "@/lib/auth/session";

type Props = {
  session: AdminSessionPayload;
};

export function AdminHeader({ session }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-6 shadow-[0_1px_0_rgb(15_23_42_/_0.04)]">
      <div className="text-sm text-slate-500">Панель управления сайтом</div>
      <div className="flex items-center gap-4 text-sm">
        <div className="hidden text-right leading-tight sm:block">
          <div className="font-medium text-slate-900">{session.name || session.email}</div>
          <div className="text-xs capitalize text-slate-500">{session.role}</div>
        </div>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-50"
          >
            Выйти
          </Button>
        </form>
      </div>
    </header>
  );
}
