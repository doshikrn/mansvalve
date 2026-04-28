import { resolveHomeWhoWeSupply } from "@/lib/site-content/public";
import { WhoWeSupplyClient } from "@/components/sections/WhoWeSupplyClient";

export async function WhoWeSupply() {
  const data = await resolveHomeWhoWeSupply();
  return <WhoWeSupplyClient {...data} />;
}
