import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Znxios International Privacy Policy: zero image retention, local EXIF parsing, no-login Access Key architecture, and PCI-DSS Razorpay payment security.",
  alternates: {
    canonical: "/pp",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
