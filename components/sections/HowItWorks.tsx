import { resolveHomeHowItWorks } from "@/lib/site-content/public";
import { HowItWorksClient } from "@/components/sections/HowItWorksClient";

export async function HowItWorks() {
  const { sectionEyebrow, sectionTitle, steps } = await resolveHomeHowItWorks();
  return <HowItWorksClient sectionEyebrow={sectionEyebrow} sectionTitle={sectionTitle} steps={steps} />;
}
