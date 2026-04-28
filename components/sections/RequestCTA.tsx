import { resolveRequestCta } from "@/lib/site-content/public";
import { RequestCtaClient } from "@/components/sections/RequestCtaClient";

export async function RequestCTA() {
  const { title, subtitle, footerHint } = await resolveRequestCta();
  return <RequestCtaClient title={title} subtitle={subtitle} footerHint={footerHint} />;
}
