import Link from "next/link";

import {
  deleteCategoryAction,
  deleteSubcategoryAction,
  moveCategoryInListAction,
  moveSubcategoryInListAction,
  quickSetCategorySortOrderAction,
  quickSetSubcategorySortOrderAction,
} from "@/app/admin/categories/actions";
import { DestructiveConfirmForm } from "@/components/admin/DestructiveConfirmForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CategoryWithSubcategories } from "@/lib/services/categories";

function compareBySort<T extends { sortOrder: number; name: string }>(a: T, b: T) {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.name.localeCompare(b.name, "ru");
}

const orderCol =
  "sticky left-0 z-10 w-[12.5rem] min-w-[12.5rem] max-w-[14rem] bg-white align-top shadow-[4px_0_12px_-8px_rgba(15,23,42,0.35)]";

type ListView = "categories" | "subcategories";

export function CategoriesOrderTable({
  categories,
  listReturnEncoded,
  listView,
}: {
  categories: CategoryWithSubcategories[];
  listReturnEncoded: string;
  listView: ListView;
}) {
  const sorted = [...categories].sort(compareBySort);

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-[#E2E8F0] text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className={`${orderCol} border-r border-[#E2E8F0] px-3 py-2`}>
              <span className="block">Порядок</span>
              <span className="mt-0.5 block text-[11px] font-normal normal-case tracking-normal text-slate-400">
                sort_order · ↑↓ · OK
              </span>
            </th>
            <th className="px-4 py-2">Категория</th>
            <th className="px-4 py-2 font-medium">Ссылка</th>
            <th className="px-4 py-2 font-medium">Статус</th>
            <th className="px-4 py-2 font-medium">Подкатегории</th>
            <th className="w-28 px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                Категории не найдены. Запустите <code>npm run db:import-catalog</code>.
              </td>
            </tr>
          ) : (
            sorted.map((c, index) => (
              <tr
                key={c.id}
                id={`taxonomy-row-cat-${c.id}`}
                className="group scroll-mt-24 border-b border-[#E2E8F0] transition-colors last:border-0 hover:bg-slate-50/90"
              >
                <td className={`${orderCol} border-r border-[#E2E8F0] px-3 py-2 group-hover:bg-slate-50`}>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-1">
                      <form action={moveCategoryInListAction} className="inline">
                        <input type="hidden" name="listView" value={listView} />
                        <input type="hidden" name="id" value={String(c.id)} />
                        <input type="hidden" name="direction" value="up" />
                        <Button
                          type="submit"
                          variant="outline"
                          size="icon"
                          className="size-8 shrink-0"
                          disabled={index === 0}
                          aria-label="Поднять выше"
                        >
                          ↑
                        </Button>
                      </form>
                      <form action={moveCategoryInListAction} className="inline">
                        <input type="hidden" name="listView" value={listView} />
                        <input type="hidden" name="id" value={String(c.id)} />
                        <input type="hidden" name="direction" value="down" />
                        <Button
                          type="submit"
                          variant="outline"
                          size="icon"
                          className="size-8 shrink-0"
                          disabled={index === sorted.length - 1}
                          aria-label="Опустить ниже"
                        >
                          ↓
                        </Button>
                      </form>
                    </div>
                    <form action={quickSetCategorySortOrderAction} className="flex flex-wrap items-center gap-1">
                      <input type="hidden" name="listView" value={listView} />
                      <input type="hidden" name="id" value={String(c.id)} />
                      <Input
                        name="sortOrder"
                        type="number"
                        inputMode="numeric"
                        defaultValue={c.sortOrder}
                        className="h-8 w-[4.5rem] tabular-nums"
                        aria-label="Номер порядка"
                      />
                      <Button type="submit" size="sm" variant="secondary" className="h-8 shrink-0 px-2 text-xs">
                        OK
                      </Button>
                    </form>
                  </div>
                </td>
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{c.slug}</td>
                <td className="px-4 py-2">
                  {c.isActive ? (
                    <Badge variant="secondary">активна</Badge>
                  ) : (
                    <Badge variant="outline">скрыта</Badge>
                  )}
                </td>
                <td className="px-4 py-2 text-xs text-muted-foreground">
                  {c.subcategories.length
                    ? `${c.subcategories.length}: ${c.subcategories.map((s) => s.name).join(", ")}`
                    : "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/categories/${c.id}/edit?returnTo=${listReturnEncoded}`}>
                        Изменить
                      </Link>
                    </Button>
                    <DestructiveConfirmForm
                      action={deleteCategoryAction}
                      confirmMessage="Удалить категорию окончательно? Это можно сделать только если в ней нет товаров и подкатегорий."
                    >
                      <input type="hidden" name="id" value={String(c.id)} />
                      <input type="hidden" name="returnTo" value={`/admin/categories?view=${listView}`} />
                      <Button type="submit" variant="destructive" size="sm">
                        Удалить
                      </Button>
                    </DestructiveConfirmForm>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

type SubcategoryRow = {
  category: CategoryWithSubcategories;
  subcategory: CategoryWithSubcategories["subcategories"][number];
  indexInCategory: number;
  totalInCategory: number;
};

export function SubcategoriesOrderTable({
  categories,
  listReturnEncoded,
  listView,
}: {
  categories: CategoryWithSubcategories[];
  listReturnEncoded: string;
  listView: ListView;
}) {
  const rows: SubcategoryRow[] = categories.flatMap((category) => {
    const subs = [...category.subcategories].sort(compareBySort);
    return subs.map((subcategory, indexInCategory, arr) => ({
      category,
      subcategory,
      indexInCategory,
      totalInCategory: arr.length,
    }));
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-[#E2E8F0] text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className={`${orderCol} border-r border-[#E2E8F0] px-3 py-2`}>
              <span className="block">Порядок</span>
              <span className="mt-0.5 block text-[11px] font-normal normal-case tracking-normal text-slate-400">
                внутри категории · ↑↓ · OK
              </span>
            </th>
            <th className="px-4 py-2">Подкатегория</th>
            <th className="px-4 py-2">Категория</th>
            <th className="px-4 py-2">Ссылка</th>
            <th className="px-4 py-2">Статус</th>
            <th className="w-28 px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                Подкатегории не найдены.
              </td>
            </tr>
          ) : (
            rows.map(({ category, subcategory, indexInCategory, totalInCategory }) => (
              <tr
                key={subcategory.id}
                id={`taxonomy-row-sub-${subcategory.id}`}
                className="group scroll-mt-24 border-b border-[#E2E8F0] transition-colors last:border-0 hover:bg-slate-50/90"
              >
                <td className={`${orderCol} border-r border-[#E2E8F0] px-3 py-2 group-hover:bg-slate-50`}>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-1">
                      <form action={moveSubcategoryInListAction} className="inline">
                        <input type="hidden" name="listView" value={listView} />
                        <input type="hidden" name="id" value={String(subcategory.id)} />
                        <input type="hidden" name="categoryId" value={String(category.id)} />
                        <input type="hidden" name="direction" value="up" />
                        <Button
                          type="submit"
                          variant="outline"
                          size="icon"
                          className="size-8 shrink-0"
                          disabled={indexInCategory === 0}
                          aria-label="Поднять выше в категории"
                        >
                          ↑
                        </Button>
                      </form>
                      <form action={moveSubcategoryInListAction} className="inline">
                        <input type="hidden" name="listView" value={listView} />
                        <input type="hidden" name="id" value={String(subcategory.id)} />
                        <input type="hidden" name="categoryId" value={String(category.id)} />
                        <input type="hidden" name="direction" value="down" />
                        <Button
                          type="submit"
                          variant="outline"
                          size="icon"
                          className="size-8 shrink-0"
                          disabled={indexInCategory === totalInCategory - 1}
                          aria-label="Опустить ниже в категории"
                        >
                          ↓
                        </Button>
                      </form>
                    </div>
                    <form
                      action={quickSetSubcategorySortOrderAction}
                      className="flex flex-wrap items-center gap-1"
                    >
                      <input type="hidden" name="listView" value={listView} />
                      <input type="hidden" name="id" value={String(subcategory.id)} />
                      <input type="hidden" name="categoryId" value={String(category.id)} />
                      <Input
                        name="sortOrder"
                        type="number"
                        inputMode="numeric"
                        defaultValue={subcategory.sortOrder}
                        className="h-8 w-[4.5rem] tabular-nums"
                        aria-label="Номер порядка"
                      />
                      <Button type="submit" size="sm" variant="secondary" className="h-8 shrink-0 px-2 text-xs">
                        OK
                      </Button>
                    </form>
                  </div>
                </td>
                <td className="px-4 py-2 font-medium">{subcategory.name}</td>
                <td className="px-4 py-2 text-muted-foreground">{category.name}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{subcategory.slug}</td>
                <td className="px-4 py-2">
                  {subcategory.isActive ? (
                    <Badge variant="secondary">активна</Badge>
                  ) : (
                    <Badge variant="outline">скрыта</Badge>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/admin/categories/${category.id}/subcategories/${subcategory.id}/edit?returnTo=${listReturnEncoded}`}
                      >
                        Изменить
                      </Link>
                    </Button>
                    <DestructiveConfirmForm
                      action={deleteSubcategoryAction}
                      confirmMessage="Удалить подкатегорию окончательно? Это можно сделать только если в ней нет товаров."
                    >
                      <input type="hidden" name="id" value={String(subcategory.id)} />
                      <input type="hidden" name="categoryId" value={String(category.id)} />
                      <input type="hidden" name="returnTo" value={`/admin/categories?view=${listView}`} />
                      <Button type="submit" variant="destructive" size="sm">
                        Удалить
                      </Button>
                    </DestructiveConfirmForm>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="border-t border-[#E2E8F0] px-4 py-3 text-xs text-slate-500">
        Новая подкатегория создаётся внутри нужной категории: откройте категорию и нажмите «Добавить подкатегорию». Стрелки меняют
        порядок только внутри родительской категории.
      </div>
    </div>
  );
}
