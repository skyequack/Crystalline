import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const itemSchema = z.object({
  category: z.enum(["GLASS", "ALUMINUM", "HARDWARE", "LABOR", "MISC"]),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  defaultRate: z.number().min(0, "Rate must be positive"),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const activeOnly = searchParams.get("active") === "true";

    const where: any = {};
    if (category) where.category = category;
    if (activeOnly) where.isActive = true;

    const items = await db.itemCatalog.findMany(where);

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = itemSchema.parse(body);

    const item = await db.itemCatalog.create({
      category: validatedData.category,
      name: validatedData.name,
      description: validatedData.description || null,
      unit: validatedData.unit,
      defaultRate: validatedData.defaultRate,
      isActive: validatedData.isActive ?? true,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: err.errors },
        { status: 400 }
      );
    }
    console.error("Error creating item:", err);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
