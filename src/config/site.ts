export const siteConfig = {
  // Brand identity
  name: "Inspiring Furni",
  shortName: "Inspiring Furni",
  tagline: "Furnitur Kayu Jati Asli Jepara",
  description:
    "Workshop pengrajin furnitur kayu jati asli Jepara tanpa perantara. Spesialis meja makan, kursi, dipan, credenza, serta jendela dan pintu custom.",

  // Primary Domain (Used across SEO, Sitemap, Canonical URLs, and Robots)
  domain: "https://inspiringfurni.web.id",

  // Contact & Order transactions
  whatsappNumber: process.env.NEXT_PUBLIC_WA_NUMBER || "6289518906727",
  email: "inspiringfurni.id@gmail.com",

  // Physical Workshop / Store Address (Used in Schema.org JSON-LD & Contact page)
  address: {
    street: "Kecamatan Tahunan",
    city: "Jepara",
    province: "Jawa Tengah",
    postalCode: "59427",
    country: "ID",
    display: "Tahunan, Jepara, Jawa Tengah, Indonesia",
  },

  // Social Media Links
  socials: {
    instagram: "https://www.instagram.com/inspiringfurni",
    tiktok: "https://www.tiktok.com/@inspiringfurni",
    shopee: "https://shopee.co.id",
  },

  // Brand Media Assets
  logo: {
    light: "/images/logo/logo.png",
    dark: "/images/logo/logo-2.png",
    ogDefault: "/images/og-default.jpg",
  },
};

export type SiteConfig = typeof siteConfig;
