"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { leadStatusValues, type Lead, type LeadStatus } from "@/lib/db/schema";
import { LEAD_STATUS_LABEL_RU, normalizeLeadStatus } from "@/lib/leads/lead-status-public";

import { updateLeadAction, type UpdateLeadState } from "@/app/admin/leads/actions";

type Props = {
  lead: Lead;
};

export function LeadEditForm({ lead }: Props) {
  const normalized = normalizeLeadStatus(lead.status);
  const [state, formAction, pending] = useActionState<UpdateLeadState | undefined, FormData>(
    updateLeadAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border bg-background p-4">
      <input type="hidden" name="id" value={lead.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lead-status">Статус заявки</Label>
          <select
            id="lead-status"
            name="status"
            defaultValue={normalized}
            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            {leadStatusValues.map((s: LeadStatus) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABEL_RU[s]}
              </option>
            ))}
          </select>
          {lead.status !== normalized ? (
            <p className="text-xs text-muted-foreground">
              В БД: <code className="rounded bg-muted px-1">{lead.status}</code> (показано как{" "}
              {LEAD_STATUS_LABEL_RU[normalized]})
            </p>
          ) : null}
        </div>
        <div className="text-xs text-muted-foreground sm:flex sm:flex-col sm:justify-end">
          <p>
            Обновлено: {new Date(lead.updatedAt).toLocaleString("ru-RU")}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="internalNote">Внутренняя заметка (только админка)</Label>
        <Textarea
          id="internalNote"
          name="internalNote"
          rows={5}
          defaultValue={lead.internalNote ?? ""}
          placeholder="Фиксируйте договорённости, следующий шаг, ссылку на сделку…"
          className="resize-y text-sm"
        />
      </div>

      {state?.ok === false ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok === true ? (
        <p className="text-sm text-muted-foreground">Сохранено.</p>
      ) : null}

      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Сохранение…" : "Сохранить"}
      </Button>
    </form>
  );
}
