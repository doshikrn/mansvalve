import { CalendarRange, CheckCircle2, MapPin, Package } from "lucide-react";

type CaseItem = {
  title: string;
  text: string;
  positions: string;
  term: string;
  termLabel: string;
  object: string;
  result: string;
};

const CASES: CaseItem[] = [
  {
    title: "Комплектация жилого комплекса без срыва сроков",
    text: "Для генподрядной организации поставили задвижки, фланцы, затворы и крепёж для внутренних инженерных сетей объекта. Часть позиций заменили на складские аналоги для ускорения поставки.",
    positions: "64 ед.",
    term: "2 дня",
    termLabel: "Срок поставки",
    object: "Жилой комплекс",
    result: "Монтажные работы продолжены по графику без задержек.",
  },
  {
    title: "Срочная поставка для теплосетей",
    text: "Оперативно закрыли заявку на стальные задвижки и комплектующие для аварийно-восстановительных работ.",
    positions: "29 ед.",
    term: "1 день",
    termLabel: "Срок отгрузки",
    object: "Городская теплосеть",
    result: "Участок введён в работу в кратчайшие сроки без простоя бригады.",
  },
  {
    title: "Поставка для производственного предприятия",
    text: "Подобрали и поставили промышленную запорную арматуру для модернизации трубопроводного узла предприятия.",
    positions: "48 ед.",
    term: "4 дня",
    termLabel: "Срок поставки",
    object: "Производственный завод",
    result: "Работы выполнены в плановое окно остановки оборудования.",
  },
  {
    title: "Комплектация объекта водоснабжения",
    text: "Для подрядчика укомплектовали объект дисковыми затворами, обратными клапанами и фланцами согласно спецификации.",
    positions: "37 ед.",
    term: "3 дня",
    termLabel: "Срок поставки",
    object: "Узел водоснабжения",
    result: "Объект выведен в монтаж без дополнительных закупок и задержек.",
  },
  {
    title: "Поставка для нефтегазового подрядчика",
    text: "Закрыли заявку на трубопроводную арматуру и крепёж для технологического участка объекта.",
    positions: "22 ед.",
    term: "5 дней",
    termLabel: "Срок поставки",
    object: "Производственная площадка",
    result: "График работ сохранён, этап выполнен в установленный срок.",
  },
];

function MetaPill({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2 border-t border-site-border pt-3 sm:items-center sm:gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-site-primary sm:mt-0" aria-hidden strokeWidth={1.8} />
      <div className="min-w-0 text-xs sm:text-sm">
        <p className="text-[10px] font-medium uppercase tracking-wide text-site-muted">{label}</p>
        <p className="font-semibold text-site-ink">{value}</p>
      </div>
    </div>
  );
}

export function DeliveryCase() {
  return (
    <section className="site-section" aria-labelledby="cases-heading">
      <div className="site-container">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="site-eyebrow">
              Реализованные поставки
            </div>
            <h2
              id="cases-heading"
              className="site-heading"
            >
              Кейсы MANSVALVE GROUP
            </h2>
            <p className="site-copy mt-3">
              Показываем типовые поставки: что требовалось, какой комплект закрыли и какой результат получил заказчик.
            </p>
          </div>
          <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-site-border bg-site-card text-center shadow-sm lg:min-w-[360px]">
            <div className="border-r border-site-border px-3 py-3">
              <p className="text-lg font-bold text-site-ink">5</p>
              <p className="text-[10px] font-semibold uppercase text-site-muted">кейсов</p>
            </div>
            <div className="border-r border-site-border px-3 py-3">
              <p className="text-lg font-bold text-site-ink">1-5</p>
              <p className="text-[10px] font-semibold uppercase text-site-muted">дней</p>
            </div>
            <div className="px-3 py-3">
              <p className="text-lg font-bold text-site-ink">200</p>
              <p className="text-[10px] font-semibold uppercase text-site-muted">единиц</p>
            </div>
          </div>
        </div>

        <ul className="grid list-none gap-4 p-0 lg:grid-cols-2">
          {CASES.map((c, index) => (
            <li
              key={c.title}
              className="site-card overflow-hidden p-0"
            >
              <div className="grid h-full grid-rows-[auto_1fr_auto]">
                <div className="flex items-start gap-4 border-b border-site-border bg-site-bg px-5 py-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-site-primary text-sm font-bold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase text-site-muted">{c.object}</p>
                    <h3 className="mt-1 text-base font-bold leading-snug text-site-ink sm:text-lg">{c.title}</h3>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <p className="text-sm leading-relaxed text-site-muted sm:text-[15px]">
                    {c.text}
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <MetaPill icon={Package} label="Комплект" value={c.positions} />
                    <MetaPill icon={CalendarRange} label={c.termLabel} value={c.term} />
                    <MetaPill icon={MapPin} label="Объект" value={c.object} />
                  </div>
                </div>

                <div className="flex gap-3 border-t border-site-border bg-white px-5 py-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-site-primary" aria-hidden strokeWidth={1.8} />
                  <p className="text-sm font-medium leading-relaxed text-site-ink">
                    <span className="font-bold text-site-ink">Результат: </span>
                    {c.result}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
