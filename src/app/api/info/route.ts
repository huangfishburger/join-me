import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";

import { db } from "@/db";
import { timeTable } from "@/db/schema";

import { eq, and } from "drizzle-orm";

// zod is a library that helps us validate data at runtime
// it's useful for validating data coming from the client,
// since typescript only validates data at compile time.
// zod's schema syntax is pretty intuitive,
// read more about zod here: https://zod.dev/
const deleteInfoRequestSchema = z.object({
  tweetId: z.number().positive(),
  userHandle: z.string().min(1).max(50),
});

// you can use z.infer to get the typescript type from a zod schema
type DeleteInfoRequest = z.infer<typeof deleteInfoRequestSchema>;


export async function DELETE(request: NextRequest) {
  const data = await request.json();

  try {
    deleteInfoRequestSchema.parse(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { tweetId, userHandle } = data as DeleteInfoRequest;

  try {
    await db
      .delete(timeTable)
      .where(
        and(
          eq(timeTable.tweetId, tweetId),
          eq(timeTable.userHandle, userHandle),
        ),
      )
      .execute();
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
  return new NextResponse("OK", { status: 200 });
}
