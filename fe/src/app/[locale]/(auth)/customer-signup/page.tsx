"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { useCustomerSignup } from "@/hooks/auth/useCustomerSignup";
import { handleMutationError } from "@/api";
import Image from "next/image";
import { PasswordInput } from "@/components/PasswordInput";
import { useLocale, useTranslations } from "next-intl";

export default function CustomerSignUp() {
  const router = useRouter();
  const t = useTranslations("auth.customerSignup");
  const { mutate: signup, isPending } = useCustomerSignup();
  const locale = useLocale();

  const formSchema = z.object({
    email: z.string().email(t("validation.email")),
    password: z.string().min(6, t("validation.password")),
    fullname: z.string().min(2, t("validation.fullName")),
    phone_number: z.string().min(10, t("validation.phoneNumber")),
    gender: z.enum(["male", "female", "other"]),
    order_pin: z.string().length(4, t("validation.orderPin")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      fullname: "",
      phone_number: "",
      gender: "male",
      order_pin: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // @ts-expect-error - Temporarily ignoring type mismatch for now
    signup(values, {
      onSuccess: () => {
        toast.success(t("success"));
        router.push("/login");
      },
      onError: (error) => handleMutationError(error, locale),
    });
  };

  return (
    <div className="container flex h-screen items-center justify-center lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted md:p-10 text-white lg:flex dark:border-r overflow-hidden">
        <div className="absolute inset-0 p-8">
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <Image
              src={locale === "en" ? "/12-1.jpg" : "/13-1.jpg"}
              alt="Signup background"
              fill
              priority
              className="object-contain rounded-lg "
              style={{ clipPath: "inset(0 0 0 0, round, 10px)" }}
            />
          </div>
        </div>
        {/* Semi-transparent overlay for better text readability */}
        {/* <div className="absolute inset-0 bg-black/30 z-10"></div> */}

        <Link
          href="/"
          className="relative z-30 flex items-center text-lg font-medium"
        >
          <Image
            src="/logo.png"
            alt="Logo"
            className="h-10"
            width={100}
            height={100}
          />
        </Link>

        <div className="relative z-30 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">{t("joinMessage")}</p>
          </blockquote>
        </div>
      </div>
      <div className="flex items-center justify-center lg:p-8 max-h-screen overflow-y-auto py-10">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 md:w-[80%] 3xl:w-[50%] 4xl:w-[30%]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 4xl:space-y-6"
            >
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("labels.fullName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("placeholders.fullName")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("labels.email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("placeholders.email")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("labels.phoneNumber")}</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder={t("placeholders.phoneNumber")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("labels.gender")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("placeholders.gender")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">
                          {t("genderOptions.male")}
                        </SelectItem>
                        <SelectItem value="female">
                          {t("genderOptions.female")}
                        </SelectItem>
                        <SelectItem value="other">
                          {t("genderOptions.other")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("labels.password")}</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order_pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("labels.orderPin")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        maxLength={4}
                        placeholder={t("placeholders.orderPin")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? t("buttons.creating") : t("buttons.create")}
              </Button>
            </form>
          </Form>

          <p className="px-8 text-center text-sm text-muted-foreground">
            {t("haveAccount")}{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              {t("signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
