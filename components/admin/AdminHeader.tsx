import { logoutAction } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import type { AdminSessionPayload } from "@/lib/auth/session";

type Props = {
  session: AdminSessionPayload;
};

export function AdminHeader({ session }: Props) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="text-sm text-muted-foreground">
        Административная панель
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="text-right leading-tight">
          <div className="font-medium">{session.name || session.email}</div>
          <div className="text-xs text-muted-foreground">
            {session.role}
          </div>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Выйти
          </Button>
        </form>
      </div>
    </header>
  );
}
