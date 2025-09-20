// "use client";

// import { useState } from "react";
// import { ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { Input } from "@/components/ui/input";
// import SuccessModal from "@/components/ui/success-modal";
// import { useRouter } from "@/i18n/navigation";
// import { useParams, useSearchParams } from "next/navigation";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { SendBidRequest } from "@/api/interfaces/suppliers";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { sendBid } from "@/api/suppliers";
// import { useFetchQuotationById } from "@/hooks/supplier/useFetchQuotationById";
// import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

// const QuoteRequestPage = () => {
//   const router = useRouter();
//   const { id } = useParams();
//   const params = useSearchParams();
//   const quotation_type = params
//     .get("table_name")
//     ?.replace(" ", "_")
//     .toLocaleLowerCase();
//   console.log(id, quotation_type);
//   const { data: quotation, isLoading } = useFetchQuotationById(
//     id as string,
//     quotation_type as string
//   );
//   const [price, setPrice] = useState("");
//   const [file, setFile] = useState<File | null>(null);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [open, setOpen] = useState(false);
//   const [notes, setNotes] = useState("");
//   console.log(quotation);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files?.[0]) {
//       setFile(e.target.files[0]);
//     }
//   };

//   const queryClient = useQueryClient();
//   const { mutate: submitBid, isPending } = useMutation({
//     mutationFn: (data: SendBidRequest) => sendBid(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["supplier-dashboard"],
//       });
//       setOpen(false);
//       setShowSuccess(true);
//     },
//   });

//   const handleConfirmBid = async () => {
//     submitBid({
//       quotation_id: "12345", // Replace with actual ID from params/props
//       quotation_type: "moving", // Replace with actual type from data
//       bid_price: price,
//       additional_notes: notes,
//       file: file, // Make sure your SendBidRequest interface includes file
//     });
//   };

//   const handleSuccessClose = () => {
//     setShowSuccess(false);
//     router.push("/supplier");
//   };

//   if (isLoading) return <FullPageLoader />;

//   return (
//     <div className="container max-w-2xl mx-auto p-4 pb-32">
//       <div className="flex items-center mb-6">
//         <Link href="/supplier" className="mr-4">
//           <ArrowLeft className="h-6 w-6" />
//         </Link>
//         <h1 className="text-2xl font-semibold">Quote Request</h1>
//       </div>

//       <div className="space-y-6">
//         <InfoSection label="Request ID" value="#12345" />
//         <InfoSection label="From address" value="Bolagsvagen 4B, Malmo" />
//         <InfoSection label="To address" value="Stora vagen 48, Stockholm" />

//         <div className="pt-4">
//           <h2 className="text-xl font-semibold mb-4">Logistics Information</h2>
//           <div className="space-y-6">
//             <InfoSection label="Move type" value="Local move" />
//             <InfoSection label="Date" value="22/09/2024" />
//             <InfoSection label="Flexible date" value="+/- 14 days" />
//             <InfoSection
//               label="Describe your home"
//               value="Company relocation"
//             />
//             <InfoSection label="Expectations" value="Budget move" />
//             <InfoSection label="Status" value="Pensioner" />
//           </div>
//         </div>
//       </div>

//       <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
//         <div className="container max-w-2xl mx-auto flex gap-4">
//           <Button variant="outline" className="flex-1">
//             Cancel
//           </Button>
//           <Dialog open={open} onOpenChange={setOpen}>
//             <DialogTrigger asChild>
//               <Button className="flex-1 bg-red-600 hover:bg-red-700">
//                 Set Price
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[425px] ">
//               <DialogHeader>
//                 <DialogTitle>Set Price</DialogTitle>
//                 <DialogDescription>
//                   Add your price and upload invoice
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="grid gap-4 py-4 max-h-[75vh] overflow-y-auto">
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Add Price(SEK)</p>
//                   <Input
//                     type="number"
//                     value={price}
//                     onChange={(e) => setPrice(e.target.value)}
//                     placeholder="0"
//                   />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Total Price:</p>
//                   <p className="text-lg font-semibold">
//                     SEK {price ? parseInt(price).toLocaleString() : "0"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">
//                     Please upload invoice.
//                   </p>
//                   <Input
//                     type="file"
//                     onChange={handleFileChange}
//                     accept=".pdf,.doc,.docx"
//                   />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Additional Notes</p>
//                   <Input
//                     type="text"
//                     value={notes}
//                     onChange={(e) => setNotes(e.target.value)}
//                     placeholder="Add any additional information"
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <AlertDialog>
//                   <AlertDialogTrigger asChild>
//                     <Button
//                       className="bg-red-600 hover:bg-red-700"
//                       disabled={!price || !file}
//                     >
//                       Bid now
//                     </Button>
//                   </AlertDialogTrigger>
//                   <AlertDialogContent>
//                     <AlertDialogHeader>
//                       <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                       <AlertDialogDescription>
//                         A bid will be submitted for this quote.
//                       </AlertDialogDescription>
//                     </AlertDialogHeader>
//                     <AlertDialogFooter>
//                       <AlertDialogCancel>Cancel</AlertDialogCancel>
//                       <AlertDialogAction
//                         onClick={handleConfirmBid}
//                         disabled={isPending}
//                       >
//                         {isPending ? "Submitting..." : "Submit"}
//                       </AlertDialogAction>
//                     </AlertDialogFooter>
//                   </AlertDialogContent>
//                 </AlertDialog>
//                 <Button variant="outline" onClick={() => setOpen(false)}>
//                   Cancel
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       <SuccessModal
//         isOpen={showSuccess}
//         buttonText="Go to Dashboard"
//         onButtonClick={handleSuccessClose}
//         title="Bid Submitted Successfully"
//         description="Your bid has been submitted successfully. You will be notified when there's an update."
//       />
//     </div>
//   );
// };

// const InfoSection = ({ label, value }: { label: string; value: string }) => {
//   return (
//     <div>
//       <p className="text-gray-500 text-sm mb-1">{label}</p>
//       <p className="text-gray-900 text-lg">{value}</p>
//     </div>
//   );
// };

// export default QuoteRequestPage;
