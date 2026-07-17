"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { Label } from "@/components/ui/label";

const CYRILLIC_MAP: Record<string, string> = {
  "\u0430": "a",
  "\u0431": "b",
  "\u0432": "v",
  "\u0433": "g",
  "\u0434": "d",
  "\u0435": "e",
  "\u0451": "yo",
  "\u0436": "zh",
  "\u0437": "z",
  "\u0438": "i",
  "\u0439": "y",
  "\u043a": "k",
  "\u043b": "l",
  "\u043c": "m",
  "\u043d": "n",
  "\u043e": "o",
  "\u043f": "p",
  "\u0440": "r",
  "\u0441": "s",
  "\u0442": "t",
  "\u0443": "u",
  "\u0444": "f",
  "\u0445": "h",
  "\u0446": "ts",
  "\u0447": "ch",
  "\u0448": "sh",
  "\u0449": "sch",
  "\u044a": "",
  "\u044b": "y",
  "\u044c": "",
  "\u044d": "e",
  "\u044e": "yu",
  "\u044f": "ya",
};

function slugify(input: string): string {
  let output = "";

  for (const char of input.trim().toLowerCase()) {
    if (CYRILLIC_MAP[char] !== undefined) {
      output += CYRILLIC_MAP[char];
    } else if (/[a-z0-9]/.test(char)) {
      output += char;
    } else {
      output += "-";
    }
  }

  return output
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160);
}

type Props = {
  initialName?: string;
  initialSlug?: string;
  nameLabel: ReactNode;
  slugLabel: ReactNode;
  nameId?: string;
  slugId?: string;
  nameContainerClassName?: string;
  slugContainerClassName?: string;
  nameRequired?: boolean;
  slugRequired?: boolean;
  slugPlaceholder?: string;
};

export function AdminNameSlugFields({
  initialName = "",
  initialSlug = "",
  nameLabel,
  slugLabel,
  nameId = "name",
  slugId = "slug",
  nameContainerClassName = "space-y-2",
  slugContainerClassName = "space-y-2",
  nameRequired = true,
  slugRequired = true,
  slugPlaceholder,
}: Props) {
  const [nameValue, setNameValue] = useState(initialName);
  const [slugValue, setSlugValue] = useState(initialSlug || slugify(initialName));
  const [syncSlug, setSyncSlug] = useState(!initialSlug);
  const generatedSlug = useMemo(() => slugify(nameValue), [nameValue]);
  const slugChanged = Boolean(initialSlug && slugValue.trim() && slugValue.trim() !== initialSlug);

  return (
    <>
      <div className={nameContainerClassName}>
        <Label htmlFor={nameId}>{nameLabel}</Label>
        <input
          id={nameId}
          name="name"
          required={nameRequired}
          value={nameValue}
          onChange={(event) => {
            const nextName = event.target.value;
            setNameValue(nextName);
            if (syncSlug) {
              setSlugValue(slugify(nextName));
            }
          }}
          className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
        />
      </div>

      <div className={slugContainerClassName}>
        <Label htmlFor={slugId}>{slugLabel}</Label>
        <input
          id={slugId}
          name="slug"
          required={slugRequired}
          value={slugValue}
          placeholder={slugPlaceholder}
          onChange={(event) => {
            setSyncSlug(false);
            setSlugValue(slugify(event.target.value));
          }}
          className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm font-mono text-xs"
        />
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <button
            type="button"
            className="rounded border border-border bg-background px-2 py-1 text-foreground hover:bg-muted"
            onClick={() => {
              setSlugValue(generatedSlug);
              setSyncSlug(true);
            }}
          >
            Собрать из названия
          </button>
          <span>
            {syncSlug
              ? "Ссылка обновляется от названия."
              : "Ручной режим: ссылка не меняется от названия."}
          </span>
        </div>
        {slugChanged ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            После сохранения публичный URL изменится: старый адрес может перестать открываться без отдельного редиректа.
          </p>
        ) : null}
      </div>
    </>
  );
}
