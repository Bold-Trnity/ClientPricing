import { prisma } from "@/lib/prisma";
import { ClientsListView } from "@/components/clients/clients-list-view";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      proposals: {
        include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
        orderBy: { updatedAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return <ClientsListView clients={JSON.parse(JSON.stringify(clients))} />;
}
