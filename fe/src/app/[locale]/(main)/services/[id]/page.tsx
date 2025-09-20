import type { Metadata } from "next";
import ServicePage from "./client";

// SEO Metadata lookup table
const metadataByService: Record<
  string,
  {
    title: { sv: string; en: string };
    description: { sv: string; en: string };
  }
> = {
  "local-moving": {
    title: {
      sv: "Din pålitliga flyttpartner för Lokala Flyttar | Flyttman",
      en: "Your Reliable Moving Partner for Local Moves | Flyttman",
    },
    description: {
      sv: "Flyttman erbjuder smidiga och trygga lokala flyttjänster. Med erfaren personal och fokus på kvalitet gör vi din flytt enkel och stressfri.",
      en: "Flyttman offers smooth and secure local moving services. With experienced staff and a focus on quality, we make your move simple and stress-free.",
    },
  },
  "long-distance-move": {
    title: {
      sv: "Din pålitliga flyttpartner för Långdistansflytt | Flyttman",
      en: "Your Reliable Moving Partner for Long Distance Moves | Flyttman",
    },
    description: {
      sv: "Flyttman erbjuder trygg och professionell hjälp vid långdistansflytt. Med erfaren personal och smidiga lösningar ser vi till att din flytt sker utan stress.",
      en: "Flyttman offers secure and professional help with long-distance moves. With experienced staff and smooth solutions, we ensure your move happens without stress.",
    },
  },
  "moving-abroad": {
    title: {
      sv: "Specialist på Internationella flyttar inom Norden | Flyttman",
      en: "Specialist in International Moves within the Nordic Countries | Flyttman",
    },
    description: {
      sv: "Flyttman är expert på internationella flyttar inom Norden. Vi erbjuder trygg och smidig flytthjälp mellan Sverige, Norge, Danmark och Finland.",
      en: "Flyttman is an expert in international moves within the Nordic region. We offer secure and smooth moving assistance between Sweden, Norway, Denmark and Finland.",
    },
  },
  "move-out-cleaning": {
    title: {
      sv: "Pålitlig partner för flyttstädning | Flyttman",
      en: "Reliable Partner for Move-Out Cleaning | Flyttman",
    },
    description: {
      sv: "Sök inte längre – Flyttman är din pålitliga partner för professionell flyttstädning. Vi garanterar skinande rent hem inför besiktning och inflyttning.",
      en: "Look no further – Flyttman is your reliable partner for professional move-out cleaning. We guarantee a sparkling clean home for inspection and move-in.",
    },
  },
  storage: {
    title: {
      sv: "Pålitlig Partner för Magasin & Förvaringslösningar – Flyttman",
      en: "Reliable Partner for Storage Solutions – Flyttman",
    },
    description: {
      sv: "Flyttman är din pålitliga partner för smarta Magasin och förvaringslösningar. Vi erbjuder professionell service för en smidig och bekymmersfri Magasinering vid flytt",
      en: "Flyttman is your reliable partner for smart storage solutions. We offer professional service for smooth and worry-free storage during your move.",
    },
  },
  "heavy-lifting": {
    title: {
      sv: "Professionell tunglyft – Piano, Kassaskåp & Flygel | Flyttman",
      en: "Professional Heavy Lifting – Piano, Safe & Grand Piano | Flyttman",
    },
    description: {
      sv: "Flyttman erbjuder säker och erfaren tunglyft av piano, kassaskåp och flygel. Vi hanterar tunga lyft med rätt utrustning och kunnig personal.",
      en: "Flyttman offers safe and experienced heavy lifting of pianos, safes and grand pianos. We handle heavy lifting with the right equipment and knowledgeable staff.",
    },
  },
  "carrying-assistance": {
    title: {
      sv: "Pålitlig bärhjälp med Flyttman – Din trygga partner vid flytt",
      en: "Reliable Carrying Assistance with Flyttman – Your Secure Partner when Moving",
    },
    description: {
      sv: "Letar du efter en pålitlig bärhjälp vid flyttning? Flyttman erbjuder professionell och trygg flyttservice för både privatpersoner och företag.",
      en: "Looking for reliable carrying assistance when moving? Flyttman offers professional and secure moving services for both individuals and businesses.",
    },
  },
  "junk-removal": {
    title: {
      sv: "Pålitlig och prisvärd Skräp- och Avfallshantering – Flyttman",
      en: "Reliable and Affordable Junk and Waste Management – Flyttman",
    },
    description: {
      sv: "Flyttman erbjuder professionell och smidig bortforsling av skräp. Vi är din pålitliga partner för avfallshantering med snabb service och miljövänliga lösningar.",
      en: "Flyttman offers professional and smooth removal of junk. We are your reliable partner for waste management with fast service and environmentally friendly solutions.",
    },
  },
  "estate-clearance": {
    title: {
      sv: "Utför dödsbostömning med omtanke hos Flyttman",
      en: "Estate Clearance with Care at Flyttman",
    },
    description: {
      sv: "Flyttman erbjuder trygg och respektfull dösbostömning för hem, dödsbon. Vi hanterar allt med omsorg – från sortering till bortforsling.",
      en: "Flyttman offers secure and respectful estate clearance for homes and estates. We handle everything with care – from sorting to removal.",
    },
  },
  "evacuation-move": {
    title: {
      sv: "Pålitlig flyttpartner för evakuringsflytt – Flyttman",
      en: "Reliable Moving Partner for Evacuation Moves – Flyttman",
    },
    description: {
      sv: "Flyttman erbjuder snabb och säker evakueringsflytt med fokus på trygghet och effektivitet. Din pålitliga partner vid akuta flyttbehov – tillgängliga dygnet runt.",
      en: "Flyttman offers fast and secure evacuation moves with a focus on safety and efficiency. Your reliable partner for urgent moving needs – available 24/7.",
    },
  },
  "privacy-move": {
    title: {
      sv: "Pålitlig flyttpartner för Sekretessflyttar | Flyttman",
      en: "Reliable Moving Partner for Privacy Moves | Flyttman",
    },
    description: {
      sv: "Flyttman är din trygga partner vid sekretessbelagda flyttar. Vi hanterar varje uppdrag med diskretion, säkerhet och professionalism. Kontakta oss för en säker flyttlösning.",
      en: "Flyttman is your secure partner for confidential moves. We handle each assignment with discretion, security, and professionalism. Contact us for a secure moving solution.",
    },
  },
};

// Dynamic metadata generation
export async function generateMetadata({
  params,
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const { locale, id } = params;

  // Get metadata from our lookup table
  const serviceMetadata = metadataByService[id];

  // If we have metadata for this service
  if (serviceMetadata) {
    return {
      title:
        serviceMetadata.title[locale as "sv" | "en"] ||
        serviceMetadata.title.en,
      description:
        serviceMetadata.description[locale as "sv" | "en"] ||
        serviceMetadata.description.en,
    };
  }

  // Fallback metadata if service not found
  if (locale === "sv") {
    return {
      title: `Flytttjänster | Flyttman`,
      description: `Flyttman erbjuder ett brett utbud av professionella flytttjänster för dina behov.`,
    };
  }

  return {
    title: `Moving Services | Flyttman`,
    description: `Flyttman offers a wide range of professional moving services for your needs.`,
  };
}

function Page() {
  return <ServicePage />;
}

export default Page;
