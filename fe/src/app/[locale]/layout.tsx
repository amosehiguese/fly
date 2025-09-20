import type { Metadata } from "next";
import { Urbanist, Livvic } from "next/font/google";
import "../globals.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { QueryClientCustomProvider } from "@/QueryClientCustomProvider";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { hasLocale, Locale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Script from "next/script";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  display: "swap",
});

const livvic = Livvic({
  variable: "--font-livvic",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: { locale: Promise<Locale> | Locale };
}): Promise<Metadata> {
  const locale = await Promise.resolve(params.locale);
  // console.log("locale", locale);

  const t = await getTranslations({
    locale,
    namespace: "metadata",
  });

  return {
    title: "Flyttman",
    description: t("description"),
    icons: {
      icon: "/favicon.png",
    },
    verification: {
      google: "dql7QmlEkHkPjxD_QeDCKaxV1AQr0VGf82Op9B6rvR4",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Load messages for the current locale
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <body
        className={`${livvic.variable} ${urbanist.variable} font-livvic antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NXZ9CJTF"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NXZ9CJTF');
          `}
        </Script>

        {/* Google Ads (AdWords) Tracking */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17211694857"
          strategy="afterInteractive"
        />
        <Script id="google-adwords" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17211694857');
          `}
        </Script>

        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryClientCustomProvider>
            <div>{children}</div>
            <SonnerToaster position="top-right" />
          </QueryClientCustomProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
