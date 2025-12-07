import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const customerSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
});

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

export async function GET() {
  log.info("GET /api/customers - Request received");
  try {
    log.info("Attempting to fetch customers from database");
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });

    log.info(`Successfully fetched ${customers.length} customers`);
    return NextResponse.json(customers);
  } catch (error) {
    log.error("Failed to fetch customers", {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      fullError: error,
    });
    return NextResponse.json(
      {
        error: "Failed to fetch customers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  log.info("POST /api/customers - Request received");
  try {
    log.info("Parsing request body");
    const body = await req.json();
    log.info("Request body received", { bodyKeys: Object.keys(body) });

    log.info("Validating customer data against schema");
    const validatedData = customerSchema.parse(body);
    log.info("Validation successful", {
      companyName: validatedData.companyName,
      hasContactPerson: !!validatedData.contactPerson,
      hasPhone: !!validatedData.phone,
      hasEmail: !!validatedData.email,
    });

    log.info("Creating customer in database", {
      companyName: validatedData.companyName,
    });
    const customer = await prisma.customer.create({
      data: {
        companyName: validatedData.companyName,
        contactPerson: validatedData.contactPerson || null,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        address: validatedData.address || null,
      },
    });

    log.info("Customer created successfully", { customerId: customer.id });
    return NextResponse.json(customer, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      log.warn("Validation error - invalid customer data", {
        errors: err.errors,
        errorCount: err.errors.length,
      });
      return NextResponse.json(
        { error: "Validation error", details: err.errors },
        { status: 400 }
      );
    }

    log.error("Failed to create customer", {
      errorType: err instanceof Error ? err.constructor.name : typeof err,
      errorMessage: err instanceof Error ? err.message : String(err),
      errorStack: err instanceof Error ? err.stack : undefined,
      fullError: err,
    });
    return NextResponse.json(
      {
        error: "Failed to create customer",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
