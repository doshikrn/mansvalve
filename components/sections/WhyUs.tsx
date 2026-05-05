import { resolveHomeWhyUs } from "@/lib/site-content/public";
import { WhyUsClient } from "@/components/sections/WhyUsClient";

export async function WhyUs() {
  const data = await resolveHomeWhyUs();
  return (
    <WhyUsClient
      {...data}
      sectionEyebrow="Наши преимущества"
      sectionTitle="Почему нам доверяют подрядчики, ТЭЦ, нефтегазовые компании и промышленные предприятия"
    />
  );
}
