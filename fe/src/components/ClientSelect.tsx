"use client";

import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguageStore } from "@/store/languageStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClientSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  name: string;
  defaultValue?: string;
};

export default function ClientSelect({
  value,
  onValueChange,
  placeholder,
  options,
  name,
  defaultValue,
}: ClientSelectProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { language } = useLanguageStore();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) {
    return <Skeleton className="h-10 w-full" />;
  }

  // Using key to force a clean remount when language changes
  return (
    <div key={`select-${language}-${name}`}>
      <Select
        value={value}
        onValueChange={onValueChange}
        defaultValue={defaultValue}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
