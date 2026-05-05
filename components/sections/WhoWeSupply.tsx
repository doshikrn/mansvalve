import { resolveHomeWhoWeSupply } from "@/lib/site-content/public";
import { WhoWeSupplyClient } from "@/components/sections/WhoWeSupplyClient";

export async function WhoWeSupply() {
  const data = await resolveHomeWhoWeSupply();
  return (
    <WhoWeSupplyClient
      {...data}
      sectionEyebrow="Наши клиенты"
      sectionTitle=""
      sectionLead="Работаем в сегментах B2B и B2G, обеспечивая поставки для предприятий, подрядчиков и государственных организаций по всему Казахстану."
    />
  );
}
