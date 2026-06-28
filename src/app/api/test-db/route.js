import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request) {
  try {
    const email = "test12@mundra.com";
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Try linking a dummy account to see if Prisma Adapter logic would crash
    const dummyAccount = {
      userId: user.id,
      type: "oauth",
      provider: "google",
      providerAccountId: "123456789",
      access_token: "dummy_token",
    };

    // Check if it already exists
    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: "123456789",
        }
      }
    });

    if (!existingAccount) {
       await prisma.account.create({ data: dummyAccount });
    }

    return NextResponse.json({ success: true, message: "Database works perfectly for OAuth!" });
  } catch (error) {
    console.error("TEST_ERROR:", error);
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
