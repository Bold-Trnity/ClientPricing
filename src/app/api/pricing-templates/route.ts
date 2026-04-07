import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const templateSchema = z.object({
  name: z.string().min(1),
  country: z.string(),
  paymentMethod: z.string(),
  currency: z.string(),
  data: z.string(), // JSON
  isActive: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.pricingTemplate.findMany({
    where: { isActive: true },
    orderBy: [{ country: "asc" }, { paymentMethod: "asc" }],
  });

  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = templateSchema.parse(body);

    const template = await prisma.pricingTemplate.create({ data });
    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
