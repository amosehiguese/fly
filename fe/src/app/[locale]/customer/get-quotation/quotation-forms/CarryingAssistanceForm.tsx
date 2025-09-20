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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { CarryingAssistance, carryingAssistanceSchema } from "../schema";
// import { UseMutationResult } from "@tanstack/react-query";
// import { Button } from "@/components/ui/button";
// import { useCustomerDashboard } from "@/hooks/customer/useCustomerDashboard";
// import { LogisticsForm, ContactForm, FormWrapper } from "./BaseQuotationForm";
// import { QuotationSummary } from "../components/QuotationSummary";
// import { FileUpload } from "@/components/ui/file-upload";
// import { useFormPersist } from "@/hooks/useFormPersist";

// interface CarryingAssistanceFormProps {
//   onSubmit: (data: CarryingAssistance) => void;
//   mutation: UseMutationResult<unknown, unknown, unknown>;
//   formStage: number;
//   handleNext: () => void;
// }

// const CarryingDetailsForm = ({ form, handleNext }: any) => {
//   const handleClick = async () => {
//     const isValid = await form.trigger([
//       "type_of_items_to_carry",
//       "standard_or_heavy",
//       "describe_carrying",
//       // "number_of_floors",
//       // "elevator_available",
//       // "estimated_duration",
//       "photos",
//     ]);
//     if (isValid) handleNext();
//   };

//   const itemTypes = [
//     "Boxes",
//     "Furniture",
//     "Appliances",
//     "Electronics",
//     "Personal Items",
//     "Office Equipment",
//   ];

//   return (
//     <div className="flex flex-col gap-6">
//       <FormField
//         control={form.control}
//         name="type_of_items_to_carry"
//         render={() => (
//           <FormItem className="col-span-2">
//             <FormLabel>Types of Items to Carry</FormLabel>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//               {itemTypes.map((item) => (
//                 <FormField
//                   key={item}
//                   control={form.control}
//                   name="type_of_items_to_carry"
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
//         name="standard_or_heavy"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Weight Category</FormLabel>
//             <Select onValueChange={field.onChange} defaultValue={field.value}>
//               <FormControl>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select weight category" />
//                 </SelectTrigger>
//               </FormControl>
//               <SelectContent>
//                 <SelectItem value="Standard">Standard</SelectItem>
//                 <SelectItem value="Heavy">Heavy</SelectItem>
//               </SelectContent>
//             </Select>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       {/* <FormField
//         control={form.control}
//         name="number_of_floors"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Number of Floors</FormLabel>
//             <FormControl>
//               <Input
//                 type="number"
//                 {...field}
//                 onChange={(e) => field.onChange(parseInt(e.target.value))}
//                 min={0}
//               />
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       /> */}

//       {/* <FormField
//         control={form.control}
//         name="elevator_available"
//         render={({ field }) => (
//           <FormItem className="flex items-center space-x-2">
//             <FormControl>
//               <Checkbox
//                 checked={field.value}
//                 onCheckedChange={field.onChange}
//               />
//             </FormControl>
//             <FormLabel>Elevator Available</FormLabel>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       <FormField
//         control={form.control}
//         name="estimated_duration"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Estimated Duration</FormLabel>
//             <FormControl>
//               <Input {...field} placeholder="e.g., 2 hours, half day" />
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       /> */}

//       <FormField
//         control={form.control}
//         name="describe_carrying"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Additional Details</FormLabel>
//             <FormControl>
//               <textarea
//                 {...field}
//                 className="w-full min-h-[100px] p-2 border rounded-md"
//                 placeholder="Describe any specific requirements or challenges..."
//               />
//             </FormControl>
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
//               understand your carrying assistance needs.
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

// export const CarryingAssistanceForm: React.FC<CarryingAssistanceFormProps> = ({
//   onSubmit,
//   mutation,
//   formStage,
//   handleNext,
// }) => {
//   const { data: userDashboard } = useCustomerDashboard();
//   const form = useForm<CarryingAssistance>({
//     resolver: zodResolver(carryingAssistanceSchema),
//     defaultValues: {
//       first_name: userDashboard?.user?.fullname?.split(" ")[0],
//       last_name: userDashboard?.user?.fullname?.split(" ")[1],
//       from_city: "",
//       to_city: "",
//       move_date: "",
//       email_address: userDashboard?.user?.email,
//       phone_number: userDashboard?.user?.phone_number,
//       type_of_service: ["Carrying Assistance"],
//       type_of_items_to_carry: [],
//       standard_or_heavy: "Standard",
//       describe_carrying: "",
//       // number_of_floors: 0,
//       // elevator_available: false,
//       // estimated_duration: "",
//       photos: [] as File[],
//     },
//   });

//   useFormPersist(form, "carryingAssistanceForm", ["photos"]);

//   return (
//     <FormWrapper form={form} onSubmit={onSubmit}>
//       {formStage === 1 ? (
//         <LogisticsForm form={form} handleNext={handleNext} />
//       ) : formStage === 2 ? (
//         <CarryingDetailsForm form={form} handleNext={handleNext} />
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
