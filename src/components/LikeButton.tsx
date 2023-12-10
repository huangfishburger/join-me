"use client";

import { useState } from "react";
import type { EventHandler, MouseEvent } from "react";

import { Check } from "lucide-react";

import useLike from "@/hooks/useLike";
import useTime from "@/hooks/useTime";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  initialLikes: number;
  initialLiked?: boolean;
  tweetId: number;
  handle?: string;
  text?: string;
};

export default function LikeButton({
  initialLikes,
  initialLiked,
  tweetId,
  handle,
  text,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const { likeTweet, unlikeTweet, loading } = useLike();
  const { deleteTime } = useTime();

  const handleClick: EventHandler<MouseEvent> = async (e) => {
    // since the parent node of the button is a Link, when we click on the
    // button, the Link will also be clicked, which will cause the page to
    // navigate to the tweet page, which is not what we want. So we stop the
    // event propagation and prevent the default behavior of the event.
    e.stopPropagation();
    e.preventDefault();
    if (!handle) return;
    if (liked) {
      await unlikeTweet({
        tweetId,
        userHandle: handle,
      });
      setLikesCount((prev) => prev - 1);
      setLiked(false);
      await deleteTime({
        tweetId,
        userHandle: handle,
      });
    } else {
      await likeTweet({
        tweetId,
        userHandle: handle,
      });
      setLikesCount((prev) => prev + 1);
      setLiked(true);
    }
  };

  return (
    <button
      className={cn(
        "flex items-center gap-1 hover:text-yellow-600",
        liked && "text-yellow-600",
      )}
      onClick={handleClick}
      disabled={loading}
    >
      <div
        className={cn(
          "flex flex-row items-center gap-1 rounded-full p-1.5 transition-colors duration-300 hover:bg-yellow-100",
          liked && likesCount && "bg-yellow-100" ,
        )}
      >
        <Check size={24} />
        <p>{text}</p>
      </div>
    </button>
  );
}
