import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const versionSchema = z.object({
  pricingData: z.string(),
  label: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const data = versionSchema.parse(body);

    // Get latest version number
    const latest = await prisma.proposalVersion.findFirst({
      where: { proposalId: id },
      orderBy: { versionNumber: "desc" },
    });

    const nextVersion = (latest?.versionNumber ?? 0) + 1;

    const version = await prisma.proposalVersion.create({
      data: {
        proposalId: id,
        versionNumber: nextVersion,
        label: data.label ?? `v${nextVersion}`,
        status: "DRAFT",
        pricingData: data.pricingData,
        notes: data.notes,
      },
    });

    // Log activity
    await prisma.proposalActivity.create({
      data: {
        versionId: version.id,
        userId: session.user!.id!,
        action: "VERSION_CREATED",
        metadata: JSON.stringify({ versionNumber: nextVersion }),
      },
    });

    // Update proposal updatedAt
    await prisma.proposal.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(version, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
