import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("AUTH_ME_ERROR:", error);
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 }
    );
  }
}
