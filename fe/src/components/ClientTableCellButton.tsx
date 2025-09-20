"use client";

import { TableCell } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Download,
  ExternalLink,
  GripVertical,
  Mail,
  Phone,
  Printer,
  User,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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
  // console.log(row);

  return (
    <TableCell>
      <Popover onOpenChange={() => setOpen(!open)} open={open}>
        <div className="flex items-center">
          <PopoverTrigger className="border-b w-20">
            View details
          </PopoverTrigger>
          <Button className="bg-black h-6 px-2 ml-2">Export</Button>
        </div>
        <PopoverContent className="rounded-md p-0">
          <div className="bg-black px-2 items-center rounded-t-md text-white flex justify-between ">
            <div className="flex items-center">
              <GripVertical size={20} />
              <div>Order {row[0]}</div>
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
            <div className="my-2 px-4 text-subtitle space-y-2 font-semibold">
              <div className="flex items-center gap-x-2">
                <User strokeWidth={3} size={14} />
                <div className="text-[12px]">{row[1]}</div>
              </div>
              <div className="flex items-center gap-x-2">
                <Mail strokeWidth={3} size={14} />
                <div className="text-[12px]">Johndoe123@example.com</div>
              </div>
              <div className="flex items-center gap-x-2">
                <Phone strokeWidth={3} size={14} />
                <div className="text-[12px]">+46(273) 647-7364</div>
              </div>
            </div>
            <Tabs defaultValue="order-details" className="">
              <TabsList className="bg-transparent gap-x-2 px-4">
                <TabsTrigger
                  value="order-details"
                  className="bg-transparent px-0 focus:shadow-none  focus:border-b-2  border-black rounded-none data-[state=active]:shadow-none"
                >
                  Order Details
                </TabsTrigger>
                <TabsTrigger
                  value="location"
                  className="bg-transparent px-0 focus:bg-transparent focus:shadow-none focus:border-b-2  border-black rounded-none data-[state=active]:shadow-none"
                >
                  Location
                </TabsTrigger>
                <TabsTrigger
                  value="order-items"
                  className="bg-transparent px-0 focus:bg-transparent focus:shadow-none focus:border-b-2  border-black rounded-none data-[state=active]:shadow-none"
                >
                  Order Items
                </TabsTrigger>
              </TabsList>
              <TabsContent value="order-details" className="">
                <div className="space-y-4 px-4 ">
                  <div className="flex text-subtitle text-[12px] font-medium">
                    <div className="w-[35%]">Service Type:</div>
                    <div>{row[2]}</div>
                  </div>
                  <div className="flex text-subtitle text-[12px] font-medium">
                    <div className="w-[35%]">Mover:</div>
                    <div>{row[5]}</div>
                  </div>
                  <div className="flex text-subtitle text-[12px] font-medium">
                    <div className="w-[35%]">Mover Date:</div>
                    <div>{row[3]}</div>
                  </div>
                  <div>
                    <div className="flex justify-between font-medium ">
                      <div>Total</div>
                      <div>{row[6]}</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 border-r w-full mt-2 py-2 bg-[#F4F5F5] ">
                  <button className="flex justify-around items-center bg-[#F4F5F5]">
                    <Download size={20} />
                    <div>Download</div>
                  </button>

                  <button className="flex justify-around items-center border-l bg-[#F4F5F5]">
                    <Printer size={20} />
                    <div>Print</div>
                  </button>
                </div>
              </TabsContent>
              <TabsContent value="location">Location</TabsContent>
              <TabsContent value="order-items">Order Items</TabsContent>
            </Tabs>
          </div>
        </PopoverContent>
      </Popover>
    </TableCell>
  );
}
