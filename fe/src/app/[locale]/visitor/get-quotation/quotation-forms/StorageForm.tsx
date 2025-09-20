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
// import { LogisticsForm, ContactForm, FormWrapper } from "./BaseQuotationForm";
// import { QuotationSummary } from "../components/QuotationSummary";
// import { FileUpload } from "@/components/ui/file-upload";
// import { useTranslations } from "next-intl";

// interface StorageFormProps {
//   onSubmit: (data: Storage) => void;
//   mutation: UseMutationResult<unknown, unknown, unknown>;
//   formStage: number;
//   handleNext: () => void;
// }

// const StorageDetailsForm = ({ form, handleNext }: any) => {
//   const t = useTranslations("quotation.storage");

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
//     { value: "Furniture", label: t("itemTypes.furniture") },
//     { value: "Electronics", label: t("itemTypes.electronics") },
//     { value: "Documents", label: t("itemTypes.documents") },
//     { value: "Appliances", label: t("itemTypes.appliances") },
//     { value: "Personal Items", label: t("itemTypes.personalItems") },
//     { value: "Office Equipment", label: t("itemTypes.officeEquipment") },
//   ];

//   return (
//     <div className="flex flex-col gap-6">
//       <FormField
//         control={form.control}
//         name="volume_of_items"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>{t("volumeOfItems")}</FormLabel>
//             <FormControl>
//               <Input {...field} placeholder={t("enterVolumeOfItems")} />
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
//             <FormLabel>{t("storageDuration")}</FormLabel>
//             <FormControl>
//               <Input
//                 {...field}
//                 onChange={(e) => {
//                   field.onChange(Number(e.target.value));
//                 }}
//                 type="number"
//                 placeholder={t("durationPlaceholder")}
//               />
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
//             <FormLabel>{t("typesOfItems")}</FormLabel>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//               {itemTypes.map((item) => (
//                 <FormField
//                   key={item.value}
//                   control={form.control}
//                   name="type_of_items_to_store"
//                   render={({ field }) => (
//                     <FormItem className="flex items-center space-x-2">
//                       <FormControl>
//                         <Checkbox
//                           checked={field.value?.includes(item.value)}
//                           onCheckedChange={(checked) => {
//                             const updatedItems = checked
//                               ? [...field.value, item.value]
//                               : field.value?.filter(
//                                   (val: any) => val !== item.value
//                                 );
//                             field.onChange(updatedItems);
//                           }}
//                         />
//                       </FormControl>
//                       <FormLabel className="text-sm font-normal">
//                         {item.label}
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
//             <FormLabel>{t("photos")}</FormLabel>
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
//             <FormDescription>{t("photosDescription")}</FormDescription>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       <div className="flex justify-center">
//         <Button onClick={handleClick} className="mt-8 px-16">
//           {t("common.next")}
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
//   const form = useForm<Storage>({
//     resolver: zodResolver(storageSchema),
//     defaultValues: {
//       from_city: "",
//       to_city: "",
//       move_date: "",
//       email_address: "",
//       phone_number: "",
//       type_of_service: ["Storage"],
//       volume_of_items: "",
//       storage_duration: "",
//       type_of_items_to_store: [],
//       photos: [] as File[],
//     },
//   });

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
