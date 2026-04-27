import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CopyToClipboard } from "@/components/contacts/CopyToClipboard";
import { COMPANY } from "@/lib/company";

const PRIVACY_TITLE = "Политика конфиденциальности — обработка персональных данных";

export const metadata: Metadata = {
  title: PRIVACY_TITLE,
  description:
    `Политика обработки персональных данных ${COMPANY.legalName} (${COMPANY.name}): заявки, cookie, аналитика, Telegram, хранение лидов, контакты по вопросам данных. Казахстан.`,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: `${PRIVACY_TITLE} | ${COMPANY.name}`,
    description:
      `Как обрабатываются данные на сайте: формы, UTM, хранение заявок, Telegram. ${COMPANY.legalName}.`,
    url: "/privacy",
    siteName: COMPANY.name,
    locale: "ru_KZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${PRIVACY_TITLE} | ${COMPANY.name}`,
    description:
      `Обработка персональных данных посетителей и B2B-заявок. ${COMPANY.legalName}, Казахстан.`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-12">
          <nav aria-label="Хлебные крошки" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm">
              <li>
                <Link href="/" className="text-slate-500 transition-colors hover:text-slate-900">
                  Главная
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                <span className="font-medium text-slate-900" aria-current="page">
                  Политика конфиденциальности
                </span>
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Политика конфиденциальности
          </h1>
          <p className="mt-2 text-slate-500">
            {COMPANY.legalName} ({COMPANY.name})
          </p>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="prose prose-slate max-w-none text-slate-600">
          <p>
            Настоящий документ описывает, какие данные мы обрабатываем при
            посещении сайта и оставлении заявок в контексте B2B‑сотрудничества.
            Цель — информировать, без лишних юридических усложнений. По вопросам
            обработки данных обращайтесь по реквизитам в конце страницы.
          </p>

          <h2 className="!mt-10 text-xl font-semibold text-slate-900">Кто обрабатывает данные</h2>
          <p>
            Оператор: <strong className="font-semibold text-slate-800">{COMPANY.legalName}</strong>
            , торговая марка {COMPANY.name}. Адрес: {COMPANY.address.full}.
          </p>

          <h2 className="!mt-10 text-xl font-semibold text-slate-900">
            Данные из форм заявок
          </h2>
          <p>Через формы на сайте вы можете передать:</p>
          <ul>
            <li>имя или наименование организации (обязательно);</li>
            <li>номер телефона (обязательно);</li>
            <li>текст комментария к заявке (по желанию);</li>
            <li>контекст по каталогу: название товара, категория, подкатегория, если форма
              открыта со страницы товара или раздела каталога.</li>
          </ul>
          <p>
            Кроме того, в заявку автоматически добавляется служебная информация: с какой
            страницы и с какой меткой источника отправлен запрос, идентификаторы рекламы
            (см. ниже), а также (на сервере) технические данные для защиты от злоупотреблений.
          </p>

          <h2 className="!mt-10 text-xl font-semibold text-slate-900">
            Атрибуция, UTM и click ID
          </h2>
          <p>Мы фиксируем сведения о переходе для оценки эффективности маркетинга:</p>
          <ul>
            <li>маркетинговые UTM‑метки из адреса страницы (utm_source, utm_medium,
              utm_campaign, utm_term, utm_content), если они присутствуют в URL;</li>
            <li>идентификаторы кликов рекламных систем (например, gclid, yclid, fbclid),
              если присутствуют в URL;</li>
            <li>реферер (адрес предыдущей страницы), если его передаёт браузер.</li>
          </ul>
          <p>
            Первичное срабатывание (first touch): часть таких сведений сохраняется
            в браузере (см. раздел о хранилищах) на ограниченный срок и дублируется
            в заявке как «первый контакт», чтобы сопоставить визит и конверсию.
          </p>

          <h2 className="!mt-10 text-xl font-semibold text-slate-900">Аналитика и логи</h2>
          <p>На сайте подключён типовой веб‑аналитика (в т.ч. через теги Google/менеджер
            тегов, если настроен). События: просмотры страниц, взаимодействие с
            карточками товаров и формами, скролл, отдельные события воронки. Для
            сессий используется идентификатор в <strong>sessionStorage</strong> (ключ
            вида аналитической сессии) — хранится только в течение сессии браузера.
          </p>
          <p>
            Сервисы третьих сторон (например, Google) могут использовать cookie и
            схожие механизмы по своим правилам. Вы можете ограничить cookie в настройках
            браузера; часть функций сайта при этом может работать иначе.
          </p>

          <h2 className="!mt-10 text-xl font-semibold text-slate-900">
            localStorage, sessionStorage
          </h2>
          <p>
            В <strong>localStorage</strong> храним данные о первом зафиксированном
            маркетинговом визите (UTM, click ID, реферер) и сроке их жизни — обычно
            до 90 дней, чтобы не раздувать сроки отслеживания. В <strong>sessionStorage</strong> —
            идентификатор аналитической сессии для событий на одном визите. Это не
            HTTP‑cookie, а локальное хранилище в браузере; по смыслу близко к хранению
            идентификаторов на устройстве. Данные можно очистить
            в настройках браузера.
          </p>

          <h2 className="!mt-10 text-xl font-semibold text-slate-900">
            IP‑адрес и User‑Agent
          </h2>
          <p>
            При отправке заявки сервер может зафиксировать IP‑адрес и сокращённый
            User‑Agent (тип клиента) для защиты от злоупотреблений (ограничение
            частоты запросов) и в составе лида во внутренней админке. IP не используем
            для несвязанной с обслуживанием заявки рекламы.
          </p>

          <h2 className="!mt-10 text-xl font-semibold text-slate-900">Доставка в Telegram</h2>
          <p>
            Содержимое заявки, включая контакты, контекст каталога и атрибуцию,
            направляется в мессенджер <strong>Telegram</strong> (сервис Telegram
            FZ‑LLC и связанных лиц) в настроенный чат/канал сотрудников компании. Обработка
            выполняется для оперативной обработки лида. Мы ожидаем, что доступ к чату
            имеют уполномоченные сотрудники. У Telegram действуют отдельные условия и
            политика конфиденциальности сервиса.
          </p>

          <h2 className="!mt-10 text-xl font-semibold text-slate-900">Хранение в системе (лиды)</h2>
          <p>
            Копия заявки с теми же сведениями (в т.ч. отметки доставки в Telegram)
            сохраняется во внутренней базе данных и доступна сотрудникам с
            учётной записи через <strong>закрытую админ‑панель</strong> — для
            ведения переговоров, статусов сделок и обратной связи с вами. Срок
            хранения обоснован деловой необходимостью; при отсутствии такой
            необходимости данные не используем.
          </p>

          <h2 className="!mt-10 text-xl font-semibold text-slate-900">Цель обработки</h2>
          <p>
            Обеспечение коммуникации с потенциальными и действующими контрагентами
            (обработка запросов, КП, договорная работа), улучшение работы сайта
            и маркетинга, а также защита от автоматизированного спама.
          </p>

          <h2 className="!mt-10 text-xl font-semibold text-slate-900">
            Как с нами связаться по данным
          </h2>
          <p>Если нужно уточнить, что хранится по заявке, задать вопрос о данных или
            связаться в рамках B2B:</p>
          <ul>
            <li>
              электронная почта:{" "}
              <CopyToClipboard
                variant="minimal"
                value={COMPANY.email}
                kind="email"
                className="text-blue-800"
              >
                {COMPANY.email}
              </CopyToClipboard>
              .
            </li>
            <li>
              телефон:{" "}
              <CopyToClipboard
                variant="minimal"
                value={COMPANY.phoneE164}
                kind="phone"
                className="text-blue-800"
              >
                {COMPANY.phoneDisplay}
              </CopyToClipboard>
              .
            </li>
          </ul>
          <p>Юр. и почтовый адрес: {COMPANY.address.full}.</p>
        </div>
      </article>
    </div>
  );
}
