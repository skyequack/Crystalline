import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateQuotationExcel } from "@/lib/excel-generator";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotation = await db.quotation.findUnique(params.id, {
      include: {
        customer: true,
        items: true,
      },
    });

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    // Generate Excel file
    const buffer = await generateQuotationExcel(quotation as any);

    // Set response headers for file download
    const filename = `Quotation_${
      quotation.quotationNumber
    }_${quotation.projectName.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`;

    return new NextResponse(buffer as any, {
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
