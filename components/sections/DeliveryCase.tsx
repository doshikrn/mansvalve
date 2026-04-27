import { CalendarRange, MapPin, Package } from "lucide-react";

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
    <div className="flex min-w-0 items-start gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2 sm:items-center sm:gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 sm:mt-0" aria-hidden />
      <div className="min-w-0 text-xs sm:text-sm">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export function DeliveryCase() {
  return (
    <section className="bg-white py-20 sm:py-24" aria-labelledby="cases-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 max-w-3xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Реализованные поставки
          </div>
          <h2
            id="cases-heading"
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Кейсы MANSVALVE GROUP
          </h2>
        </div>

        <ul className="flex list-none flex-col gap-5 p-0 sm:gap-6">
          {CASES.map((c) => (
            <li
              key={c.title}
              className="rounded-2xl border border-slate-200 bg-slate-50/40 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300/90 hover:shadow-md sm:p-6"
            >
              <h3 className="text-lg font-bold text-slate-900 sm:text-xl">{c.title}</h3>
              <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {c.text}
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
                <MetaPill icon={Package} label="Позиции" value={c.positions} />
                <MetaPill icon={CalendarRange} label={c.termLabel} value={c.term} />
                <MetaPill icon={MapPin} label="Объект" value={c.object} />
              </div>

              <p className="mt-4 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-900 sm:text-[15px]">
                <span className="font-bold text-emerald-800">Результат: </span>
                {c.result}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
