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
const putTimeRequestSchema = z.object({
  tweetId: z.number().positive(),
  userHandle: z.string().min(1).max(50),
  day: z.string().min(1).max(50),
  hour: z.number(),
});

// you can use z.infer to get the typescript type from a zod schema
type PutTimeRequest = z.infer<typeof putTimeRequestSchema>;

// This API handler file would be trigger by http requests to /api/likes
// POST requests would be handled by the POST function
// GET requests would be handled by the GET function
// etc.
// read more about Next.js API routes here:
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers
export async function POST(request: NextRequest) {
  const data = await request.json();
  try {
    // parse will throw an error if the data doesn't match the schema
    putTimeRequestSchema.parse(data);
  } catch (error) {
    // in case of an error, we return a 400 response
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Now we can safely use the data from the request body
  // the `as` keyword is a type assertion, this tells typescript
  // that we know what we're doing and that the data is of type LikeTweetRequest.
  // This is safe now because we've already validated the data with zod.
  const { tweetId, userHandle, day, hour} = data as PutTimeRequest;

  const existingRecord = await db
  .select({
    tweetId: timeTable.tweetId,
    handle: timeTable.userHandle,
    day: timeTable.day,
    hour: timeTable.hour,
  })
  .from(timeTable)
  .where(
    and(eq(timeTable.tweetId, tweetId),
         eq(timeTable.userHandle, userHandle),
         eq(timeTable.day, day),
         eq(timeTable.hour, hour),
    ),
  )
  .execute();

  if (existingRecord.length === 0) {
    try {
      await db
        .insert(timeTable)
        .values({
          tweetId,
          userHandle,
          day,
          hour,
        })
        .execute();
    } catch (error) {
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 },
      );
    }}

  return new NextResponse("OK", { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const data = await request.json();

  try {
    putTimeRequestSchema.parse(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { tweetId, userHandle, day, hour} = data as PutTimeRequest;

  try {
    await db
      .delete(timeTable)
      .where(
        and(
          eq(timeTable.tweetId, tweetId),
          eq(timeTable.userHandle, userHandle),
          eq(timeTable.day, day),
          eq(timeTable.hour, hour),
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
