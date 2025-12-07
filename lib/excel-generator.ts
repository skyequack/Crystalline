import type { Prisma } from "@prisma/client";

type QuotationWithRelations = Prisma.QuotationGetPayload<{
  include: { customer: true; items: true };
}>;

export async function generateQuotationExcel(
  quotation: QuotationWithRelations
): Promise<Buffer> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Quotation");

  // Set page setup
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: "portrait",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  // Set column widths
  worksheet.columns = [
    { key: "col1", width: 8 }, // S.No
    { key: "col2", width: 50 }, // Scope of Work
    { key: "col3", width: 12 }, // Quantity
    { key: "col4", width: 15 }, // Rate
    { key: "col5", width: 15 }, // VAT Rate
    { key: "col6", width: 18 }, // Sub-Total
  ];

  let currentRow = 1;

  // Company Header
  worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const companyCell = worksheet.getCell(`A${currentRow}`);
  companyCell.value =
    process.env.NEXT_PUBLIC_COMPANY_NAME || "Crystal Line Glass & Aluminum";
  companyCell.font = { size: 20, bold: true, color: { argb: "002060" } };
  companyCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(currentRow).height = 30;
  currentRow++;

  // Company Details
  worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const companyDetailsCell = worksheet.getCell(`A${currentRow}`);
  companyDetailsCell.value = `${
    process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Dubai, UAE"
  } | Phone: ${
    process.env.NEXT_PUBLIC_COMPANY_PHONE || "+971-XX-XXXXXXX"
  } | Email: ${process.env.NEXT_PUBLIC_COMPANY_EMAIL || "info@crystalline.ae"}`;
  companyDetailsCell.font = { size: 10, color: { argb: "404040" } };
  companyDetailsCell.alignment = { horizontal: "center", vertical: "middle" };
  currentRow++;

  currentRow++; // Empty row

  // Quotation Title
  worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const titleCell = worksheet.getCell(`A${currentRow}`);
  titleCell.value = "QUOTATION";
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "E7E6E6" },
  };
  worksheet.getRow(currentRow).height = 25;
  currentRow++;

  currentRow++; // Empty row

  // Quotation Details - Left Side
  const detailsStartRow = currentRow;

  worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = "Quotation No:";
  worksheet.getCell(`A${currentRow}`).font = { bold: true };
  worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
  worksheet.getCell(`C${currentRow}`).value = quotation.quotationNumber;
  currentRow++;

  worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = "Date:";
  worksheet.getCell(`A${currentRow}`).font = { bold: true };
  worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
  worksheet.getCell(`C${currentRow}`).value = new Date(
    quotation.createdAt
  ).toLocaleDateString("en-GB");
  currentRow++;

  worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = "Project:";
  worksheet.getCell(`A${currentRow}`).font = { bold: true };
  worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
  worksheet.getCell(`C${currentRow}`).value = quotation.projectName;
  currentRow++;

  if (quotation.siteLocation) {
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = "Site Location:";
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
    worksheet.getCell(`C${currentRow}`).value = quotation.siteLocation;
    currentRow++;
  }

  // Customer Details - Right Side
  let customerRow = detailsStartRow;
  worksheet.getCell(`E${customerRow}`).value = "Customer:";
  worksheet.getCell(`E${customerRow}`).font = { bold: true };
  worksheet.getCell(`F${customerRow}`).value = quotation.customer.companyName;
  customerRow++;

  if (quotation.customer.contactPerson) {
    worksheet.getCell(`E${customerRow}`).value = "Attn:";
    worksheet.getCell(`E${customerRow}`).font = { bold: true };
    worksheet.getCell(`F${customerRow}`).value =
      quotation.customer.contactPerson;
    customerRow++;
  }

  if (quotation.customer.phone) {
    worksheet.getCell(`E${customerRow}`).value = "Phone:";
    worksheet.getCell(`E${customerRow}`).font = { bold: true };
    worksheet.getCell(`F${customerRow}`).value = quotation.customer.phone;
    customerRow++;
  }

  if (quotation.customer.email) {
    worksheet.getCell(`E${customerRow}`).value = "Email:";
    worksheet.getCell(`E${customerRow}`).font = { bold: true };
    worksheet.getCell(`F${customerRow}`).value = quotation.customer.email;
    customerRow++;
  }

  currentRow = Math.max(currentRow, customerRow);
  currentRow += 2; // Empty rows

  // Table Header
  const headerRow = worksheet.getRow(currentRow);
  headerRow.values = [
    "S.No",
    "Scope of Work",
    "Quantity",
    "Rate",
    "VAT Rate",
    "Sub-Total",
  ];
  headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
  headerRow.height = 20;

  // Apply styling to header cells (only columns A-F)
  for (let col = 1; col <= 6; col++) {
    const cell = headerRow.getCell(col);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4472C4" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  }

  currentRow++;

  // Table Data
  quotation.items.forEach((item, index) => {
    const dataRow = worksheet.getRow(currentRow);

    dataRow.getCell(1).value = index + 1;
    dataRow.getCell(1).alignment = { horizontal: "center", vertical: "top" };

    // Scope of Work (with description if available)
    let scopeText = item.scopeOfWork;
    if (item.description) {
      scopeText += "\n\n" + item.description;
    }
    dataRow.getCell(2).value = scopeText;
    dataRow.getCell(2).alignment = {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
    };

    dataRow.getCell(3).value = parseFloat(item.quantity.toString());
    dataRow.getCell(3).alignment = { horizontal: "center", vertical: "top" };

    dataRow.getCell(4).value = parseFloat(item.rate.toString());
    dataRow.getCell(4).numFmt = '#,##0.00 "AED"';
    dataRow.getCell(4).alignment = { horizontal: "right", vertical: "top" };

    dataRow.getCell(5).value = parseFloat(item.vatRate.toString());
    dataRow.getCell(5).numFmt = '#,##0.00 "AED"';
    dataRow.getCell(5).alignment = { horizontal: "right", vertical: "top" };

    dataRow.getCell(6).value = parseFloat(item.subTotal.toString());
    dataRow.getCell(6).numFmt = '#,##0.00 "AED"';
    dataRow.getCell(6).alignment = { horizontal: "right", vertical: "top" };

    // Apply borders
    for (let col = 1; col <= 6; col++) {
      const cell = dataRow.getCell(col);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    // Set row height based on content
    dataRow.height = Math.max(30, Math.ceil(scopeText.length / 80) * 15);

    currentRow++;
  });

  currentRow++; // Empty row

  // Totals Section
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = "Subtotal:";
  worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
  worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "right" };
  worksheet.getCell(`F${currentRow}`).value = parseFloat(
    quotation.subtotal.toString()
  );
  worksheet.getCell(`F${currentRow}`).numFmt = '#,##0.00 "AED"';
  worksheet.getCell(`F${currentRow}`).font = { bold: true, size: 12 };
  worksheet.getCell(`F${currentRow}`).alignment = { horizontal: "right" };
  worksheet.getCell(`F${currentRow}`).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "F2F2F2" },
  };
  currentRow++;

  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  worksheet.getCell(
    `A${currentRow}`
  ).value = `VAT (${quotation.vatPercentage}%):`;
  worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
  worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "right" };
  worksheet.getCell(`F${currentRow}`).value = parseFloat(
    quotation.vatAmount.toString()
  );
  worksheet.getCell(`F${currentRow}`).numFmt = '#,##0.00 "AED"';
  worksheet.getCell(`F${currentRow}`).font = { bold: true, size: 12 };
  worksheet.getCell(`F${currentRow}`).alignment = { horizontal: "right" };
  worksheet.getCell(`F${currentRow}`).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "F2F2F2" },
  };
  currentRow++;

  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = "GRAND TOTAL:";
  worksheet.getCell(`A${currentRow}`).font = {
    bold: true,
    size: 14,
    color: { argb: "FFFFFF" },
  };
  worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "right" };
  worksheet.getCell(`A${currentRow}`).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "4472C4" },
  };
  worksheet.getCell(`F${currentRow}`).value = parseFloat(
    quotation.total.toString()
  );
  worksheet.getCell(`F${currentRow}`).numFmt = '#,##0.00 "AED"';
  worksheet.getCell(`F${currentRow}`).font = {
    bold: true,
    size: 14,
    color: { argb: "FFFFFF" },
  };
  worksheet.getCell(`F${currentRow}`).alignment = { horizontal: "right" };
  worksheet.getCell(`F${currentRow}`).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "4472C4" },
  };
  currentRow++;

  currentRow += 2; // Empty rows

  // Terms & Conditions
  if (quotation.terms) {
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const termsHeaderCell = worksheet.getCell(`A${currentRow}`);
    termsHeaderCell.value = "TERMS & CONDITIONS:";
    termsHeaderCell.font = { bold: true, size: 12 };
    termsHeaderCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "E7E6E6" },
    };
    currentRow++;

    worksheet.mergeCells(`A${currentRow}:F${currentRow + 5}`);
    const termsCell = worksheet.getCell(`A${currentRow}`);
    termsCell.value = quotation.terms;
    termsCell.alignment = {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
    };
    termsCell.font = { size: 10 };
    currentRow += 6;
  }

  currentRow += 2; // Empty rows

  // Signature Section
  worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = "Prepared By:";
  worksheet.getCell(`A${currentRow}`).font = { bold: true };
  worksheet.mergeCells(`D${currentRow}:F${currentRow}`);
  worksheet.getCell(`D${currentRow}`).value = "Authorized Signature:";
  worksheet.getCell(`D${currentRow}`).font = { bold: true };
  currentRow++;

  worksheet.mergeCells(`A${currentRow}:C${currentRow + 2}`);
  const preparedCell = worksheet.getCell(`A${currentRow}`);
  preparedCell.value = "System User";
  preparedCell.alignment = { horizontal: "left", vertical: "bottom" };
  preparedCell.border = {
    bottom: { style: "thin" },
  };

  worksheet.mergeCells(`D${currentRow}:F${currentRow + 2}`);
  const signatureCell = worksheet.getCell(`D${currentRow}`);
  signatureCell.border = {
    bottom: { style: "thin" },
  };

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
