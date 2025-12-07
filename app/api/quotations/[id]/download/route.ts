import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQuotationExcel } from "@/lib/excel-generator";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
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

    // Generate Excel file
    type QuotationWithRelations = NonNullable<typeof quotation>;

    const buffer = await generateQuotationExcel(
      quotation as QuotationWithRelations
    );

    // Set response headers for file download
    const filename = `Quotation_${
      quotation.quotationNumber
    }_${quotation.projectName.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`;

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json(
      { error: "Failed to generate Excel file" },
      { status: 500 }
    );
  }
}
