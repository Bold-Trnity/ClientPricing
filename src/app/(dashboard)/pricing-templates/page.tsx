import { prisma } from "@/lib/prisma";
import { PricingTemplatesView } from "@/components/pricing-templates/pricing-templates-view";

export default async function PricingTemplatesPage() {
  const templates = await prisma.pricingTemplate.findMany({
    orderBy: [{ country: "asc" }, { paymentMethod: "asc" }],
  });

  return <PricingTemplatesView templates={JSON.parse(JSON.stringify(templates))} />;
}
