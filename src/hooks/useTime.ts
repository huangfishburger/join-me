import { useState } from "react";

import { useRouter } from "next/navigation";

export default function useTime() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectTime = async ({
    tweetId,
    userHandle,
    day,
    hour,
  }: {
    tweetId: number;
    userHandle: string;
    day: string;
    hour: number;
  }) => {
    if (loading) return;
    setLoading(true);

    const res = await fetch("/api/time", {
      method: "POST",
      body: JSON.stringify({
        tweetId,
        userHandle,
        day,
        hour,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error);
    } 
    router.refresh();
    setLoading(false);
  };

  const unselectTime = async ({
    tweetId,
    userHandle,
    day,
    hour,
  }: {
    tweetId: number;
    userHandle: string;
    day: string;
    hour: number;
  }) => {
    if (loading) return;
    setLoading(true);

    const res = await fetch("/api/time", {
      method: "DELETE",
      body: JSON.stringify({
        tweetId,
        userHandle,
        day,
        hour,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error);
    } 

    router.refresh();
    setLoading(false);
  };

  const deleteTime = async ({
    tweetId,
    userHandle,
  }: {
    tweetId: number;
    userHandle: string;
  }) => {
    if (loading) return;
    setLoading(true);

    const res = await fetch("/api/info", {
      method: "DELETE",
      body: JSON.stringify({
        tweetId,
        userHandle,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error);
    } 
    router.refresh();
    setLoading(false);
  };

  return {
    selectTime,
    unselectTime,
    deleteTime,
    loading,
  };
}
