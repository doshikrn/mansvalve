import { resolveHomeDeliveryCase } from "@/lib/site-content/public";
import { DeliveryCaseClient } from "@/components/sections/DeliveryCaseClient";

export async function DeliveryCase() {
  const content = await resolveHomeDeliveryCase();
  return <DeliveryCaseClient {...content} />;
}
