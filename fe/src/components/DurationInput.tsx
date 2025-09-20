import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TimeUnit = "minute" | "hour" | "day" | "week" | "month" | "year";

interface DurationInputProps {
  value: number; // Value in minutes
  onChange: (valueInMinutes: number) => void;
  className?: string;
}

const conversionFactors: Record<TimeUnit, number> = {
  minute: 1,
  hour: 60,
  day: 1440, // 24 hours
  week: 10080, // 7 days
  month: 43200, // ~30 days
  year: 525600, // 365 days
};

export function DurationInput({
  value,
  onChange,
  className,
}: DurationInputProps) {
  // Determine the best unit to display based on the value
  const getBestUnit = (minutes: number): TimeUnit => {
    if (minutes % 525600 === 0 && minutes >= 525600) return "year";
    if (minutes % 43200 === 0 && minutes >= 43200) return "month";
    if (minutes % 10080 === 0 && minutes >= 10080) return "week";
    if (minutes % 1440 === 0 && minutes >= 1440) return "day";
    if (minutes % 60 === 0 && minutes >= 60) return "hour";
    return "minute";
  };

  const [unit, setUnit] = useState<TimeUnit>(getBestUnit(value || 0));
  const [displayValue, setDisplayValue] = useState<number>(
    value ? value / conversionFactors[unit] : 0
  );

  // Update display value when the input value or unit changes
  useEffect(() => {
    setDisplayValue(value ? value / conversionFactors[unit] : 0);
  }, [value, unit]);

  // Convert to minutes and notify parent when value changes
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? 0 : Number(e.target.value);
    setDisplayValue(newValue);
    const valueInMinutes = newValue * conversionFactors[unit];
    onChange(valueInMinutes);
  };

  // Convert to minutes and notify parent when unit changes
  const handleUnitChange = (newUnit: TimeUnit) => {
    setUnit(newUnit);
    const valueInMinutes = displayValue * conversionFactors[newUnit];
    onChange(valueInMinutes);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Input
        type="number"
        min="0"
        value={displayValue || ""}
        onChange={handleValueChange}
        className="flex-1"
      />
      <Select value={unit} onValueChange={handleUnitChange}>
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Unit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="minute">Minute(s)</SelectItem>
          <SelectItem value="hour">Hour(s)</SelectItem>
          <SelectItem value="day">Day(s)</SelectItem>
          <SelectItem value="week">Week(s)</SelectItem>
          <SelectItem value="month">Month(s)</SelectItem>
          <SelectItem value="year">Year(s)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
