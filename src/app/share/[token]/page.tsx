import { notFound } from "next/navigation";
import { ProposalPDFContent } from "@/components/proposals/proposal-pdf";
import { prisma } from "@/lib/prisma";

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const version = await prisma.proposalVersion.findUnique({
    where: { shareToken: token },
    include: {
      proposal: {
        include: {
          client: true,
          createdBy: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!version) notFound();

  if (version.shareExpiry && new Date(version.shareExpiry) < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Link Expired</h1>
          <p className="text-gray-500 mt-2">This proposal link has expired. Please contact us for an updated proposal.</p>
        </div>
      </div>
    );
  }

  // Track view (server-side)
  await prisma.proposalVersion.update({
    where: { id: version.id },
    data: {
      viewCount: { increment: 1 },
      viewedAt: version.viewedAt ?? new Date(),
      status: version.status === "SENT" ? "VIEWED" : version.status,
    },
  });

  await prisma.proposalActivity.create({
    data: {
      versionId: version.id,
      action: "VIEWED_VIA_SHARE_LINK",
      metadata: JSON.stringify({ token }),
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Banner */}
        <div className="mb-4 flex items-center justify-between px-2">
          <p className="text-sm text-gray-500">
            Proposal shared by <strong>{version.proposal.createdBy.name || version.proposal.createdBy.email}</strong>
          </p>
          <a
            href={`/share/${token}?download=1`}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Download PDF
          </a>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <ProposalPDFContent
            proposal={{
              title: version.proposal.title,
              client: version.proposal.client,
              createdBy: version.proposal.createdBy,
            }}
            version={{
              versionNumber: version.versionNumber,
              label: version.label,
              createdAt: version.createdAt,
            }}
            pricingConfig={JSON.parse(version.pricingData)}
          />
        </div>
      </div>
    </div>
  );
}
