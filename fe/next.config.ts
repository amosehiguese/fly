import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["192.168.0.102", "localhost", "api.flyttman.se"],
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    cpus: 1,
    // createMessagesDeclaration: "./src/messages/en.json",
  },
  async rewrites() {
    return [
      // Specific page rewrites
      {
        source: "/sv/tjanster/lokalt-flytt",
        destination: "/sv/services/local-moving/",
      },
      {
        source: "/sv/tjanster/langdistansflytt",
        destination: "/sv/services/long-distance-move/",
      },
      {
        source: "/sv/tjanster/utlandsflytt",
        destination: "/sv/services/moving-abroad",
      },
      {
        source: "/sv/tjanster/foretagsflytt",
        destination: "/sv/services/company-relocation/",
      },
      {
        source: "/sv/tjanster/flyttstadning",
        destination: "/sv/services/move-out-cleaning/",
      },
      {
        source: "/sv/tjanster/magasin",
        destination: "/sv/services/storage/",
      },
      {
        source: "/sv/tjanster/tungflytt",
        destination: "/sv/services/heavy-lifting/",
      },
      {
        source: "/sv/tjanster/barhjalp",
        destination: "/sv/services/carrying-assistance/",
      },
      {
        source: "/sv/tjanster/avfallshantering",
        destination: "/sv/services/junk-removal/",
      },
      {
        source: "/sv/tjanster/dodsbotomning",
        destination: "/sv/services/estate-clearance/",
      },
      {
        source: "/sv/tjanster/evakueringsflytt",
        destination: "/sv/services/evacuation-move/",
      },
      {
        source: "/sv/tjanster/sekretessflytt",
        destination: "/sv/services/privacy-move/",
      },

      // Swedish URLs - general patterns
      {
        source: "/sv/tjanster/:slug",
        destination: "/sv/services/:slug",
      },
      {
        source: "/sv/stader",
        destination: "/sv/cities",
      },
      {
        source: "/en/stader",
        destination: "/en/cities",
      },

      {
        source: "/sv/stader/:city",
        destination: "/sv/cities/:city",
      },
      // English URLs remain as they are
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
