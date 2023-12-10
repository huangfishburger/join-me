import Link from "next/link";
import { redirect } from "next/navigation";

import { eq, desc, sql, and } from "drizzle-orm";
import {ArrowLeft} from "lucide-react";

import LikeButton from "@/components/LikeButton";
import ReplyInput from "@/components/ReplyInput";
import TimeText from "@/components/TimeText";
import Reply from "@/components/Reply";
import TimeSelector from "@/components/TimeSelector";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { likesTable, activityTable, usersTable, tweetsTable, timeTable } from "@/db/schema";
import { getAvatar } from "@/lib/utils";

type TweetPageProps = {
  params: {
    // this came from the file name: [tweet_id].tsx
    tweet_id: string;
  };
  searchParams: {
    // this came from the query string: ?username=madmaxieee
    username?: string;
    handle?: string;
  };
};

// these two fields are always available in the props object of a page component
export default async function TweetPage({
  params: { tweet_id },
  searchParams: { username, handle },
}: TweetPageProps) {
  // this function redirects to the home page when there is an error
  const errorRedirect = () => {
    const params = new URLSearchParams();
    username && params.set("username", username);
    handle && params.set("handle", handle);
    redirect(`/?${params.toString()}`);
  };

  // if the tweet_id can not be turned into a number, redirect to the home page
  const tweet_id_num = parseInt(tweet_id);
  if (isNaN(tweet_id_num)) {
    errorRedirect();
  }

  const [activityData] = await db
    .select({
      id: activityTable.id,
      title: activityTable.title,
      userHandle: activityTable.userHandle,
      begintime: activityTable.begintime,
      endtime: activityTable.endtime,
    })
    .from(activityTable)
    .where(eq(activityTable.id, tweet_id_num))
    .execute();


  if (!activityData) {
    errorRedirect();
  }

  const likes = await db
    .select({
      id: likesTable.id,
    })
    .from(likesTable)
    .where(eq(likesTable.tweetId, tweet_id_num))
    .execute();

  const numLikes = likes.length;

  const [liked] = await db
    .select({
      id: likesTable.id,
    })
    .from(likesTable)
    .where(
      and(
        eq(likesTable.tweetId, tweet_id_num),
        eq(likesTable.userHandle, handle ?? ""),
      ),
    )
    .execute();

  const [user] = await db
    .select({
      displayName: usersTable.displayName,
      handle: usersTable.handle,
    })
    .from(usersTable)
    .where(eq(usersTable.handle, activityData.userHandle))
    .execute();

  const activity = {
    id: activityData.id,
    title: activityData.title,
    username: user.displayName,
    handle: user.handle,
    likes: numLikes,
    begintime: activityData.begintime,
    endtime: activityData.endtime,
    liked: Boolean(liked),
  };

  // The following code is almost identical to the code in src/app/page.tsx
  // read the comments there for more info.
  const likesSubquery = db.$with("likes_count").as(
    db
      .select({
        tweetId: likesTable.tweetId,
        likes: sql<number | null>`count(*)`.mapWith(Number).as("likes"),
      })
      .from(likesTable)
      .groupBy(likesTable.tweetId),
  );

  const likedSubquery = db.$with("liked").as(
    db
      .select({
        tweetId: likesTable.tweetId,
        liked: sql<number>`1`.mapWith(Boolean).as("liked"),
      })
      .from(likesTable)
      .where(eq(likesTable.userHandle, handle ?? "")),
  );

  const replies = await db
    .with(likesSubquery, likedSubquery)
    .select({
      id: tweetsTable.id,
      content: tweetsTable.content,
      username: usersTable.displayName,
      handle: usersTable.handle,
      likes: likesSubquery.likes,
      createdAt: tweetsTable.createdAt,
      liked: likedSubquery.liked,
    })
    .from(tweetsTable)
    .where(eq(tweetsTable.replyToTweetId, tweet_id_num))
    .orderBy(desc(tweetsTable.createdAt))
    .innerJoin(usersTable, eq(tweetsTable.userHandle, usersTable.handle))
    .leftJoin(likesSubquery, eq(tweetsTable.id, likesSubquery.tweetId))
    .leftJoin(likedSubquery, eq(tweetsTable.id, likedSubquery.tweetId))
    .execute();
  
  const timeCount = await db
    .select({
      day: timeTable.day,
      hour: timeTable.hour,
      count: sql<number | null>`count(*)`.mapWith(Number).as("count"),
    })
    .from(timeTable)
    .where(eq(timeTable.tweetId, tweet_id_num))
    .groupBy(timeTable.day, timeTable.hour)
    .execute();

  if(!handle){
    return
  }

  const selectedTime = await db
    .select({
      day: timeTable.day,
      hour: timeTable.hour,
    })
    .from(timeTable)
    .where(eq(timeTable.tweetId, tweet_id_num))
    .where(eq(timeTable.userHandle, handle))
    .execute();
    

  const begintime = activity.begintime;
  const endtime = activity.endtime;

  return (
    <>
      <div className="flex h-screen w-full max-w-2xl flex-col overflow-scroll pt-2">
        <div className="mb-2 flex items-center gap-8 px-4">
          <Link href={{ pathname: "/", query: { username, handle } }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold">Activity</h1>
        </div>
        <div className="flex flex-col px-4 pt-3">
          <div className="flex justify-between">
            <div className="flex w-full gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAvatar(activity.username)}
                alt="user avatar"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <p className="font-bold">{activity.username ?? "..."}</p>
                <p className="font-normal text-gray-500">
                  @{activity.handle ?? "..."}
                </p>
              </div>
            </div>
          </div>
          <time className="my-4 block text-sm text-gray-500 flex flex-row">
            <TimeText date={begintime} format=" D MMM YYYY · h:mm A " />
            <p className="ml-2 mr-2">-</p>
            <TimeText date={endtime} format=" D MMM YYYY · h:mm A " />
          </time>
          <article className="mb-5 whitespace-pre-wrap text-xl">
            {activity.title}
          </article>
          <div className="flex flex-row justify-between mb-2">
            <p className="font-semibold">{activity.likes === null ? "0人參加" : `${activity.likes}人參加`}</p>
            <LikeButton
              handle={handle}
              initialLikes={activity.likes}
              initialLiked={activity.liked}
              tweetId={activity.id}
              text={`${activity.liked ? "我已參加" : "我要參加"}`}
            />
          </div>
          <Separator />
        </div>
        {activity.liked ? 
          <ReplyInput replyToTweetId={activity.id} replyToHandle={activity.handle} /> 
          : <p className="m-5 font-medium bg-yellow-100">趕快參加此活動來加入討論吧！</p>}
        
        <Separator />
        {replies.reverse().map((reply) => (
          <Reply
            key={reply.id}
            id={reply.id}
            username={username}
            handle={handle}
            authorName={reply.username}
            authorHandle={reply.handle}
            content={reply.content}
            likes={reply.likes}
            liked={reply.liked}
            createdAt={reply.createdAt!}
          />
        ))}
        {activity.liked ? 
        <TimeSelector 
          key={activity.liked  ? 'true' : 'false'}
          tweetId={activity.id}
          handle={handle}          
          begintime={begintime}
          endtime={endtime}
          selectedTime={selectedTime}
          timeCount={timeCount}
          click={true} />:
          <TimeSelector 
          key={activity.liked  ? 'false' : 'true'}
          tweetId={activity.id}
          handle={handle}          
          begintime={begintime}
          endtime={endtime}
          selectedTime={selectedTime}
          timeCount={timeCount}
          click={false} />}

      </div>
    </>
  );
}
