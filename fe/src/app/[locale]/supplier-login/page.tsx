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
import { useMutation } from "@tanstack/react-query";
import { supplierLogin } from "@/api/auth";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

const formSchema = z.object({
  identifier: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(4, {
    message: "Password must be at least 4 characters.",
  }),
});

export default function SupplierLoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth.supplierLogin");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "exclusiveadxe@gmail.com",
      password: "10434",
    },
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: supplierLogin,
    onSuccess: (data) => {
      toast.success("Login successful!");
      localStorage.setItem("token", data.token);
      router.push("/supplier/");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Login failed, please try again"
      );
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    login(values);
  }

  return (
    <div className="container flex h-screen items-center justify-center lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted md:p-10 text-white lg:flex dark:border-r overflow-hidden">
        <div className="absolute inset-0 p-8">
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <Image
              src={locale === "en" ? "/12-1.jpg" : "/13-1.jpg"}
              alt="Login background"
              fill
              priority
              className="object-contain rounded-lg "
              style={{ clipPath: "inset(0 0 0 0, round, 10px)" }}
            />
          </div>
        </div>

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
            <p className="text-lg">
              {t("joinMessage")}
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 w-full"
            >
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("emailLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        {...field}
                      />
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
                    <FormLabel>{t("passwordLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("passwordPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Link
                  href="/supplier-forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isPending}
              >
                {isPending ? t("signingIn") : t("signIn")}
              </Button>
            </form>
          </Form>

          <p className="px-8 text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link
              href="/supplier-signup"
              className="underline underline-offset-4 hover:text-primary"
            >
              {t("signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
