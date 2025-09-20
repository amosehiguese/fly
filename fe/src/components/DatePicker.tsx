"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocale, useTranslations } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";
interface DatePickerProps {
  selectedDate?: Date;
  onDateChange: (date: Date | undefined) => void;
  buttonClassName?: string;
  popoverClassName?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateChange,
  buttonClassName,
  popoverClassName,
}) => {
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    selectedDate
  );

  const handleDateChange = (date: Date | undefined) => {
    setInternalDate(date);
    onDateChange(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          onClick={() => setOpen(!open)}
          variant={"outline"}
          className={cn(
            " justify-start text-left font-normal",
            !internalDate && "text-muted-foreground",
            buttonClassName
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            formatDateLocale(selectedDate.toISOString(), locale, "PPP")
          ) : (
            <span>{tCommon("buttons.pickDate")}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0", popoverClassName)}>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
