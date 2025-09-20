import enMessages from '../messages/en.json';
import svMessages from '../messages/sv.json';
import type { Locale } from '../i18n';

// A simple slugify function, consider a more robust one for production
const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\\s+/g, '-') // Replace spaces with -
    .replace(/[åä]/g, 'a') // Replace Swedish characters å, ä with a
    .replace(/ö/g, 'o')   // Replace Swedish character ö with o
    .replace(/[^\w-]+/g, '') // Remove all non-word chars except hyphen
    .replace(/--+/g, '-'); // Replace multiple hyphens with single hyphen
};

export interface Service {
  canonicalSlug: string; // e.g., "privacy-move"
  title: Record<Locale, string>;   // e.g., { en: "Privacy Move", sv: "Sekretessflytt" }
  slug: Record<Locale, string>;    // e.g., { en: "privacy-move", sv: "sekretessflytt" }
  // href for direct use in Link component, constructed with localized path and slug
  localizedHref: Record<Locale, string>; 
}

// Type assertion for message structure (optional but good for safety)
interface MessageService {
  title: string;
  href: string;
}

const typedEnServices = enMessages.services as MessageService[];
const typedSvServices = svMessages.services as MessageService[];

export const servicesData: Service[] = typedEnServices.map((enServiceItem) => {
  // Find corresponding Swedish service. Assuming href is the unique key for mapping.
  const svServiceItem = typedSvServices.find(sv => sv.href === enServiceItem.href);

  if (!svServiceItem) {
    console.warn(`No Swedish translation found for service with href: ${enServiceItem.href}`);
    // Fallback or skip: For now, let's skip if no direct match, or you can decide to fallback to English.
    // This might happen if your en.json and sv.json services are not perfectly aligned by href.
    // To ensure robustness, it's better if they are sourced from a single data structure or CMS.
    return null; 
  }

  const canonicalSlugFromHref = enServiceItem.href
    .replace(/^\\/services\\//, '') // Remove "/services/" prefix
    .replace(/\\/$/, ''); // Remove trailing slash

  if (!canonicalSlugFromHref) {
    console.warn(`Could not determine canonical slug for EN service: ${enServiceItem.title} with href: ${enServiceItem.href}`);
    return null;
  }
  
  const enSlug = canonicalSlugFromHref; // English slug is taken directly from the href
  const svSlug = slugify(svServiceItem.title); // Swedish slug is the slugified Swedish title

  return {
    canonicalSlug: canonicalSlugFromHref,
    title: {
      en: enServiceItem.title,
      sv: svServiceItem.title,
    },
    slug: {
      en: enSlug,
      sv: svSlug,
    },
    localizedHref: { // For direct use if you prefer constructing hrefs this way
      en: `/services/${enSlug}`,
      sv: `/tjanster/${svSlug}`,
    }
  };
}).filter(Boolean) as Service[]; // Filter out any nulls if services couldn't be mapped

// Create a map for easy lookup of a service by its localized slug (any language)
export const serviceByLocalizedSlug = new Map<string, Service>();
servicesData.forEach(service => {
  if (service.slug.en) serviceByLocalizedSlug.set(service.slug.en, service);
  if (service.slug.sv) serviceByLocalizedSlug.set(service.slug.sv, service);
});

// Example function to get a service by its canonical slug
export const getServiceByCanonicalSlug = (canonicalSlug: string): Service | undefined => {
  return servicesData.find(service => service.canonicalSlug === canonicalSlug);
};
