import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
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

  if (!version) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (version.shareExpiry && new Date(version.shareExpiry) < new Date()) {
    return NextResponse.json({ error: "This proposal link has expired" }, { status: 410 });
  }

  // Track view
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
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
      action: "VIEWED",
      ipAddress: ip,
      metadata: JSON.stringify({ userAgent: req.headers.get("user-agent") }),
    },
  });

  return NextResponse.json({
    version: {
      id: version.id,
      versionNumber: version.versionNumber,
      label: version.label,
      status: version.status,
      pricingData: version.pricingData,
      createdAt: version.createdAt,
    },
    proposal: {
      title: version.proposal.title,
      client: version.proposal.client,
      createdBy: version.proposal.createdBy,
    },
  });
}
