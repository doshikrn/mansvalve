import { resolveHomeFaq } from "@/lib/site-content/public";
import { FAQAccordion } from "@/components/sections/FAQAccordion";

export async function FAQ() {
  const data = await resolveHomeFaq();
  return <FAQAccordion {...data} />;
}
