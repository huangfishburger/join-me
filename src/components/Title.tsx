"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect} from "react";

import UserAvatar from "@/components/UserAvatar";
import ActivityDialog from "@/components/ActivityDialog";
import useUserInfo from "@/hooks/useUserInfo";

import TextField from "@mui/material/TextField";

// type TitleProps = {
//   searchvalue: (searchValue: string) => Promise<void>;
// };

export default function Title() {
  const { username, handle } = useUserInfo();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();


  const handleAdd = () => {
    setDialogOpen(true);
  }

  const handleSearch = () =>{
    setSearch(search);
    const params = new URLSearchParams();
    username && params.set("username", username);
    handle && params.set("handle", handle);
    search && params.set("keyword", search)
    router.push(`/?${params.toString()}`)
  }

  useEffect(() => {
    console.log(dialogOpen);
  }, [dialogOpen]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-row w-full px-4 pt-3 gap-5 mb-3">
        <UserAvatar />
        <div className="w-40 max-lg:hidden">
          <p className="text-sm font-bold">{username ?? "..."}</p>
          <p className="text-sm text-gray-500">{`@${handle}`}</p>
        </div>
        <button className="ml-auto border p-2 rounded-xl text-gray-500 border-gray-400 hover:text-gray-800 hover:border-gray-800"
          onClick={() => router.push("/")}>
          切換使用者
        </button>
      </div>
      <div className="flex flex-row w-full px-4 pt-3 gap-5 mb-3">
        <TextField 
          id="standard-basic" 
          label="Search Activities" 
          variant="standard"
          sx={{width: '25rem'}} 
          value={search}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(event.target.value);}}
            />
        <button className="border p-2 rounded-xl text-gray-500 border-gray-400 hover:text-gray-800 hover:border-gray-800"
          onClick={handleSearch}>
          搜尋
        </button>
        <button className="ml-auto border p-2 rounded-xl text-gray-500 border-gray-400 hover:text-gray-800 hover:border-gray-800"
          onClick={handleAdd}>
          新增活動
        </button>
      </div>
      {dialogOpen && (
        <ActivityDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </div>
  );
}
