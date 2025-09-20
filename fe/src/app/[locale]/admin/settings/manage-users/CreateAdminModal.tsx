"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GripVertical, Plus, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdmin } from "@/api/admin";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

const CreateAdminModal = () => {
  const [open, setOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const queryClient = useQueryClient();
  const t = useTranslations("admin.settings.userManagement.createAdmin");

  const formSchema = z.object({
    username: z.string().min(3, t("form.validation.username")),
    firstname: z.string().min(2, t("form.validation.firstName")),
    lastname: z.string().min(2, t("form.validation.lastName")),
    email: z.string().email(t("form.validation.email")),
    phone_number: z.string().min(10, t("form.validation.phone")),
    password: z.string().min(8, t("form.validation.password")),
    role: z.enum(["support_admin", "finance_admin", "super_admin"]),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      firstname: "",
      lastname: "",
      email: "",
      phone_number: "",
      password: "",
      role: "support_admin",
    },
  });

  const mutation = useMutation({
    mutationKey: ["create-admin"],
    mutationFn: (data: FormValues) => createAdmin(data),
    onSuccess: (data) => {
      toast.success(data.message || t("success"));
      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast.error(error.message || t("error"));
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <div>
      <Popover onOpenChange={() => setOpen(!open)} open={open}>
        <PopoverTrigger className="bg-blue-500 p-1 rounded-md">
          <Plus size={16} color="white" />
        </PopoverTrigger>
        <PopoverContent className="rounded-md p-0 w-[50vw] h-[400px] overflow-auto">
          <div className="bg-black px-2 items-center rounded-t-md text-white flex justify-between">
            <div className="flex items-center">
              <GripVertical size={20} />
              <div>{t("title")}</div>
            </div>
            <Button
              onClick={() => setOpen(false)}
              className="bg-transparent p-0 hover:bg-transparent hover:text-red-500"
            >
              <X />
            </Button>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-4 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.username")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.firstName")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.lastName")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>{t("form.email")}</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
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
                      <FormLabel>{t("form.phone")}</FormLabel>
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
                      <FormLabel>{t("form.password")}</FormLabel>
                      <FormControl>
                        <Input
                          type={isPasswordVisible ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-end space-x-2">
                <Label>{t("form.showPassword")}</Label>
                <input
                  type="checkbox"
                  checked={isPasswordVisible}
                  onChange={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="rounded-none"
                />
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.role")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("form.selectRole")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="support_admin">
                            {t("form.roles.supportAdmin")}
                          </SelectItem>
                          <SelectItem value="finance_admin">
                            {t("form.roles.financeAdmin")}
                          </SelectItem>
                          <SelectItem value="super_admin">
                            {t("form.roles.superAdmin")}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label className="text-base">
                  {t("form.permissions.title")}
                </Label>
                <div className="flex space-x-5">
                  {[
                    {
                      label: t("form.permissions.manageUser"),
                      name: "manageUser",
                    },
                    {
                      label: t("form.permissions.accessBids"),
                      name: "accessBids",
                    },
                    {
                      label: t("form.permissions.resolveDisputes"),
                      name: "resolveDisputes",
                    },
                    { label: t("form.permissions.viewLogs"), name: "viewLogs" },
                  ].map(({ label, name }) => {
                    const isChecked =
                      form.watch("role") === "finance_admin"
                        ? name === "accessBids" || name === "viewLogs"
                        : form.watch("role") === "support_admin"
                          ? name === "viewLogs" || name === "resolveDisputes"
                          : form.watch("role") === "super_admin"
                            ? name === "viewLogs" ||
                              name === "resolveDisputes" ||
                              name === "accessBids" ||
                              name === "manageUser"
                            : false;

                    return (
                      <FormItem
                        key={name}
                        className="flex items-center space-y-0 space-x-2"
                      >
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => null}
                          />
                        </FormControl>
                        <Label>{label}</Label>
                      </FormItem>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="submit"
                  className="px-8"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? t("form.saving") : t("form.save")}
                </Button>
                <Button
                  type="button"
                  onClick={() => setOpen(false)}
                  variant="outline"
                  className="border-red-500 text-red-500 px-8"
                >
                  {t("form.cancel")}
                </Button>
              </div>
            </form>
          </Form>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CreateAdminModal;
