import { NextResponse } from "next/server";
import { deleteSession } from "@/app/lib/auth";

export async function POST() {
  try {
    await deleteSession();

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Logout Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
