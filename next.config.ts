import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    // placeholder catalog art is SVG; all assets are first-party/trusted
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    remotePatterns: [
      // ready to swap local /public images for a CDN later
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
