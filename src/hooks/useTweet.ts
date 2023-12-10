import { useState } from "react";

import { useRouter } from "next/navigation";

export default function useTweet() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const postActivity = async ({
    handle,
    title,
    begintime,
    endtime,
  }: {
    handle: string;
    title: string;
    begintime: string;
    endtime: string;
  }) => {
    setLoading(true);

    const res = await fetch("/api/activities", {
      method: "POST",
      body: JSON.stringify({
        handle,
        title,
        begintime,
        endtime,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('API request failed with error:', errorData.error);
      throw new Error('API request failed');
    }

    // router.refresh() is a Next.js function that refreshes the page without
    // reloading the page. This is useful for when we want to update the UI
    // from server components.

    const activity = await res.json();

    const tweetId = activity.id;

    await fetch("/api/likes", {
      method: "POST",
      body: JSON.stringify({
        tweetId,
        userHandle: handle,
      }),
    });

    router.push(`/tweet/${activity.id}?username=${activity.username}&handle=${handle}`);
    setLoading(false);
  };

  const postTweet = async ({
    handle,
    content,
    replyToTweetId,
  }: {
    handle: string;
    content: string;
    replyToTweetId?: number;
  }) => {
    setLoading(true);

    const res = await fetch("/api/tweets", {
      method: "POST",
      body: JSON.stringify({
        handle,
        content,
        replyToTweetId,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error);
    }

    // router.refresh() is a Next.js function that refreshes the page without
    // reloading the page. This is useful for when we want to update the UI
    // from server components.
    router.refresh();
    setLoading(false);
  };


  

  return {
    postActivity,
    postTweet,
    loading,
  };
}
