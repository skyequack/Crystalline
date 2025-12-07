import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

const quotationSchema = z.object({
  customerId: z.string(),
  projectName: z.string().min(1, "Project name is required"),
  siteLocation: z.string().optional(),
  status: z
    .enum(["DRAFT", "SENT", "REVISED", "APPROVED", "REJECTED"])
    .optional(),
  vatPercentage: z.coerce.number().min(0).max(20).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z
    .array(
      z.object({
        scopeOfWork: z.string().min(1, "Scope of work is required"),
        description: z.string().optional(),
        quantity: z.coerce.number().min(0),
        rate: z.coerce.number().min(0),
        vatRate: z.coerce.number().min(0),
        subTotal: z.coerce.number().min(0),
        sortOrder: z.number().optional(),
      })
    )
    .min(1, "Add at least one line item"),
});

// GET /api/quotations - List all quotations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const quotations = await prisma.quotation.findMany({
      where,
      include: {
        customer: true,
        createdBy: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quotations);
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotations" },
      { status: 500 }
    );
  }
}

// POST /api/quotations - Create new quotation
export async function POST(req: NextRequest) {
  // Get current user from Clerk
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure user exists in database
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        name:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.username ||
          "User",
        email: user.emailAddresses[0]?.emailAddress || "",
      },
    });
  }

  try {
    const body = await req.json();
    const validatedData = quotationSchema.parse(body);

    // Get the last quotation number
    const lastQuotation = await prisma.quotation.findFirst({
      orderBy: { createdAt: "desc" },
    });

    // Generate new quotation number
    const settings = await prisma.settings.findUnique({
      where: { key: "quotation_prefix" },
    });
    const prefix = settings?.value || "CRY";

    let nextNumber = 1;
    if (lastQuotation) {
      const lastNumber = parseInt(
        lastQuotation.quotationNumber.replace(/\D/g, "")
      );
      nextNumber = lastNumber + 1;
    }
    const quotationNumber = `${prefix}-${new Date().getFullYear()}-${String(
      nextNumber
    ).padStart(4, "0")}`;

    // Get default VAT percentage if not provided
    let vatPercentage = validatedData.vatPercentage || 5;
    if (!validatedData.vatPercentage) {
      const vatSetting = await prisma.settings.findUnique({
        where: { key: "vat_percentage" },
      });
      vatPercentage = parseFloat(vatSetting?.value || "5");
    }

    // Get default terms if not provided
    let terms = validatedData.terms;
    if (!terms) {
      const termsSetting = await prisma.settings.findUnique({
        where: { key: "quotation_terms" },
      });
      terms = termsSetting?.value || "";
    }

    // Calculate totals
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.subTotal,
      0
    );
    const vatAmount = subtotal * (vatPercentage / 100);
    const total = subtotal + vatAmount;

    // Create quotation with items
    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: validatedData.customerId,
        projectName: validatedData.projectName,
        siteLocation: validatedData.siteLocation || null,
        status: validatedData.status || "DRAFT",
        subtotal,
        vatPercentage,
        vatAmount,
        total,
        notes: validatedData.notes || null,
        terms,
        createdById: dbUser.id,
        items: {
          create: validatedData.items.map((item, index) => ({
            ...item,
            description: item.description || null,
            sortOrder: item.sortOrder ?? index,
          })),
        },
      },
      include: {
        customer: true,
        createdBy: true,
        items: true,
      },
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating quotation:", error);
    return NextResponse.json(
      { error: "Failed to create quotation" },
      { status: 500 }
    );
  }
}
