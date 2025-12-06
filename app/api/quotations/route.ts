import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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

    const quotations = await db.quotation.findMany({
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
  try {
    const body = await req.json();
    const validatedData = quotationSchema.parse(body);

    // Get the last quotation number
    const lastQuotation = await db.quotation.findFirst({
      orderBy: { createdAt: "desc" },
      select: { quotationNumber: true },
    });

    // Generate new quotation number
    const settings = await db.settings.findUnique("quotation_prefix");
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
      const vatSetting = await db.settings.findUnique("vat_percentage");
      vatPercentage = parseFloat(vatSetting?.value || "5");
    }

    // Get default terms if not provided
    let terms = validatedData.terms;
    if (!terms) {
      const termsSetting = await db.settings.findUnique("quotation_terms");
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
    const quotation = await db.quotation.create({
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
        createdById: "1",
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
