import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const statsDoc = await db.collection("stats").doc("global").get();
    const totalRecipes = statsDoc.exists ? (statsDoc.data()?.total_recipes || 0) : 0;
    return NextResponse.json({ totalRecipes }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json({ totalRecipes: 0 });
  }
}
