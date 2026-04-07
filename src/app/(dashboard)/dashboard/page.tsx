import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const session = await auth();

  const [clients, proposals, recentVersions] = await Promise.all([
    prisma.client.count(),
    prisma.proposal.count(),
    prisma.proposalVersion.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        proposal: {
          include: { client: true },
        },
      },
    }),
  ]);

  const statusCounts = await prisma.proposalVersion.groupBy({
    by: ["status"],
    _count: true,
  });

  return (
    <DashboardContent
      stats={{ clients, proposals }}
      statusCounts={statusCounts}
      recentVersions={recentVersions}
      userName={session?.user?.name ?? "there"}
    />
  );
}
