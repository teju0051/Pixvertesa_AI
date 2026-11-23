import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-jakarta",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pixvertesa.znxios.com";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Pixvertesa   AI Image Detector & EXIF Forensics | Znxios International",
    template: "%s | Pixvertesa by Znxios",
  },
  description:
    "Instantly check if an image is real or AI-generated with 99.98% accuracy. Detect Midjourney, DALL-E 3, Flux, and Stable Diffusion with EXIF inspection, CSV reports, and zero image storage.",
  keywords: [
    "AI image detector",
    "check if image is AI generated",
    "AI photo checker",
    "Midjourney detector",
    "DALL-E 3 detector",
    "Flux AI image detector",
    "Stable Diffusion detector",
    "deepfake image checker",
    "EXIF metadata forensic tool",
    "real vs AI image verifier",
    "Znxios International",
    "Pixvertesa",
  ],
  authors: [{ name: "Znxios International", url: SITE_URL }],
  creator: "Znxios International",
  publisher: "Znxios International",
  applicationName: "Pixvertesa AI Image Detector",
  category: "Technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Pixvertesa by Znxios International",
    title: "Check If an Image Is Real or AI-Generated   99.98% Accuracy",
    description:
      "Free AI image detector with deep EXIF forensics, AI engine attribution, batch scanning, and zero image retention. No login required.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pixvertesa AI Image Detector by Znxios International",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pixvertesa   AI Image Detector & EXIF Forensics",
    description:
      "Verify whether any photo is authentic or AI-generated in under 350ms. Supports Midjourney, DALL-E 3, Flux & Stable Diffusion.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/pixvertesa.png",
    apple: "/pixvertesa.png",
  },
  // Paste your verification codes once you register in Search Console / Bing
  verification: {
    google: "REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_CODE",
    other: {
      "msvalidate.01": "REPLACE_WITH_BING_WEBMASTER_CODE",
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Znxios International",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/pixvertesa.png`,
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "support.znxios@gmail.com",
        contactType: "customer support",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Pixvertesa AI Image Detector",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: "Pixvertesa AI Image Detector",
      applicationCategory: "SecurityApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description:
        "Real-time AI image detection, EXIF metadata forensics, AI engine attribution, and batch CSV reporting with zero image retention.",
      provider: { "@id": `${SITE_URL}/#organization` },
      offers: [
        {
          "@type": "Offer",
          name: "Starter Plan",
          price: "0",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Professional Plan",
          price: "99",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Enterprise Plan",
          price: "999",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What happens to the images I upload?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Images are analyzed in temporary memory and discarded the moment your verdict appears. Znxios International never stores, logs, or trains AI models on your files.",
          },
        },
        {
          "@type": "Question",
          name: "How does my subscription work without a login?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Right after Razorpay checkout, your unique Order ID becomes your Access Key. It saves automatically in your browser and is emailed to you so you can restore access on any device.",
          },
        },
        {
          "@type": "Question",
          name: "Which AI image generators can Pixvertesa detect?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Pixvertesa detects artifacts from Midjourney v6, OpenAI DALL-E 3, Stable Diffusion XL, Flux Pro, Adobe Firefly, Google Imagen 3, and Ideogram 2.0.",
          },
        },
        {
          "@type": "Question",
          name: "How do I download CSV forensic reports?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "On the Enterprise plan, a Download CSV Report button appears right below your single-image verdict or batch scan queue with complete probability, engine, and EXIF details.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
