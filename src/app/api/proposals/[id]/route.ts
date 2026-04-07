import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
            take: 20,
            include: { user: { select: { id: true, name: true } } },
          },
        },
      },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(proposal);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.proposal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
