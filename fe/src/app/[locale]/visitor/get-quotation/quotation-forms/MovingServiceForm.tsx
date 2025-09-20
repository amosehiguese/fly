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
// import { MovingService, movingServiceSchema } from "../schema";
// import { UseMutationResult } from "@tanstack/react-query";
// import { LogisticsForm, ContactForm, FormWrapper } from "./BaseQuotationForm";
// import { QuotationSummary } from "../components/QuotationSummary";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import { FileUpload } from "@/components/ui/file-upload";
// import useVisitorServiceStore from "@/store/visitorServiceType";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// interface MovingServiceFormProps {
//   onSubmit: (data: MovingService) => void;
//   mutation: UseMutationResult<unknown, unknown, unknown>;
//   formStage: number;
//   handleNext: () => void;
// }

// const MovingDetailsForm = ({ form, handleNext }: any) => {
//   const handleClick = async () => {
//     const isValid = await form.trigger([
//       "volume_of_items",
//       "property_size",
//       "floor_details",
//       "list_of_larger_items",
//       "needs_packing",
//       "needs_dump_service",
//       "heavy_lifting_required",
//       "photos",
//     ]);
//     if (isValid) handleNext();
//   };

//   const largerItems = [
//     "Piano",
//     "Safe",
//     "Pool Table",
//     "Large Furniture",
//     "Appliances",
//     "Exercise Equipment",
//     "Art Pieces",
//     "Antiques",
//   ];

//   return (
//     <div className="flex flex-col gap-6">
//       <FormField
//         control={form.control}
//         name="volume_of_items"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Volume of Items</FormLabel>
//             <FormControl>
//               <Input
//                 type="number"
//                 {...field}
//                 onChange={(e) => {
//                   field.onChange(Number(e.target.value));
//                 }}
//                 placeholder="e.g., 500 cubic feet"
//               />
//             </FormControl>

//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       <FormField
//         control={form.control}
//         name="property_size"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Property Size (sq ft)</FormLabel>
//             <FormControl>
//               <Input
//                 {...field}
//                 placeholder="e.g., 1500"
//                 type="number"
//                 onChange={(e) => {
//                   field.onChange(Number(e.target.value));
//                 }}
//               />
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       <FormField
//         control={form.control}
//         name="floor_details"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Floor Details</FormLabel>
//             <FormControl>
//               <textarea
//                 {...field}
//                 className="w-full min-h-[100px] p-2 border rounded-md"
//                 placeholder="Describe floor access, elevator availability, stairs..."
//               />
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       <FormField
//         control={form.control}
//         name="list_of_larger_items"
//         render={() => (
//           <FormItem className="col-span-2">
//             <FormLabel>Larger Items to Move</FormLabel>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//               {largerItems.map((item) => (
//                 <FormField
//                   key={item}
//                   control={form.control}
//                   name="list_of_larger_items"
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
//         name="needs_packing"
//         render={({ field }) => (
//           <FormItem className="flex items-center space-x-2">
//             <FormControl>
//               <Checkbox
//                 checked={field.value === 1}
//                 onCheckedChange={(checked) => {
//                   field.onChange(checked ? 1 : 0);
//                 }}
//               />
//             </FormControl>
//             <FormLabel>Packing Service Required</FormLabel>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       <FormField
//         control={form.control}
//         name="needs_dump_service"
//         render={({ field }) => (
//           <FormItem className="flex items-center space-x-2">
//             <FormControl>
//               <Checkbox
//                 checked={field.value === 1}
//                 onCheckedChange={(checked) => {
//                   field.onChange(checked ? 1 : 0);
//                 }}
//               />
//             </FormControl>
//             <FormLabel>Dump Service Required</FormLabel>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       <FormField
//         control={form.control}
//         name="heavy_lifting_required"
//         render={({ field }) => (
//           <FormItem className="flex items-center space-x-2">
//             <FormControl>
//               <Checkbox
//                 checked={field.value === 1}
//                 onCheckedChange={(checked) => {
//                   field.onChange(checked ? 1 : 0);
//                 }}
//               />
//             </FormControl>
//             <FormLabel>Heavy Lifting Required</FormLabel>
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
//               understand your moving needs.
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

// const subTypes = {
//   "moving-service": [
//     { value: "local_move", label: "Local Move" },
//     { value: "long_distance_move", label: "Long Distance Move" },
//     { value: "moving_abroad", label: "Moving Abroad" },
//   ],
//   // Add other main types and their subtypes if needed
// };

// export const MovingServiceForm: React.FC<MovingServiceFormProps> = ({
//   onSubmit,
//   mutation,
//   formStage,
//   handleNext,
// }) => {
//   const { serviceType } = useVisitorServiceStore();
//   const subType = serviceType.split(",")[1];

//   const form = useForm<MovingService>({
//     resolver: zodResolver(movingServiceSchema),
//     defaultValues: {
//       first_name: "",
//       last_name: "",
//       from_city: "",
//       to_city: "",
//       date: "",
//       email: "",
//       phone: "",
//       type_of_service: subType,
//       volume_of_items: 0,
//       property_size: 0,
//       floor_details: "",
//       list_of_larger_items: [],
//       needs_packing: 0,
//       needs_dump_service: 0,
//       heavy_lifting_required: 0,
//       photos: [],
//     },
//   });

//   return (
//     <FormWrapper form={form} onSubmit={onSubmit}>
//       <FormField
//         control={form.control}
//         name="type_of_service"
//         render={({ field }) => (
//           <FormItem className="w-full space-y-0">
//             <FormLabel>Type of move</FormLabel>
//             <Select
//               onValueChange={(value) => field.onChange([value])}
//               defaultValue={field.value[0]}
//               value={field.value[0]}
//             >
//               <FormControl>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select a move type" />
//                 </SelectTrigger>
//               </FormControl>
//               <SelectContent>
//                 {subTypes["moving-service"].map((subtype) => (
//                   <SelectItem key={subtype.value} value={subtype.value}>
//                     {subtype.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//       {formStage === 1 ? (
//         <LogisticsForm form={form} handleNext={handleNext} />
//       ) : formStage === 2 ? (
//         <MovingDetailsForm form={form} handleNext={handleNext} />
//       ) : formStage === 3 ? (
//         <ContactForm form={form} handleNext={handleNext} />
//       ) : (
//         <QuotationSummary<MovingService>
//           formData={form.getValues()}
//           onSubmit={onSubmit}
//           isPending={mutation.isPending}
//         />
//       )}
//     </FormWrapper>
//   );
// };
