import { prisma } from "@/lib/prisma";
import { ProposalsListView } from "@/components/proposals/proposals-list-view";

export default async function ProposalsPage() {
  const proposals = await prisma.proposal.findMany({
    include: {
      client: true,
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return <ProposalsListView proposals={JSON.parse(JSON.stringify(proposals))} />;
}
