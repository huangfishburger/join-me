"use client";

import { useEffect, useRef, useState } from "react";

import useUserInfo from "@/hooks/useUserInfo";
import useTweet from "@/hooks/useTweet";

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField';

import { format } from 'date-fns';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, validateUsername, validateTime } from "@/lib/utils";
import type { Dayjs } from "dayjs";

type DialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  };

export default function ACtivityDialog({
    open,
    onOpenChange
}: DialogProps) {
  const [dialogOpen, setDialogOpen] = useState(open);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [titleError, setTitleError] = useState(false);
  const [beginError, setBeginError] = useState(false);
  const [endError, setEndError] = useState(false);
  const [beginvalue, setBeginValue] = useState<Dayjs | null>(null);
  const [endvalue, setEndValue] = useState<Dayjs | null>(null);
  const { handle } = useUserInfo();
  const { postActivity } = useTweet();

  useEffect(() => {
    onOpenChange(dialogOpen);
  }, [dialogOpen, onOpenChange]);

  // handleSave modifies the query params to set the username and handle
  // we get from the input fields. src/app/page.tsx will read the query params
  // and insert the user into the database.
  const handleSave = async () => {
    const title = titleInputRef.current?.value;
    const newTitleError = !validateUsername(title);
    setTitleError(newTitleError);
    const newTimeError = !validateTime(beginvalue,endvalue);
    setBeginError(newTimeError);
    setEndError(newTimeError);

    if (!title || !handle || newTitleError || newTimeError) {
      return false;
    }

    const begin = beginvalue?.toDate();
    const end = endvalue?.toDate();
    if(!begin || !end){
      return false;
    }

    const begintime = format(begin, 'yyyy-MM-dd HH:mm:ss');
    const endtime = format(end, 'yyyy-MM-dd HH:mm:ss');
    if(!begintime || !endtime){
      return false;
    }

    try {
      await postActivity({
        handle,
        title,
        begintime,
        endtime,
      });
      titleInputRef.current.value = "";
      titleInputRef.current.dispatchEvent(
        new Event("input", { bubbles: true, composed: true }),
      );
    } catch (e) {
      console.error('Error:', e);
      alert("Error posting tweet");
    }

    // when navigating to the same page with different query params, we need to
    // preserve the pathname, so we need to manually construct the url
    // we can use the URLSearchParams api to construct the query string
    // We have to pass in the current query params so that we can preserve the
    // other query params. We can't set new query params directly because the
    // searchParams object returned by useSearchParams is read-only.
    // const params = new URLSearchParams(searchParams);
    // validateUsername and validateHandle would return false if the input is
    // invalid, so we can safely use the values here and assert that they are
    // not null or undefined.
    
    setDialogOpen(false);
    return true;
  };

  // You might notice that the dialog doesn't close when you click outside of
  // it. This is beacuse we perform some validation when the dialog closes.
  // If you pass `setDialogOpen` directly to the Dialog component, it will
  // behave like a normal dialog and close when you click outside of it.
  //
  // The Dialog component calls onOpenChange when the dialog wants to open or
  // close itself. We can perform some checks here to prevent the dialog from
  // closing if the input is invalid.
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDialogOpen(true);
    } else {
      // If handleSave returns false, it means that the input is invalid, so we
      // don't want to close the dialog
      setDialogOpen(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新增活動</DialogTitle>
          <DialogDescription>
            寫下活動標題與日期吧！
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              標題
            </Label>
            <Input
              placeholder="Activity Title"
              className={cn(titleError && "border-red-500", "col-span-3")}
              ref={titleInputRef}
            />
            {titleError && (
              <p className="col-span-3 col-start-2 text-xs text-red-500">
                Invalid title, use only{" "}
                <span className="font-mono">[a-z0-9 ]</span>, must be between 1
                and 50 characters long.
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              from
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              {/* <Input
                placeholder="Start Date"
                className={cn(handleError && "border-red-500")}
                ref={handleInputRef}
              /> */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DateTimeField']}>
                  <DateTimeField
                  className={cn(beginError && "border-red-500")} 
                  label="Start time" 
                  format="YYYY/MM/DD HH"
                  onChange={(newValue: Dayjs | null) => {
                    setBeginValue(newValue)}
                  }/>
                </DemoContainer>
              </LocalizationProvider>
            </div>
            {beginError && (
              <p className="col-span-3 col-start-2 text-xs text-red-500">
                請確認日期格式，並保證開始日期應早於結束日期，且活動時長不可超過七日
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              to
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DateTimePicker']}>
                  <DateTimeField 
                  className={cn(endError && "border-red-500")} 
                  label="End time" 
                  format="YYYY/MM/DD HH"
                  onChange={(newValue: Dayjs | null) => {
                    setEndValue(newValue)}
                    }/>
                </DemoContainer>
              </LocalizationProvider>
            </div>
            {endError && (
              <p className="col-span-3 col-start-2 text-xs text-red-500">
                請確認日期格式，並保證開始日期應早於結束日期，且活動時長不可超過七日
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>新增</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
