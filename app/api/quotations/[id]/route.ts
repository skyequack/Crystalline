import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const updateSchema = z.object({
  customerId: z.string().optional(),
  projectName: z.string().min(1).optional(),
  siteLocation: z.string().optional(),
  status: z
    .enum(["DRAFT", "SENT", "REVISED", "APPROVED", "REJECTED"])
    .optional(),
  vatPercentage: z.number().min(0).max(20).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        scopeOfWork: z.string().min(1),
        description: z.string().optional(),
        quantity: z.number().min(0),
        rate: z.number().min(0),
        vatRate: z.number().min(0),
        subTotal: z.number().min(0),
        sortOrder: z.number().optional(),
      })
    )
    .optional(),
});

// GET /api/quotations/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        createdBy: true,
        items: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(quotation);
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotation" },
      { status: 500 }
    );
  }
}

// PATCH /api/quotations/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validatedData = updateSchema.parse(body);

    // Check if quotation exists
    const existingQuotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!existingQuotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    // Calculate new totals if items are updated
    let updateData: Prisma.QuotationUncheckedUpdateInput = {
      customerId: validatedData.customerId,
      projectName: validatedData.projectName,
      siteLocation: validatedData.siteLocation,
      status: validatedData.status,
      vatPercentage: validatedData.vatPercentage,
      notes: validatedData.notes,
      terms: validatedData.terms,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    if (validatedData.items) {
      const subtotal = validatedData.items.reduce(
        (sum, item) => sum + item.subTotal,
        0
      );
      const vatPercentage =
        validatedData.vatPercentage ?? existingQuotation.vatPercentage;
      const vatAmount = subtotal * (Number(vatPercentage) / 100);
      const total = subtotal + vatAmount;

      updateData.subtotal = subtotal;
      updateData.vatAmount = vatAmount;
      updateData.total = total;

      // Delete existing items and create new ones
      await prisma.quotationItem.deleteMany({
        where: { quotationId: params.id },
      });
    }

    // Update quotation
    const quotation = await prisma.quotation.update({
      where: { id: params.id },
      data: {
        ...updateData,
        ...(validatedData.items && {
          items: {
            create: validatedData.items.map((item, index) => ({
              scopeOfWork: item.scopeOfWork,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              vatRate: item.vatRate,
              subTotal: item.subTotal,
              sortOrder: item.sortOrder ?? index,
            })),
          },
        }),
      },
      include: {
        customer: true,
        createdBy: true,
        items: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(quotation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating quotation:", error);
    return NextResponse.json(
      { error: "Failed to update quotation" },
      { status: 500 }
    );
  }
}

// DELETE /api/quotations/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.quotation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Quotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    return NextResponse.json(
      { error: "Failed to delete quotation" },
      { status: 500 }
    );
  }
}
