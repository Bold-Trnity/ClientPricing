import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const proposalSchema = z.object({
  title: z.string().min(1),
  clientId: z.string(),
  notes: z.string().optional(),
  pricingData: z.string(), // JSON
  versionLabel: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const proposals = await prisma.proposal.findMany({
    include: {
      client: true,
      versions: {
        orderBy: { versionNumber: "desc" },
      },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(proposals);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = proposalSchema.parse(body);

    const proposal = await prisma.proposal.create({
      data: {
        title: data.title,
        clientId: data.clientId,
        createdById: session.user!.id!,
        notes: data.notes,
        versions: {
          create: {
            versionNumber: 1,
            label: data.versionLabel ?? "v1",
            status: "DRAFT",
            pricingData: data.pricingData,
          },
        },
      },
      include: {
        client: true,
        versions: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
