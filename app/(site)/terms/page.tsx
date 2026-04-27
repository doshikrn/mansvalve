import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/lib/company";

const TITLE = "Пользовательское соглашение";

export const metadata: Metadata = {
  title: TITLE,
  description: `Условия использования сайта ${COMPANY.name}: общие положения, интеллектуальная собственность, ограничение ответственности.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{TITLE}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-600">
        <p>
          Используя сайт {COMPANY.name}, вы подтверждаете ознакомление с{" "}
          <Link href="/privacy" className="font-medium text-site-primary hover:underline">
            политикой конфиденциальности
          </Link>{" "}
          и правилами обработки персональных данных.
        </p>
        <p>
          Материалы сайта носят информационный характер. Коммерческие условия, комплектность и сроки
          поставки фиксируются в договоре и коммерческом предложении.
        </p>
        <p>
          По вопросам условий сотрудничества:{" "}
          <a href={`mailto:${COMPANY.email}`} className="font-medium text-site-primary hover:underline">
            {COMPANY.email}
          </a>
          ,{" "}
          <a href={`tel:${COMPANY.phoneE164}`} className="font-medium text-site-primary hover:underline">
            {COMPANY.phoneDisplay}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
