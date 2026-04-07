import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientDetailView } from "@/components/clients/client-detail-view";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      proposals: {
        include: {
          versions: { orderBy: { versionNumber: "desc" } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!client) notFound();

  return <ClientDetailView client={JSON.parse(JSON.stringify(client))} />;
}
