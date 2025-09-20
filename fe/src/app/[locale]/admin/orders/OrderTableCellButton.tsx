"use client";

import { TableCell } from "@/components/ui/table";
import { Popover, PopoverContent } from "@/components/ui/popover";
import {
  ExternalLink,
  GripVertical,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import StarRating from "@/components/StarRating";
import Link from "next/link";
import { useTranslations } from "next-intl";
// import { Modal } from "@/components/Modal";

interface ActionButtonProps {
  row: string[];
  rowIndex: number;
  // handleClick: () => void;
}

export default function ClientTableCellButton({
  row,
}: // rowIndex,
ActionButtonProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("common");

  return (
    <TableCell className="min-w-32">
      <Link href={`/admin/orders/${row[0]}`} className="border-b mr-1 h-6">
        {t("buttons.viewDetails")}
      </Link>

      <Popover onOpenChange={() => setOpen(!open)} open={open}>
        {/* <PopoverTrigger className="border-b">View details</PopoverTrigger> */}
        <PopoverContent className="rounded-md p-0 w-[350px] overflow-y-scroll ">
          {/* <Modal isOpen={open}> */}
          <div className="bg-black px-2 items-center rounded-t-md text-white flex justify-between max-h-[150vh] overflow-y-scroll ">
            <div className="flex items-center">
              <GripVertical size={20} />
              <div>
                {t("labels.order")} {row[0]}
              </div>
            </div>
            <div className="space-x-2 items-center">
              <Button className="bg-transparent hover:bg-transparent y p-0 hover:text-gray-400">
                <ExternalLink />
              </Button>
              <Button
                onClick={() => setOpen(false)}
                className="bg-transparent p-0 hover:bg-transparent hover:text-red-500"
              >
                <X />
              </Button>
            </div>
          </div>
          <div className="">
            <div className="my-2 px-4 border mx-2 rounded-[10px] py-2 text-subtitle space-y-2 font-semibold">
              <div className="flex text-[12px] items-center gap-x-2">
                <div className="">{t("labels.id")}:</div>
                <div>{row[0]}</div>
              </div>
              <div className="flex text-[12px] items-center gap-x-2">
                <div>{t("labels.type")}:</div>
                <div>{row[4]}</div>
              </div>
              <div className="flex text-[12px] items-center gap-x-2">
                <div>{t("labels.status")}:</div>
                <div>{row[6]}</div>
              </div>
              <div className="flex text-[12px] items-center gap-x-2">
                <div>{t("labels.dateSubmitted")}:</div>
                <div>{row[2]}</div>
              </div>
              <div className="flex text-[12px] items-center gap-x-2">
                <div>{t("labels.price")}:</div>
                <div>{row[5]}</div>
              </div>
            </div>

            <div className="border rounded-[10px] m-2 p-2">
              <div className="font-semibold text-[16px] text-subtitle">
                {t("labels.addAdjustment")}
              </div>
              <div className="mt-2">
                <label className="text-[14px] mb-1 font-medium text-subtitle">
                  {t("labels.addPercentage")}
                </label>
                <Input type="number" max={100} min={0} maxLength={3} />
              </div>

              <div className="mt-2">
                <label className="text-[14px] mb-1 font-medium text-subtitle">
                  {t("labels.addPrice")}
                </label>
                <Input type="number" />
              </div>

              <div className="mt-2 flex items-center gap-x-2 ">
                <div className="text-[14px] font-medium text-subtitle">
                  {t("labels.totalPrice")}:
                </div>
                <div className="text-[14px] text-blue-500">{row[5]}</div>
              </div>
            </div>

            <Tabs
              defaultValue="mover-details"
              className="border mx-2 rounded-[10px]"
            >
              <TabsList className="bg-transparent gap-x-2 px-4">
                <TabsTrigger
                  value="mover-details"
                  className="bg-transparent px-0 focus:shadow-none  focus:border-b-2  border-black rounded-none data-[state=active]:shadow-none"
                >
                  {t("labels.moverDetails")}
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="bg-transparent px-0 focus:bg-transparent focus:shadow-none focus:border-b-2  border-black rounded-none data-[state=active]:shadow-none"
                >
                  {t("labels.documents")}
                </TabsTrigger>
                <TabsTrigger
                  value="request-details"
                  className="bg-transparent px-0 focus:bg-transparent focus:shadow-none focus:border-b-2  border-black rounded-none data-[state=active]:shadow-none"
                >
                  {t("labels.requestDetails")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mover-details" className="">
                <div className="my-2 px-4 text-subtitle space-y-2 font-semibold">
                  <div className="flex items-center gap-x-2">
                    <User strokeWidth={3} size={14} />
                    <div className="text-[12px]">{row[3]}</div>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Mail strokeWidth={3} size={14} />
                    <div className="text-[12px]">Johndoe123@example.com</div>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Phone strokeWidth={3} size={14} />
                    <div className="text-[12px]">+46(273) 647-7364</div>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <MapPin strokeWidth={3} size={14} />
                    <div className="text-[12px]">123 Main St, Cityville</div>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <div className="text-[12px]">{t("labels.rating")}</div>
                    <StarRating rating={3.5} />
                  </div>
                </div>
                <div className="grid grid-cols-3 border-r w-full mt-2 py-2 bg-[#F4F5F5] ">
                  <button className="flex justify-around items-center border-l bg-[#F4F5F5]">
                    {t("buttons.accept")}
                  </button>
                  <button className="flex justify-around text-red-500 items-center border-r border-l bg-[#F4F5F5]">
                    {t("buttons.reject")}
                  </button>
                  <button className="flex justify-around items-center bg-[#F4F5F5]">
                    {t("buttons.download")}
                  </button>
                </div>
              </TabsContent>
              <TabsContent value="documents">
                {t("labels.documents")}
              </TabsContent>
              <TabsContent value="request-details">
                {t("labels.requestDetails")}
              </TabsContent>
            </Tabs>
          </div>
          {/* </Modal> */}
        </PopoverContent>
      </Popover>
    </TableCell>
  );
}
