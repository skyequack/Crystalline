import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const log = {
  info: (msg: string, data?: unknown) =>
    console.log(
      `[CUSTOMERS API - INFO] ${new Date().toISOString()} - ${msg}`,
      data || ""
    ),
  error: (msg: string, error?: unknown) =>
    console.error(
      `[CUSTOMERS API - ERROR] ${new Date().toISOString()} - ${msg}`,
      error || ""
    ),
  warn: (msg: string, data?: unknown) =>
    console.warn(
      `[CUSTOMERS API - WARN] ${new Date().toISOString()} - ${msg}`,
      data || ""
    ),
};

// DELETE /api/customers/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  log.info("DELETE /api/customers/[id] - Request received", { customerId: params.id });
  try {
    log.info("Attempting to delete customer from database", { customerId: params.id });
    
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!customer) {
      log.warn("Customer not found for deletion", { customerId: params.id });
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });

    log.info("Customer deleted successfully", { customerId: params.id, companyName: customer.companyName });
    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    log.error("Failed to delete customer", {
      customerId: params.id,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      fullError: error,
    });
    return NextResponse.json(
      {
        error: "Failed to delete customer",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
