"use client";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { usePathname } from "next/navigation";

const MobileNav = () => {
  const t = useTranslations("common.navigation");
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(`/${locale}${path}`);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-64 bg-white shadow-lg z-50"
          >
            <div className="p-6">
              <div className="flex justify-end mb-6">
                <button
                  onClick={toggleMenu}
                  className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-4">
                <button
                  onClick={() => handleNavigation("/")}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {t("home")}
                </button>
                <button
                  onClick={() => handleNavigation("/about")}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {t("about")}
                </button>
                <button
                  onClick={() => handleNavigation("/services")}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {t("services")}
                </button>
                <button
                  onClick={() => handleNavigation("/cities")}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {t("cities")}
                </button>
                <button
                  onClick={() => handleNavigation("/moving-tips")}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {t("movingTips")}
                </button>
                <button
                  onClick={() => handleNavigation("/faq")}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {t("faq")}
                </button>
                <button
                  onClick={() => handleNavigation("/get-quote")}
                  className="block w-full text-left px-4 py-2 text-primary hover:text-primary/90 hover:bg-gray-50 rounded-lg transition-colors font-semibold"
                >
                  {t("getQuote")}
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileNav;
