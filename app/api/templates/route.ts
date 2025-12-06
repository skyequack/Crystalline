import { NextResponse } from "next/server";
import scopeTemplates from "@/data/scope-templates.json";

export async function GET() {
  try {
    return NextResponse.json(scopeTemplates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
