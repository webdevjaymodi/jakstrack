import { NextResponse } from "next/server";
import { deleteSession } from "@/app/lib/auth";

export async function POST() {
  try {
    await deleteSession();
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("LOGOUT_ERROR:", error);
    return NextResponse.json({ message: "Logged out" });
  }
}
