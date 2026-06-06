import { resolveRequestCta } from "@/lib/site-content/public";
import { RequestCtaClient } from "@/components/sections/RequestCtaClient";

type RequestCTAProps = {
  layout?: "default" | "embedded";
};

export async function RequestCTA({ layout = "default" }: RequestCTAProps = {}) {
  const { title, subtitle, footerHint } = await resolveRequestCta();
  return <RequestCtaClient title={title} subtitle={subtitle} footerHint={footerHint} layout={layout} />;
}
