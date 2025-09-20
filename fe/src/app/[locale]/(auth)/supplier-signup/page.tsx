"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MoverSignup, createMoverSignupSchema } from "./schema";
import { useMoverSignup } from "@/hooks/useSignup";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("auth.supplierSignup");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const MAX_FILES = 3;

  const form = useForm<MoverSignup>({
    resolver: zodResolver(createMoverSignupSchema(t)),
    defaultValues: {
      company_name: "",
      contact_person: "",
      address: "",
      postal_code: "",
      city: "",
      organization_number: "",
      started_year: "",
      trucks: 1,
      phone: "",
      email: "",
      password: "",
      about_us: "",
      bank: "",
      account_number: "",
      iban: "",
      swift_code: "",
      terms: undefined,
      documents: [],
    },
  });

  const mutation = useMoverSignup();

  const onSubmit = (data: MoverSignup) => {
    mutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        form.setError("documents", {
          message: "File size exceeds 5MB limit",
        });
        return;
      }

      // Check max number of files
      if (uploadedFiles.length >= MAX_FILES) {
        form.setError("documents", {
          message: "Maximum 3 files allowed",
        });
        return;
      }

      // Add file to state and form
      const newFiles = [...uploadedFiles, file];
      setUploadedFiles(newFiles);
      form.setValue("documents", newFiles);
      form.clearErrors("documents");
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    form.setValue("documents", newFiles);
  };

  return (
    <div className="min-h-screen bg-[url('/1.jpg')] bg-cover bg-center bg-fixed bg-no-repeat">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-lg my-8">
          <h2 className="text-2xl font-bold text-center mb-6">{t("title")}</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Company Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {t("companyDetails.title")}
                </h3>

                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("companyDetails.labels.companyName")}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("companyDetails.labels.contactPerson")}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("companyDetails.labels.address")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("companyDetails.labels.city")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("companyDetails.labels.postalCode")}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("companyDetails.labels.email")}</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("companyDetails.labels.phone")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("companyDetails.labels.password")}</FormLabel>
                      <FormControl>
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="organization_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("companyDetails.labels.orgNumber")}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="started_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("companyDetails.labels.startedYear")}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="trucks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("companyDetails.labels.trucks")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="about_us"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("companyDetails.labels.aboutUs")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Documents Upload */}
                <FormField
                  control={form.control}
                  name="documents"
                  render={() => (
                    <FormItem>
                      <FormLabel>{t("companyDetails.documents.title")}</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 border border-input rounded-md p-2 bg-background">
                            <Input
                              type="file"
                              id="documents"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={handleFileChange}
                              disabled={uploadedFiles.length >= MAX_FILES}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                document.getElementById("documents")?.click()
                              }
                              className="cursor-pointer"
                              disabled={uploadedFiles.length >= MAX_FILES}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {t("companyDetails.documents.upload")}
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              {uploadedFiles.length === 0
                                ? t("companyDetails.documents.noFiles")
                                : t("companyDetails.documents.fileCount", {
                                    count: uploadedFiles.length,
                                    max: MAX_FILES,
                                  })}
                            </span>
                          </div>

                          {uploadedFiles.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {uploadedFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-slate-50 p-2 rounded-md"
                                >
                                  <span className="text-sm truncate max-w-[80%]">
                                    {file.name}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground">
                            {t("companyDetails.documents.helperText")}
                          </p>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Bank Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {t("bankDetails.title")}
                </h3>

                <FormField
                  control={form.control}
                  name="bank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("bankDetails.labels.bankName")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("bankDetails.labels.accountNumber")}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("bankDetails.labels.iban")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="swift_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("bankDetails.labels.swiftCode")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t("terms.agree")}{" "}
                        <Link
                          href="/terms-conditions/suppliers"
                          className="text-blue-600 hover:underline"
                        >
                          {t("terms.termsLink")}
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t("buttons.registering")}
                  </>
                ) : (
                  t("buttons.register")
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-4 text-center text-sm text-gray-600">
            {t("haveAccount")}{" "}
            <Link href="/supplier-login" className="text-blue-600 hover:underline">
              {t("signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}