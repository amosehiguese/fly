// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import React from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   FormDescription,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Storage, storageSchema } from "../schema";
// import { UseMutationResult } from "@tanstack/react-query";
// import { Button } from "@/components/ui/button";
// import { useCustomerDashboard } from "@/hooks/customer/useCustomerDashboard";
// import { LogisticsForm, ContactForm, FormWrapper } from "./BaseQuotationForm";
// import { QuotationSummary } from "../components/QuotationSummary";
// import { FileUpload } from "@/components/ui/file-upload";
// import { useFormPersist } from "@/hooks/useFormPersist";

// interface StorageFormProps {
//   onSubmit: (data: Storage) => void;
//   mutation: UseMutationResult<unknown, unknown, unknown>;
//   formStage: number;
//   handleNext: () => void;
// }

// const StorageDetailsForm = ({ form, handleNext }: any) => {
//   const handleClick = async () => {
//     const isValid = await form.trigger([
//       "volume_of_items",
//       "storage_duration",
//       "type_of_items_to_store",
//       "photos",
//     ]);
//     if (isValid) handleNext();
//   };

//   const itemTypes = [
//     "Furniture",
//     "Electronics",
//     "Documents",
//     "Appliances",
//     "Personal Items",
//     "Office Equipment",
//   ];

//   return (
//     <div className="flex flex-col gap-6">
//       <FormField
//         control={form.control}
//         name="volume_of_items"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Volume of Items (cubic meters)</FormLabel>
//             <FormControl>
//               <Input {...field} placeholder="Enter volume of items" />
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       <FormField
//         control={form.control}
//         name="storage_duration"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Storage Duration (days)</FormLabel>
//             <FormControl>
//               <Input {...field} placeholder="e.g., 30, 60, 90" />
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       <FormField
//         control={form.control}
//         name="type_of_items_to_store"
//         render={() => (
//           <FormItem className="col-span-2">
//             <FormLabel>Types of Items to Store</FormLabel>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//               {itemTypes.map((item) => (
//                 <FormField
//                   key={item}
//                   control={form.control}
//                   name="type_of_items_to_store"
//                   render={({ field }) => (
//                     <FormItem className="flex items-center space-x-2">
//                       <FormControl>
//                         <Checkbox
//                           checked={field.value?.includes(item)}
//                           onCheckedChange={(checked) => {
//                             const updatedItems = checked
//                               ? [...field.value, item]
//                               : field.value?.filter((val: any) => val !== item);
//                             field.onChange(updatedItems);
//                           }}
//                         />
//                       </FormControl>
//                       <FormLabel className="text-sm font-normal">
//                         {item}
//                       </FormLabel>
//                     </FormItem>
//                   )}
//                 />
//               ))}
//             </div>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       <FormField
//         control={form.control}
//         name="photos"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Upload Photos (Optional)</FormLabel>
//             <FormControl>
//               <FileUpload
//                 selectedFiles={field.value || []}
//                 onFilesSelected={(files) => {
//                   const newFiles = [...(field.value || []), ...files];
//                   field.onChange(newFiles);
//                 }}
//                 onFileRemove={(index) => {
//                   const newFiles = [...(field.value || [])];
//                   newFiles.splice(index, 1);
//                   field.onChange(newFiles);
//                 }}
//               />
//             </FormControl>
//             <FormDescription>
//               Upload up to 5 photos (max 25MB total) to help us better
//               understand your storage needs.
//             </FormDescription>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       <div className="flex justify-center">
//         <Button onClick={handleClick} className="mt-8 px-16">
//           Next
//         </Button>
//       </div>
//     </div>
//   );
// };

// export const StorageForm: React.FC<StorageFormProps> = ({
//   onSubmit,
//   mutation,
//   formStage,
//   handleNext,
// }) => {
//   const { data: userDashboard } = useCustomerDashboard();
//   const form = useForm<Storage>({
//     resolver: zodResolver(storageSchema),
//     defaultValues: {
//       first_name: userDashboard?.user?.fullname?.split(" ")[0] || "",
//       last_name: userDashboard?.user?.fullname?.split(" ")[1] || "",
//       from_city: "",
//       to_city: "",
//       pickup_address: "",
//       delivery_address: "",
//       date: "",
//       latest_date: "",
//       email: userDashboard?.user?.email || "",
//       phone: userDashboard?.user?.phone_number || "",
//       type_of_service: "Storage",
//       volume_of_items: "",
//       storage_duration: "",
//       type_of_items_to_store: [],
//       photos: [] as File[],
//     },
//   });

//   useFormPersist(form, "storageForm", ["photos"]);

//   return (
//     <FormWrapper form={form} onSubmit={onSubmit}>
//       {formStage === 1 ? (
//         <LogisticsForm form={form} handleNext={handleNext} />
//       ) : formStage === 2 ? (
//         <StorageDetailsForm form={form} handleNext={handleNext} />
//       ) : formStage === 3 ? (
//         <ContactForm form={form} handleNext={handleNext} />
//       ) : (
//         <QuotationSummary
//           formData={form.getValues()}
//           onSubmit={onSubmit}
//           isPending={mutation.isPending}
//         />
//       )}
//     </FormWrapper>
//   );
// };
