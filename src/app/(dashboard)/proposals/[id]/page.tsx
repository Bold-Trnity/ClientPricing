import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProposalDetailView } from "@/components/proposals/proposal-detail-view";

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      client: true,
      versions: {
        orderBy: { versionNumber: "desc" },
        include: {
          activities: {
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { user: { select: { id: true, name: true } } },
          },
        },
      },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!proposal) notFound();

  return <ProposalDetailView proposal={JSON.parse(JSON.stringify(proposal))} />;
}
