import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface DropdownProps {
  items: {
    label: string;
    value: string;
  }[];
  value: string;
  onselect: (item: string) => void;
}

const Dropdown = ({ items, value, onselect }: DropdownProps) => {
  const t = useTranslations("common.labels");
  return (
    <Select onValueChange={onselect} value={value}>
      <SelectTrigger className="">
        <SelectValue placeholder={t("selectType")} />
      </SelectTrigger>
      <SelectContent className="">
        <SelectGroup>
          <SelectLabel>Type</SelectLabel>
          {items.map((item, index) => (
            <SelectItem value={item.value} key={index}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default Dropdown;
