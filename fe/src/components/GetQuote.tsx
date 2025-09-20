"use client";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  fromAddress: string;
  toAddress: string;
  moveDate: string;
  serviceType: string;
  message: string;
}

const GetQuote = () => {
  const t = useTranslations("getQuote");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    fromAddress: "",
    toAddress: "",
    moveDate: "",
    serviceType: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Here you would typically send the form data to your API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        fromAddress: "",
        toAddress: "",
        moveDate: "",
        serviceType: "",
        message: "",
      });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-20 2xl:py-24 4xl:py-32 px-6 md:px-16 max-w-[1280px] mx-auto"
    >
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6">
        {t("title")}
      </h2>
      <p className="text-gray-600 text-lg md:text-xl text-center mb-8 max-w-2xl">
        {t("description")}
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("form.name")}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("form.email")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("form.phone")}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="serviceType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("form.serviceType")}
            </label>
            <select
              id="serviceType"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">{t("form.selectService")}</option>
              {t.raw("form.services").map((service: string, index: number) => (
                <option key={index} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="fromAddress"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("form.fromAddress")}
            </label>
            <input
              type="text"
              id="fromAddress"
              name="fromAddress"
              value={formData.fromAddress}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="toAddress"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("form.toAddress")}
            </label>
            <input
              type="text"
              id="toAddress"
              name="toAddress"
              value={formData.toAddress}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="moveDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("form.moveDate")}
            </label>
            <input
              type="date"
              id="moveDate"
              name="moveDate"
              value={formData.moveDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("form.message")}
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t("form.submitting") : t("form.submit")}
          </button>
        </div>
        {submitStatus === "success" && (
          <p className="text-green-600 text-center">{t("form.success")}</p>
        )}
        {submitStatus === "error" && (
          <p className="text-red-600 text-center">{t("form.error")}</p>
        )}
      </form>
    </motion.div>
  );
};

export default GetQuote;
