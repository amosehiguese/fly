import * as z from "zod";
import { useTranslations } from "next-intl";

export const customerSignupSchema = z.object({
  fullname: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  gender: z.enum(["male", "female", "other"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const createMoverSignupSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z.object({
    company_name: z.string().min(1, t("validation.companyName")),
    contact_person: z.string().min(1, t("validation.contactPerson")),
    address: z.string().min(1, t("validation.address")),
    postal_code: z.string().min(1, t("validation.postalCode")),
    city: z.string().min(1, t("validation.city")),
    organization_number: z.string().min(1, t("validation.orgNumber")),
    started_year: z.string().min(1, t("validation.startedYear")),
    trucks: z.number().min(1, t("validation.trucks")),
    phone: z.string().min(1, t("validation.phone")),
    email: z.string().email(t("validation.email")),
    password: z.string().min(6, t("validation.password")),
    about_us: z.string().min(1, t("validation.aboutUs")),
    bank: z.string().min(1, t("validation.bankName")),
    account_number: z.string().min(1, t("validation.accountNumber")),
    iban: z.string().min(1, t("validation.iban")).optional(),
    swift_code: z.string().min(1, t("validation.swiftCode")).optional(),
    terms: z.literal(true, {
      errorMap: () => ({ message: t("validation.terms") }),
    }),
    documents: z
      .array(
        z.custom<File>((val) => val instanceof File, {
          message: t("validation.documents.invalidFile"),
        })
      )
      .min(2, t("validation.documents.required"))
      .max(3, t("validation.documents.maxFiles"))
      .refine(
        (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
        t("validation.documents.fileSize")
      ),
  });

export type CustomerSignup = z.infer<typeof customerSignupSchema>;
export type MoverSignup = z.infer<ReturnType<typeof createMoverSignupSchema>>;
