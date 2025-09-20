"use client";

import { TableCell } from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { RefObject, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFetchBidById } from "@/hooks/admin/useFetchBids";
import { capitalizeWords } from "@/lib/capitalizeWords";
import { formatNumber } from "@/lib/formatNumber";
import { exportAsPDF } from "@/lib/exportAsPdf";
import { TableSkeleton } from "@/components/TableSkeleton";
import StarRating from "@/components/StarRating";
import { useFetchQuotationBidsById } from "@/hooks/admin/useFetchQuotationBids";
import { Link } from "@/i18n/navigation";
import { format, parseISO } from "date-fns";
import { parseArrayField } from "@/lib/parseArrayField";
// import { Modal } from "@/components/Modal";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { getQuotationTypeKey } from "@/lib/getQuotationTypeKey";
import { useDeleteBid } from "@/hooks/admin/useFetchBids";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const { data: bidData, isPending } = useFetchBidById(row[0]);
  const bid = bidData?.data;

  const { mutate: deleteBid, isPending: isDeleting } =
    useDeleteBid(setOpenDeleteDialog);

  const quotationType = bid?.quotation_type
    ? getQuotationTypeKey(bid.quotation_type, locale)
    : "";

  const { data: bidQuotationData } = useFetchQuotationBidsById(
    bid?.quotation_id.toString() || "",
    quotationType
  );
  const quotation = bidQuotationData?.data.quotation;

  const contentDownloadRef: RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);

  const downloadPdf = () =>
    exportAsPDF(contentDownloadRef, `quotation-bid-${bid?.bid_id}`);

  return (
    <>
      <TableCell>
        {bid?.bid_status === "pending" ? (
          <>
            <Button className="bg-black dark:bg-white px-2 mr-1 h-6">
              <Link href={`/admin/quotes-bids/bid/${bid?.bid_id}`}>
                {tCommon("buttons.accept")}
              </Link>
            </Button>
            <Button className="bg-black dark:bg-white px-2 mr-1 h-6">
              <button
                onClick={() => setOpenDeleteDialog(true)}
                disabled={isDeleting}
              >
                {isDeleting
                  ? tCommon("buttons.deleting")
                  : tCommon("buttons.delete")}
              </button>
            </Button>
            {/* <Button variant={"outline"} className="border-primary px-2 mr-1 h-6">
            Reject
          </Button> */}
            {/* <Button
            variant={"link"}
            onClick={() => setOpen(true)}
            className="text-black border-b  px-2 mr-1 h-6"
          >
            View Details
          </Button> */}
          </>
        ) : (
          <Popover onOpenChange={() => setOpen(!open)} open={open}>
            <PopoverTrigger asChild>
              <button className="border-b">
                {tCommon("buttons.viewDetails")}
              </button>
            </PopoverTrigger>
            <PopoverContent
              ref={contentDownloadRef}
              className="rounded-md p-0 w-[350px] max-h-[80vh] overflow-hidden z-30"
            >
              {/* <Modal isOpen={open}> */}
              {isPending ? (
                <TableSkeleton columns={3} rows={5} />
              ) : (
                <>
                  <div className="bg-black px-2 items-center rounded-t-md text-white flex justify-between sticky top-0 z-10">
                    <div className="flex items-center">
                      <GripVertical size={20} />
                      <div>Order {bid?.bid_id}</div>
                    </div>
                    <div className="space-x-2 items-center">
                      <Link href={`/admin/quotes-bids/bid/${bid?.bid_id}`}>
                        <Button className="bg-transparent hover:bg-transparent y p-0 hover:text-gray-400">
                          <ExternalLink />
                        </Button>
                      </Link>
                      <Button
                        onClick={() => setOpen(false)}
                        className="bg-transparent p-0 hover:bg-transparent hover:text-red-500"
                      >
                        <X />
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-[calc(80vh-48px)]">
                    <div className="">
                      <div className="my-2 px-4 border mx-2 rounded-[10px] py-2 text-subtitle dark:text-white space-y-2 font-semibold">
                        <div className="flex text-[12px] items-center gap-x-2">
                          <div className="">ID:</div>
                          <div>{bid?.bid_id}</div>
                        </div>
                        <div className="flex text-[12px] items-center gap-x-2">
                          <div>Type:</div>
                          <div>
                            {bid?.quotation_type
                              ? tCommon(
                                  `quotationTypes.${getQuotationTypeKey(bid.quotation_type, locale)}`
                                )
                              : "N/A"}
                          </div>
                        </div>
                        <div className="flex text-[12px] items-center gap-x-2">
                          <div>Status:</div>
                          <div>{capitalizeWords(bid?.bid_status)}</div>
                        </div>
                        <div className="flex text-[12px] items-center gap-x-2">
                          <div>Date Submitted:</div>
                          <div>
                            {bid?.bid_created_at
                              ? format(
                                  parseISO(bid?.bid_created_at || ""),
                                  "dd MMM yyyy"
                                )
                              : "N/A"}
                          </div>
                        </div>
                        <div className="flex text-[12px] items-center gap-x-2">
                          <div>Price:</div>
                          <div>
                            {formatNumber(Number(bid?.moving_cost))} SEK
                          </div>
                        </div>
                      </div>

                      <Tabs
                        defaultValue="mover-details"
                        className="border mx-2 rounded-[10px]"
                      >
                        <TabsList className="bg-transparent gap-x-2 px-4">
                          <TabsTrigger
                            value="mover-details"
                            className="bg-transparent px-0 focus:shadow-none data-[state=active]:text-foreground  data-[state=active]:border-b-2  focus:border-b-2  border-black dark:border-white rounded-none data-[state=active]:shadow-none"
                          >
                            Mover Details
                          </TabsTrigger>
                          <TabsTrigger
                            value="documents"
                            className="bg-transparent px-0 focus:bg-transparent focus:shadow-none focus:border-b-2  border-black rounded-none data-[state=active]:shadow-none"
                          >
                            Documents
                          </TabsTrigger>
                          <TabsTrigger
                            value="request-details"
                            className="bg-transparent px-0 focus:bg-transparent focus:shadow-none focus:border-b-2  border-black rounded-none data-[state=active]:shadow-none"
                          >
                            Request Details
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="mover-details" className="">
                          <div className="my-2 px-4 text-subtitle dark:text-white space-y-2 font-semibold">
                            <div className="flex items-center gap-x-2">
                              <User strokeWidth={3} size={14} />
                              <div className="text-[12px]">{row[3]}</div>
                            </div>
                            <div className="flex items-center gap-x-2">
                              <Mail strokeWidth={3} size={14} />
                              <div className="text-[12px]">
                                {bid?.supplier_email}
                              </div>
                            </div>
                            <div className="flex items-center gap-x-2">
                              <Phone strokeWidth={3} size={14} />
                              <div className="text-[12px]">
                                {bid?.supplier_phone}
                              </div>
                            </div>
                            <div className="flex items-center gap-x-2">
                              <MapPin strokeWidth={3} size={14} />
                              <div className="text-[12px]">
                                {bid?.supplier_address}
                              </div>
                            </div>
                            <div className="flex items-center gap-x-2">
                              <div className="text-[12px]">Rating</div>
                              <StarRating
                                rating={Number(bid?.avg_rating) || 0}
                              />
                            </div>
                          </div>
                          <div
                            className={`grid grid-cols-2 border-r w-full mt-2 py-2   `}
                          >
                            <button
                              // onClick={() => mutation.mutate()}
                              className="flex justify-around items-center border-l border-r"
                            >
                              <div
                                className={`${
                                  bid?.bid_status === "accepted" ||
                                  bid?.bid_status === "rejected" ||
                                  bid?.bid_status === "approved"
                                    ? "text-gray-300"
                                    : "text-green-500"
                                }`}
                              >
                                Accept
                              </div>
                            </button>
                            {/* <button className="flex justify-around text-red-500 items-center border-r border-l ">
                            Reject
                          </button> */}
                            <button
                              onClick={downloadPdf}
                              className="flex justify-around items-center"
                            >
                              Download
                            </button>
                          </div>
                        </TabsContent>
                        <TabsContent value="documents">
                          <div className="flex justify-center">
                            {Array.isArray(
                              parseArrayField(bid?.quotation_files)
                            ) && (
                              <div className="py-4">
                                {parseArrayField(bid?.quotation_files)?.length >
                                0 ? (
                                  parseArrayField(bid?.quotation_files)?.map(
                                    (file, index) => (
                                      <Link
                                        key={index}
                                        href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${file}`}
                                        target="_blank"
                                        className="text-blue-500"
                                      >
                                        View Documents
                                      </Link>
                                    )
                                  )
                                ) : (
                                  <div>No documents</div>
                                )}
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        <TabsContent value="request-details">
                          <div className="px-4 space-y-2 mb-2">
                            <div className="flex gap-x-2 font-medium items-center text-[14px]">
                              Pickup address:{" "}
                              <div className="font-normal dark:text-gray-200 text-[#373737]">
                                {quotation?.pickup_address}
                              </div>
                            </div>
                            <div className="flex gap-x-2 font-medium items-center text-[14px]">
                              Delivery address:{" "}
                              <div className="font-normal dark:text-gray-200 text-[#373737]">
                                {quotation?.delivery_address}
                              </div>
                            </div>
                            <div className="flex gap-x-2 font-medium items-center text-[14px]">
                              Move Type:{" "}
                              <div className="font-normal dark:text-gray-200 text-[#373737]">
                                {capitalizeWords(
                                  quotation?.quotation_type || ""
                                )}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </>
              )}
              {/* </Modal> */}
            </PopoverContent>
          </Popover>
        )}
      </TableCell>
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tCommon("dialog.deleteBid.title")}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {tCommon("dialog.deleteBid.description")}
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
              {tCommon("dialog.deleteBid.cancel")}
            </Button>
            <Button onClick={() => deleteBid(bid?.bid_id.toString() || "")}>
              {tCommon("dialog.deleteBid.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
