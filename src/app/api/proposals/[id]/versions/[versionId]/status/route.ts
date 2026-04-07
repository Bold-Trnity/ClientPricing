import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateShareToken } from "@/lib/utils";

const schema = z.object({
  status: z.enum(["DRAFT", "SENT", "VIEWED", "UNDER_REVIEW", "AGREED", "REJECTED", "EXPIRED"]),
  rejectedNote: z.string().optional(),
  generateShareLink: z.boolean().optional(),
  shareExpiryDays: z.number().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { versionId } = await params;
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const updateData: Record<string, unknown> = { status: data.status };

    if (data.status === "SENT") {
      updateData.sentAt = new Date();
      if (data.generateShareLink) {
        updateData.shareToken = generateShareToken();
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + (data.shareExpiryDays ?? 30));
        updateData.shareExpiry = expiry;
      }
    }
    if (data.status === "AGREED") updateData.agreedAt = new Date();
    if (data.status === "REJECTED") {
      updateData.rejectedAt = new Date();
      updateData.rejectedNote = data.rejectedNote;
    }

    const version = await prisma.proposalVersion.update({
      where: { id: versionId },
      data: updateData,
    });

    await prisma.proposalActivity.create({
      data: {
        versionId,
        userId: session.user!.id!,
        action: `STATUS_CHANGED_${data.status}`,
        metadata: JSON.stringify({ status: data.status }),
      },
    });

    return NextResponse.json(version);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
