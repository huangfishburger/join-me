import Link from "next/link";

import { Separator } from "@/components/ui/separator";

import LikeButton from "./LikeButton";
import TimeText from "./TimeText";

type TweetProps = {
  username?: string;
  handle?: string;
  id: number;
  authorName: string;
  authorHandle: string;
  title: string;
  likes: number;
  liked?: boolean;
  begintime: string;
  endtime: string;
};

// note that the Tweet component is also a server component
// all client side things are abstracted away in other components
export default function Tweet({
  username,
  handle,
  id,
  authorName,
  authorHandle,
  title,
  likes,
  liked,
  begintime,
  endtime,
}: TweetProps) {

  return (
    <>
      <Link
        className="w-full px-4 pt-3 transition-colors hover:bg-gray-50"
        href={{
          pathname: `/tweet/${id}`,
          query: {
            username,
            handle,
          },
        }}
      >
        <div className="flex gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <article className="flex grow flex-col">
            <p className="font-bold">
              {authorName}
              <span className="ml-2 font-normal text-gray-400">
                @{authorHandle}
              </span>
            </p>
            <div className="font-normal text-gray-400 flex flex-row">
              <TimeText date={begintime} format=" D MMM YYYY · h:mm A " />
                <p className="ml-2 mr-2">-</p>
              <TimeText date={endtime} format=" D MMM YYYY · h:mm A " />
            </div>
            {/* `white-space: pre-wrap` tells html to render \n and \t chracters  */}
            <article className="mt-2 mb-2 whitespace-pre-wrap text-xl break-all">{title}</article>
          </article>
          <div className="my-2 flex items-center text-gray-400">
            <LikeButton
              initialLikes={likes}
              initialLiked={liked}
              tweetId={id}
              handle={handle}
            />
            <p>{likes === null ? "0人參加" : `${likes}人參加`}</p>
          </div>
        </div>
      </Link>
      <Separator />
    </>
  );
}
