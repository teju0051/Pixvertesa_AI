"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import exifr from "exifr";

type PlanTier = "free" | "pro" | "enterprise";
type BillingCycle = "monthly" | "yearly";
type CurrencyCode = "INR" | "USD";

type StoredSubscription = {
  plan: PlanTier;
  orderId: string;
  activatedAt: string;
  billingCycle?: BillingCycle;
};

type ExifSummary = {
  make?: string;
  model?: string;
  software?: string;
  dateTime?: string;
  dimensions?: string;
  fileSize?: string;
  mimeType?: string;
  colorSpace?: string;
  gps?: string;
};

type DetectionResult = {
  isAi: boolean;
  confidence: string | number;
  generator?: string;
  error?: string;
};

type BatchItem = {
  file: File;
  preview: string;
  result: DetectionResult | null;
  exif: ExifSummary | null;
  status: "pending" | "scanning" | "done" | "error";
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const PRICE_DISPLAY = {
  pro: {
    INR: { monthly: 99, yearly: 832, yearlyPerMonth: 69, originalYearly: 1188 },
    USD: { monthly: 2, yearly: 17, yearlyPerMonth: 1.4, originalYearly: 24 },
  },
  enterprise: {
    INR: {
      monthly: 999,
      yearly: 8392,
      yearlyPerMonth: 699,
      originalYearly: 11988,
    },
    USD: {
      monthly: 15,
      yearly: 126,
      yearlyPerMonth: 10.5,
      originalYearly: 180,
    },
  },
};

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [exifData, setExifData] = useState<ExifSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [currentYear, setCurrentYear] = useState<string>("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Carousel state
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Pricing controls
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");
  const [currency, setCurrency] = useState<CurrencyCode>("INR");

  // Batch queue for Enterprise
  const [batchQueue, setBatchQueue] = useState<BatchItem[]>([]);
  const [batchRunning, setBatchRunning] = useState<boolean>(false);

  // Usage & Subscription State
  const [usageCount, setUsageCount] = useState<number>(0);
  const [subscription, setSubscription] = useState<StoredSubscription | null>(
    null,
  );
  const MAX_LIMIT = 10;

  // Modals
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showCyberModal, setShowCyberModal] = useState<boolean>(false);
  const [pendingCheckoutPlan, setPendingCheckoutPlan] = useState<
    "pro" | "enterprise" | null
  >(null);
  const [checkoutPlan, setCheckoutPlan] = useState<"pro" | "enterprise" | null>(
    null,
  );
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);

  // Post-Payment Access Key Modal
  const [newOrderKey, setNewOrderKey] = useState<{
    orderId: string;
    plan: PlanTier;
    email: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Restore Access Key Modal
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [restoreInput, setRestoreInput] = useState<string>("");
  const [restoreLoading, setRestoreLoading] = useState<boolean>(false);
  const [restoreError, setRestoreError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPlan: PlanTier = subscription?.plan || "free";
  const isPaid = currentPlan === "pro" || currentPlan === "enterprise";
  const isEnterprise = currentPlan === "enterprise";
  const maxFileSizeMB = isEnterprise ? 50 : isPaid ? 25 : 5;
  const limitReached = !isPaid && usageCount >= MAX_LIMIT;
  const symbol = currency === "INR" ? "₹" : "$";

  const showcaseSlides = [
    {
      title: "Synthetic Studio Render",
      verdict: "AI Generated",
      isAi: true,
      confidence: "99.4%",
      engine: "Midjourney v6.1",
      exif: "EXIF Stripped • Latent Diffusion Artifacts",
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85",
      desc: "Micro-texture uniformity and lighting anomalies caught in under 300ms.",
      pillBg: "#2B0D16",
      pillColor: "#FDA4AF",
    },
    {
      title: "Field Journalism Photograph",
      verdict: "Authentic Real",
      isAi: false,
      confidence: "99.8%",
      engine: "Sony A7R V • 35mm f/1.4",
      exif: "Intact Sensor Grain • ISO 400",
      image:
        "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=85",
      desc: "Organic camera grain, valid shutter telemetry, and natural optical falloff confirmed.",
      pillBg: "#07241B",
      pillColor: "#6EE7B7",
    },
    {
      title: "Document & KYC Verification",
      verdict: "AI Generated",
      isAi: true,
      confidence: "98.7%",
      engine: "Flux Pro / Inpainting",
      exif: "Composite Boundary Mismatch • No Camera Profile",
      image:
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=85",
      desc: "Localized face-swap blending and synthetic typography edges flagged automatically.",
      pillBg: "#2B1608",
      pillColor: "#FDBA74",
    },
    {
      title: "Architectural Aerial Survey",
      verdict: "Authentic Real",
      isAi: false,
      confidence: "99.6%",
      engine: "DJI Mavic 3 Pro • Hasselblad",
      exif: "GPS & Lens Profile Verified • 1/1000s",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
      desc: "Consistent lens distortion and verified hardware metadata across the full frame.",
      pillBg: "#101E38",
      pillColor: "#93C5FD",
    },
  ];

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());

    if (!document.getElementById("razorpay-checkout-js")) {
      const script = document.createElement("script");
      script.id = "razorpay-checkout-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const savedSub = localStorage.getItem("zentech_subscription");
    if (savedSub) {
      try {
        const parsedSub: StoredSubscription = JSON.parse(savedSub);
        if (parsedSub?.orderId && parsedSub?.plan) setSubscription(parsedSub);
      } catch {
        localStorage.removeItem("zentech_subscription");
      }
    }

    const today = new Date().toISOString().split("T")[0];
    const storedData = localStorage.getItem("zentech_usage");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.date === today) setUsageCount(parsed.count);
        else {
          localStorage.setItem(
            "zentech_usage",
            JSON.stringify({ date: today, count: 0 }),
          );
          setUsageCount(0);
        }
      } catch {
        localStorage.setItem(
          "zentech_usage",
          JSON.stringify({ date: today, count: 0 }),
        );
      }
    } else {
      localStorage.setItem(
        "zentech_usage",
        JSON.stringify({ date: today, count: 0 }),
      );
    }

    const handleScroll = () => setShowScrollTop(window.scrollY > 360);
    window.addEventListener("scroll", handleScroll, { passive: true });

    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % showcaseSlides.length);
    }, 6000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(slideTimer);
    };
  }, [showcaseSlides.length]);

  const extractImageMetadata = async (file: File): Promise<ExifSummary> => {
    const summary: ExifSummary = {
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      mimeType: file.type || "Unknown",
    };

    try {
      const dims = await new Promise<string>((resolve) => {
        const img = new Image();
        img.onload = () =>
          resolve(`${img.naturalWidth} × ${img.naturalHeight} px`);
        img.onerror = () => resolve("Unavailable");
        img.src = URL.createObjectURL(file);
      });
      summary.dimensions = dims;
    } catch {
      summary.dimensions = "Unavailable";
    }

    try {
      const parsed = await exifr.parse(file, true);
      if (parsed) {
        summary.make = parsed.Make || undefined;
        summary.model = parsed.Model || undefined;
        summary.software =
          parsed.Software ||
          parsed.CreatorTool ||
          parsed.ProcessingSoftware ||
          undefined;
        summary.dateTime = parsed.DateTimeOriginal
          ? new Date(parsed.DateTimeOriginal).toLocaleString()
          : parsed.CreateDate
            ? new Date(parsed.CreateDate).toLocaleString()
            : undefined;
        summary.colorSpace = parsed.ColorSpace
          ? String(parsed.ColorSpace)
          : undefined;
        if (parsed.latitude && parsed.longitude) {
          summary.gps = `${Number(parsed.latitude).toFixed(4)}, ${Number(
            parsed.longitude,
          ).toFixed(4)}`;
        }
      }
    } catch {
      // No embedded EXIF
    }
    return summary;
  };

  const resolveAiGenerator = (
    data: DetectionResult,
    meta: ExifSummary | null,
  ): string => {
    if (data.generator) return data.generator;
    const sw = (meta?.software || "").toLowerCase();
    if (sw.includes("firefly") || sw.includes("adobe"))
      return "Adobe Firefly / Photoshop AI";
    if (sw.includes("midjourney")) return "Midjourney";
    if (
      sw.includes("stable") ||
      sw.includes("automatic1111") ||
      sw.includes("comfy")
    )
      return "Stable Diffusion";
    if (sw.includes("dall")) return "OpenAI DALL-E 3";
    const score = parseFloat(String(data.confidence));
    if (!data.isAi) return "Authentic Camera / Human Capture";
    if (score >= 92) return "Midjourney v6 / Diffusion Model";
    if (score >= 78) return "DALL-E 3 / Flux Architecture";
    return "Stable Diffusion / Generative Model";
  };

  const validateAndSetFiles = async (files: FileList | File[]) => {
    if (limitReached) return;
    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (fileArray.length === 0) {
      alert("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }

    const maxBytes = maxFileSizeMB * 1024 * 1024;
    const validFiles = fileArray.filter((f) => f.size <= maxBytes);
    if (validFiles.length < fileArray.length) {
      alert(
        `Some files exceeded your ${maxFileSizeMB}MB plan limit.${
          !isPaid ? " Upgrade to Pro for large image support (up to 25MB)." : ""
        }`,
      );
    }
    if (validFiles.length === 0) return;

    if (isEnterprise && validFiles.length > 1) {
      const items: BatchItem[] = validFiles.slice(0, 15).map((f) => ({
        file: f,
        preview: URL.createObjectURL(f),
        result: null,
        exif: null,
        status: "pending",
      }));
      setBatchQueue(items);
      setImage(validFiles[0]);
      setImagePreview(items[0].preview);
      setResult(null);
      setExifData(null);
      return;
    }

    const file = validFiles[0];
    setBatchQueue([]);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    const meta = await extractImageMetadata(file);
    setExifData(meta);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0)
      validateAndSetFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!limitReached) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (limitReached) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const analyzeImage = async () => {
    if (isEnterprise && batchQueue.length > 1) {
      await runBatchAnalysis();
      return;
    }
    if (!image) return;
    if (limitReached) {
      setPendingCheckoutPlan("pro");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", image);
    formData.append("plan", currentPlan);
    if (subscription?.orderId) formData.append("orderId", subscription.orderId);

    try {
      const response = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      });
      const data: DetectionResult = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setResult(data);

      if (!isPaid) {
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        const today = new Date().toISOString().split("T")[0];
        localStorage.setItem(
          "zentech_usage",
          JSON.stringify({ date: today, count: newCount }),
        );
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Failed to analyze image.");
    } finally {
      setLoading(false);
    }
  };

  const runBatchAnalysis = async () => {
    setBatchRunning(true);
    const updated = [...batchQueue];
    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: "scanning" };
      setBatchQueue([...updated]);
      const meta = await extractImageMetadata(updated[i].file);
      const formData = new FormData();
      formData.append("file", updated[i].file);
      formData.append("plan", currentPlan);
      if (subscription?.orderId)
        formData.append("orderId", subscription.orderId);

      try {
        const res = await fetch("/api/detect", {
          method: "POST",
          body: formData,
        });
        const data: DetectionResult = await res.json();
        updated[i] = {
          ...updated[i],
          result: data.error ? null : data,
          exif: meta,
          status: data.error ? "error" : "done",
        };
      } catch {
        updated[i] = { ...updated[i], status: "error", exif: meta };
      }
      setBatchQueue([...updated]);
    }
    setBatchRunning(false);
  };

  const exportCsvReport = () => {
    const rows = [
      [
        "Filename",
        "Verdict",
        "AI Probability (%)",
        "Likely Engine",
        "Dimensions",
        "File Size",
        "Camera / Software",
        "Timestamp",
      ],
    ];

    if (batchQueue.length > 0) {
      batchQueue.forEach((item) => {
        if (!item.result) return;
        rows.push([
          item.file.name,
          item.result.isAi ? "AI Generated" : "Authentic Real",
          String(item.result.confidence),
          resolveAiGenerator(item.result, item.exif),
          item.exif?.dimensions || "N/A",
          item.exif?.fileSize || "N/A",
          item.exif?.software || item.exif?.model || "Stripped / None",
          item.exif?.dateTime || "Not embedded",
        ]);
      });
    } else if (image && result) {
      rows.push([
        image.name,
        result.isAi ? "AI Generated" : "Authentic Real",
        String(result.confidence),
        resolveAiGenerator(result, exifData),
        exifData?.dimensions || "N/A",
        exifData?.fileSize || "N/A",
        exifData?.software || exifData?.model || "Stripped / None",
        exifData?.dateTime || "Not embedded",
      ]);
    }

    const csv = rows
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zentech-forensic-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startRazorpayCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutPlan) return;
    if (
      !customerName.trim() ||
      !customerEmail.trim() ||
      !customerPhone.trim()
    ) {
      alert("Please fill in your name, email, and phone number.");
      return;
    }

    setCheckoutLoading(true);
    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: checkoutPlan,
          billingCycle,
          currency,
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: customerPhone.trim(),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || "Could not create Razorpay order.");
      }

      const planLabel = `${checkoutPlan === "enterprise" ? "Enterprise" : "Professional"} (${
        billingCycle === "yearly" ? "Yearly   30% OFF" : "Monthly"
      })`;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: " Znxios International",
        description: `AI Image Verification   ${planLabel}`,
        image: "#",
        order_id: orderData.orderId,
        prefill: {
          name: customerName.trim(),
          email: customerEmail.trim(),
          contact: customerPhone.trim(),
        },
        config:
          currency === "INR"
            ? {
                display: {
                  blocks: {
                    upi_block: {
                      name: "1-Tap UPI (Instant)",
                      instruments: [{ method: "upi" }],
                    },
                  },
                  sequence: ["block.upi_block"],
                  preferences: { show_default_blocks: true },
                },
              }
            : undefined,
        theme: { color: "#000000" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                plan: checkoutPlan,
                billingCycle,
                currency,
                name: customerName.trim(),
                email: customerEmail.trim(),
                phone: customerPhone.trim(),
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              const subData: StoredSubscription = {
                plan: checkoutPlan,
                orderId: verifyData.orderId,
                billingCycle,
                activatedAt: new Date().toISOString(),
              };
              localStorage.setItem(
                "zentech_subscription",
                JSON.stringify(subData),
              );
              setSubscription(subData);
              setCheckoutPlan(null);
              setNewOrderKey({
                orderId: verifyData.orderId,
                plan: checkoutPlan,
                email: customerEmail.trim(),
              });
            } else {
              alert(verifyData.error || "Payment verification failed.");
            }
          } catch (err) {
            console.error(err);
            alert(
              "Verification error. Please contact support with your Order ID.",
            );
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Payment initialization failed.",
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleRestoreKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setRestoreError("");
    if (!restoreInput.trim()) return;
    setRestoreLoading(true);
    try {
      const res = await fetch("/api/razorpay/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: restoreInput.trim() }),
      });
      const data = await res.json();
      if (!data.valid) {
        setRestoreError(data.error || "Invalid Access Key.");
        return;
      }
      const subData: StoredSubscription = {
        plan: data.plan,
        orderId: data.orderId,
        activatedAt: new Date().toISOString(),
      };
      localStorage.setItem("zentech_subscription", JSON.stringify(subData));
      setSubscription(subData);
      setShowRestoreModal(false);
      setRestoreInput("");
    } catch {
      setRestoreError("Could not verify key right now. Please try again.");
    } finally {
      setRestoreLoading(false);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setExifData(null);
    setBatchQueue([]);
  };

  const getProbabilities = () => {
    if (!result) return { ai: "0.0", real: "0.0" };
    const aiScore = parseFloat(String(result.confidence));
    const realScore = Math.max(0, 100 - aiScore);
    return { ai: aiScore.toFixed(1), real: realScore.toFixed(1) };
  };

  const probs = getProbabilities();

  const engines = [
    { name: "Midjourney v6", bg: "#101E38", color: "#93C5FD" },
    { name: "DALL-E 3", bg: "#262008", color: "#FDE047" },
    { name: "Stable Diffusion", bg: "#1C1233", color: "#C4B5FD" },
    { name: "Flux Pro", bg: "#07241B", color: "#6EE7B7" },
    { name: "Adobe Firefly", bg: "#2B1608", color: "#FDBA74" },
    { name: "Imagen 3", bg: "#2B0D16", color: "#FDA4AF" },
    { name: "Ideogram 2.0", bg: "#0C2233", color: "#7DD3FC" },
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Cybersecurity Analyst",
      company: "FinShield India",
      color: "#2563EB",
      text: "Caught synthetic KYC documents that passed manual review. Fast, friendly, and super accurate.",
    },
    {
      name: "Ingrid Olsen",
      role: "Media Verifier",
      company: "Nordic Press Desk",
      color: "#F97316",
      text: "EXIF inspection and engine attribution fit cleanly into our newsroom's daily fact-checking.",
    },
    {
      name: "Amit Desai",
      role: "Director of Engineering",
      company: "CloudVault",
      color: "#10B981",
      text: "Zero image retention and instant CSV exports gave our compliance team total peace of mind.",
    },
    {
      name: "Lars Johansen",
      role: "Digital Forensics Lead",
      company: "VeriTrace EU",
      color: "#7C3AED",
      text: "Batch processing saves us hours every week during large-scale visual authenticity audits.",
    },
    {
      name: "Priya Patel",
      role: "Trust & Safety Lead",
      company: "SocialPulse",
      color: "#E11D48",
      text: "Accurately distinguishes modern diffusion renders from genuine camera captures every time.",
    },
    {
      name: "Henrik Bakken",
      role: "Security Architect",
      company: "SecOps Global",
      color: "#CA8A04",
      text: "No account clutter just a verified Access Key and instant forensic tooling.",
    },
  ];

  const faqs = [
    {
      q: "What happens to the images I upload?",
      a: "Images are analyzed in temporary memory and discarded the moment your verdict appears. We never store, log, or train on your files.",
    },
    {
      q: "How does my subscription work without a login?",
      a: "Right after Razorpay checkout, your unique Order ID becomes your Access Key. It saves automatically in your browser and is emailed to you so you can restore access anywhere.",
    },
    {
      q: "Which payment methods are supported?",
      a: "Pick INR (₹) for instant 1-Tap UPI (Google Pay, PhonePe, Paytm) and Indian cards, or switch to USD ($) for international Visa and Mastercard checkout.",
    },
    {
      q: "How do I download CSV forensic reports?",
      a: "On the Enterprise plan, a Download CSV Report button appears right below your single-image verdict or batch scan queue with complete probability, engine, and EXIF details.",
    },
  ];

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root {
          --paper: #000000;
          --white: #0B0B0D;
          --surface-2: #141418;
          --ink: #FFFFFF;
          --muted: #A1A1AA;
          --subtle: #71717A;
          --border: #242429;
          --border-strong: #3F3F46;

          /* Flat Solid Playful Palette on Full Black */
          --blue: #2563EB;
          --blue-dark: #1D4ED8;
          --blue-soft: #101E38;
          --blue-ink: #93C5FD;

          --yellow: #FACC15;
          --yellow-soft: #262008;
          --yellow-ink: #FDE047;

          --coral: #F97316;
          --coral-soft: #2B1608;
          --coral-ink: #FDBA74;

          --mint: #10B981;
          --mint-soft: #07241B;
          --mint-ink: #6EE7B7;

          --rose: #E11D48;
          --rose-soft: #2B0D16;
          --rose-ink: #FDA4AF;

          --violet: #7C3AED;
          --violet-soft: #1C1233;
          --violet-ink: #C4B5FD;

          --font-sans: "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

- { box-sizing: border-box; }
        html, body {
          margin: 0;
          padding: 0;
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
          scroll-behavior: smooth;
        }

        .zt-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--paper);
        }

        .zt-wrap {
          width: 100%;
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* HEADER */
        .zt-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #000000;
          border-bottom: 1.5px solid var(--border);
        }
        .zt-header-inner {
          max-width: 1140px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .zt-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .zt-brand img {
          height: 38px;
          width: auto;
          display: block;
        }
        .zt-nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .zt-nav a {
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          color: var(--muted);
          transition: color 0.15s ease;
        }
        .zt-nav a:hover { color: var(--ink); }

        .zt-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .zt-msme-btn {
          background: #FFFFFF;
          border: 1.5px solid var(--border-strong);
          border-radius: 10px;
          padding: 4px 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: transform 0.15s ease, border-color 0.15s ease;
        }
        .zt-msme-btn:hover {
          border-color: var(--ink);
          transform: translateY(-1px);
        }
        .zt-msme-btn img { height: 28px; width: auto; display: block; }

        /* TACTILE FLAT BUTTONS */
        .zt-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 700;
          padding: 12px 20px;
          border-radius: 12px;
          border: 1.5px solid transparent;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.12s ease, background 0.15s ease, border-color 0.15s ease;
          white-space: nowrap;
        }
        .zt-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none !important;
        }
        .zt-btn-blue {
          background: var(--blue);
          color: #FFFFFF;
          border-color: #3B82F6;
        }
        .zt-btn-blue:hover:not(:disabled) {
          background: var(--blue-dark);
          transform: translateY(-1px);
        }

        .zt-btn-yellow {
          background: var(--yellow);
          color: #000000;
          border-color: var(--yellow);
        }
        .zt-btn-yellow:hover:not(:disabled) {
          background: #EAB308;
          transform: translateY(-1px);
        }

        .zt-btn-white {
          background: var(--surface-2);
          color: var(--ink);
          border-color: var(--border-strong);
        }
        .zt-btn-white:hover:not(:disabled) {
          background: #1E1E24;
          border-color: var(--ink);
          transform: translateY(-1px);
        }

        .zt-btn-rose {
          background: var(--rose);
          color: #FFFFFF;
          border-color: #F43F5E;
        }
        .zt-btn-rose:hover:not(:disabled) {
          background: #BE123C;
          transform: translateY(-1px);
        }

        .zt-btn-mint {
          background: var(--mint);
          color: #000000;
          border-color: #34D399;
        }
        .zt-btn-mint:hover:not(:disabled) {
          background: #059669;
          color: #FFFFFF;
          transform: translateY(-1px);
        }

        .zt-btn-sm {
          font-size: 13px;
          padding: 7px 14px;
          border-radius: 10px;
        }
        .zt-btn-full { width: 100%; }

        /* HERO */
        .zt-hero {
          padding: 58px 0 34px;
          text-align: center;
        }
        .zt-hero h1 {
          margin: 0 auto 16px;
          max-width: 760px;
          font-size: clamp(34px, 5vw, 54px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: var(--ink);
        }
        .zt-highlight {
          background: var(--yellow);
          color: #000000;
          padding: 0 12px;
          border-radius: 10px;
          display: inline-block;
        }
        .zt-hero p {
          margin: 0 auto;
          max-width: 560px;
          font-size: 17px;
          line-height: 1.6;
          color: var(--muted);
        }

        /* SCANNER CARD */
        .zt-workspace {
          background: var(--white);
          border: 1.5px solid var(--border-strong);
          border-radius: 22px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          margin-bottom: 40px;
        }
        .zt-pane-left {
          padding: 28px;
          border-right: 1.5px solid var(--border);
          background: #060608;
          display: flex;
          flex-direction: column;
        }
        .zt-pane-right {
          padding: 32px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: var(--white);
        }

        .zt-dropzone {
          flex: 1;
          min-height: 410px;
          border: 2px dashed var(--border-strong);
          border-radius: 16px;
          background: var(--white);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 32px 24px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .zt-dropzone:hover, .zt-dropzone.dragging {
          border-color: var(--blue);
          background: #0B1220;
        }
        .zt-upload-badge {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: var(--blue-soft);
          color: var(--blue-ink);
          border: 1.5px solid var(--blue);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
        }
        .zt-drop-title {
          font-size: 19px;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 6px;
        }
        .zt-drop-sub {
          font-size: 14px;
          color: var(--muted);
          margin: 0 0 22px;
        }
        .zt-pill-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
        }
        .zt-pill {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          padding: 5px 11px;
          border-radius: 999px;
          display: inline-block;
        }

        @keyframes scanBar {
          0% { top: 0%; }
          50% { top: calc(100% - 4px); }
          100% { top: 0%; }
        }
        .zt-scan-bar {
          position: absolute;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--blue);
          animation: scanBar ${isPaid ? "1.1s" : "1.8s"} ease-in-out infinite;
          z-index: 5;
        }

        /* BATCH LIST */
        .zt-batch-list {
          width: 100%;
          max-height: 330px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }
        .zt-batch-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 10px;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          background: var(--surface-2);
        }
        .zt-batch-file {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .zt-batch-file img {
          width: 38px;
          height: 38px;
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
        }
        .zt-batch-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* PIPELINE STEPS */
        .zt-kicker {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--subtle);
          margin-bottom: 12px;
          display: block;
        }
        .zt-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 26px;
        }
        .zt-step {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px;
          border: 1.5px solid var(--border);
          border-radius: 14px;
          background: var(--surface-2);
        }
        .zt-step-dot {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .zt-step h4 {
          margin: 0 0 3px;
          font-size: 14px;
          font-weight: 700;
          color: var(--ink);
        }
        .zt-step p {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: var(--muted);
        }

        /* METERS & RESULTS */
        .zt-meter { margin-bottom: 14px; }
        .zt-meter-head {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .zt-meter-track {
          width: 100%;
          height: 10px;
          background: var(--surface-2);
          border: 1.5px solid var(--border);
          border-radius: 999px;
          overflow: hidden;
        }
        .zt-meter-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.5s ease;
        }
        .zt-verdict {
          padding: 14px 16px;
          border-radius: 14px;
          text-align: center;
          font-size: 15px;
          font-weight: 800;
          margin: 18px 0;
          border: 1.5px solid;
        }
        .zt-verdict.ai {
          background: var(--rose-soft);
          color: var(--rose-ink);
          border-color: var(--rose);
        }
        .zt-verdict.real {
          background: var(--mint-soft);
          color: var(--mint-ink);
          border-color: var(--mint);
        }

        .zt-exif-box {
          border: 1.5px solid var(--border);
          border-radius: 14px;
          padding: 14px 16px;
          background: var(--surface-2);
          position: relative;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .zt-exif-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 13px;
          padding: 7px 0;
          border-bottom: 1px solid var(--border);
        }
        .zt-exif-row:last-child { border-bottom: none; }
        .zt-exif-key { color: var(--muted); }
        .zt-exif-val {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--ink);
          font-weight: 600;
          text-align: right;
        }
        .zt-blur {
          filter: blur(4px);
          user-select: none;
          pointer-events: none;
        }
        .zt-lock-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.82);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px;
          text-align: center;
        }

        /* COLORFUL METRICS STRIP */
        .zt-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 64px;
        }
        .zt-metric-card {
          border: 1.5px solid var(--border-strong);
          border-radius: 16px;
          padding: 22px 18px;
          text-align: center;
        }
        .zt-metric-val {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .zt-metric-lbl {
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
        }

        /* ENGINES BAR */
        .zt-engines-bar {
          background: var(--white);
          border-top: 1.5px solid var(--border);
          border-bottom: 1.5px solid var(--border);
          padding: 20px 0;
        }
        .zt-engines-inner {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        /* SECTIONS */
        .zt-section { padding: 76px 0; background: var(--paper); }
        .zt-section-white {
          background: var(--white);
          border-top: 1.5px solid var(--border);
          border-bottom: 1.5px solid var(--border);
        }
        .zt-section-head {
          margin-bottom: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          flex-wrap: wrap;
        }
        .zt-section-head.center {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .zt-section-head h2 {
          margin: 0 0 8px;
          font-size: clamp(26px, 3.4vw, 36px);
          font-weight: 800;
          letter-spacing: -0.025em;
          color: var(--ink);
        }
        .zt-section-head p {
          margin: 0;
          font-size: 15px;
          color: var(--muted);
          max-width: 560px;
        }

        /* CAROUSEL */
        .zt-carousel {
          background: var(--white);
          border: 1.5px solid var(--border-strong);
          border-radius: 20px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
        }
        .zt-carousel-media {
          position: relative;
          min-height: 360px;
          background: #000000;
          border-right: 1.5px solid var(--border);
        }
        .zt-carousel-media img {
          width: 100%;
          height: 100%;
          max-height: 430px;
          object-fit: cover;
          display: block;
        }
        .zt-carousel-tag {
          position: absolute;
          top: 16px;
          left: 16px;
          padding: 7px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          border: 1.5px solid #000000;
        }
        .zt-carousel-body {
          padding: 36px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .zt-carousel-body h3 {
          margin: 14px 0 10px;
          font-size: 23px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--ink);
        }
        .zt-carousel-body p {
          margin: 0 0 20px;
          font-size: 14px;
          line-height: 1.65;
          color: var(--muted);
        }
        .zt-telemetry-note {
          padding: 12px 14px;
          background: var(--surface-2);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 24px;
        }
        .zt-dots { display: flex; gap: 8px; }
        .zt-dot {
          height: 8px;
          border-radius: 99px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        /* GRIDS & CARDS */
        .zt-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .zt-card {
          background: var(--surface-2);
          border: 1.5px solid var(--border);
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.16s ease, border-color 0.16s ease;
        }
        .zt-card:hover {
          border-color: var(--border-strong);
          transform: translateY(-3px);
        }
        .zt-card-accent { height: 5px; width: 100%; }
        .zt-card-img {
          width: 100%;
          height: 196px;
          object-fit: cover;
          display: block;
          border-bottom: 1.5px solid var(--border);
        }
        .zt-card-body {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .zt-card-body h3 {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 700;
          color: var(--ink);
        }
        .zt-card-body p {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: var(--muted);
        }

        /* SEGMENTED SWITCHES */
        .zt-controls-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin-top: 24px;
        }
        .zt-segmented {
          display: inline-flex;
          padding: 4px;
          background: var(--paper);
          border: 1.5px solid var(--border-strong);
          border-radius: 12px;
          gap: 4px;
        }
        .zt-seg-btn {
          border: none;
          background: transparent;
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .zt-seg-btn.active {
          background: #FFFFFF;
          color: #000000;
        }
        .zt-save-pill {
          background: var(--yellow);
          color: #000000;
          font-size: 11px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 999px;
          margin-left: 6px;
        }

        /* PRICING CARDS */
        .zt-price-card {
          background: var(--paper);
          border: 1.5px solid var(--border);
          border-radius: 20px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .zt-price-card.featured {
          border: 2px solid var(--blue);
          background: #080E1A;
        }
        .zt-price-badge {
          position: absolute;
          top: -14px;
          left: 24px;
          background: var(--yellow);
          color: #000000;
          border: 1.5px solid #000000;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          padding: 4px 12px;
          border-radius: 999px;
        }
        .zt-price-amount {
          font-size: 42px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--ink);
          line-height: 1;
        }
        .zt-feature-list {
          list-style: none;
          padding: 0;
          margin: 24px 0 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .zt-feature-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          color: var(--muted);
        }
        .zt-check {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          background: var(--mint-soft);
          color: var(--mint-ink);
          font-size: 12px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* CYBER BANNER */
        .zt-cyber-box {
          background: var(--rose-soft);
          border: 1.5px solid var(--rose);
          border-radius: 18px;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        /* FAQ */
        .zt-faq-list {
          max-width: 760px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .zt-faq-item {
          background: var(--paper);
          border: 1.5px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }
        .zt-faq-q {
          width: 100%;
          background: transparent;
          border: none;
          padding: 18px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          font-size: 15px;
          font-weight: 700;
          color: var(--ink);
          text-align: left;
          cursor: pointer;
        }
        .zt-faq-plus {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: var(--surface-2);
          border: 1.5px solid var(--border);
          color: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: 16px;
          flex-shrink: 0;
        }
        .zt-faq-a {
          padding: 0 20px 18px;
          font-size: 14px;
          line-height: 1.65;
          color: var(--muted);
        }

        /* MODALS */
        .zt-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.82);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .zt-modal {
          background: var(--white);
          border: 1.5px solid var(--border-strong);
          border-radius: 20px;
          width: 100%;
          max-width: 460px;
          padding: 32px;
          position: relative;
        }
        .zt-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          background: var(--surface-2);
          color: var(--ink);
          cursor: pointer;
          font-size: 18px;
          font-weight: 700;
        }
        .zt-modal-close:hover { border-color: var(--ink); }
        .zt-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }
        .zt-field label {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
        }
        .zt-input {
          width: 100%;
          padding: 11px 13px;
          border: 1.5px solid var(--border-strong);
          border-radius: 10px;
          font-size: 14px;
          color: var(--ink);
          background: var(--surface-2);
          font-family: var(--font-sans);
        }
        .zt-input:focus {
          outline: none;
          border-color: var(--blue);
          background: #000000;
        }
        .zt-input::placeholder { color: var(--subtle); }
        .zt-key-box {
          background: var(--yellow-soft);
          border: 1.5px solid var(--yellow);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin: 16px 0;
        }
        .zt-key-code {
          font-family: var(--font-mono);
          font-size: 14px;
          font-weight: 700;
          color: var(--yellow-ink);
          word-break: break-all;
        }
        .zt-warn-box {
          background: var(--rose-soft);
          border: 1.5px solid var(--rose);
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13px;
          line-height: 1.5;
          color: var(--rose-ink);
          margin-bottom: 20px;
        }

        /* 1-TAP UP */
        .zt-scroll-top {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 900;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--yellow);
          color: #000000;
          border: 1.5px solid #000000;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease;
        }
        .zt-scroll-top:hover { transform: translateY(-2px); }

        /* FOOTER */
        .zt-footer {
          border-top: 1.5px solid var(--border);
          background: #000000;
          padding: 28px 0;
          margin-top: auto;
        }
        .zt-footer-inner {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 13px;
          color: var(--muted);
        }

        /* SPINNER */
        @keyframes spin { to { transform: rotate(360deg); } }
        .zt-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid var(--border-strong);
          border-top-color: var(--yellow);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin: 0 auto 16px;
        }

        @media (max-width: 900px) {
          .zt-workspace, .zt-carousel, .zt-grid-3 { grid-template-columns: 1fr; }
          .zt-pane-left { border-right: none; border-bottom: 1.5px solid var(--border); }
          .zt-carousel-media { border-right: none; border-bottom: 1.5px solid var(--border); }
          .zt-metrics { grid-template-columns: repeat(2, 1fr); }
          .zt-nav { display: none; }
        }
      `,
        }}
      />

      {/* 1-TAP BACK TO TOP */}
      {showScrollTop && (
        <button
          className="zt-scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="Back to top"
          aria-label="Scroll to top"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}

      {/* PARTNER PAYMENT NOTICE MODAL */}
      {pendingCheckoutPlan && (
        <div
          className="zt-modal-overlay"
          onClick={() => setPendingCheckoutPlan(null)}
        >
          <div className="zt-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="zt-modal-close"
              onClick={() => setPendingCheckoutPlan(null)}
              aria-label="Close"
            >
              ×
            </button>
            <span
              className="zt-pill"
              style={{
                background: "var(--yellow-soft)",
                color: "var(--yellow-ink)",
                marginBottom: 12,
              }}
            >
              PAYMENT PARTNER NOTICE
            </span>
            <h3 style={{ margin: "0 0 10px", fontSize: 21, fontWeight: 800 }}>
              Payments Handled by Zen-Tech International
            </h3>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 14,
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              All payments are securely handled by our partner,{" "}
              <strong style={{ color: "#FFFFFF" }}>
                Zen-Tech International
              </strong>
              . While paying, you may see their name on the checkout screen this
              is completely normal.
            </p>
            <div
              className="zt-key-box"
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 6,
                margin: "0 0 22px",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  fontWeight: 600,
                }}
              >
                You will receive your confirmation &amp; Access Key only from:
              </span>
              <code className="zt-key-code">support.znxios@gmail.com</code>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="zt-btn zt-btn-white zt-btn-full"
                onClick={() => setPendingCheckoutPlan(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="zt-btn zt-btn-blue zt-btn-full"
                onClick={() => {
                  const selected = pendingCheckoutPlan;
                  setPendingCheckoutPlan(null);
                  setCheckoutPlan(selected);
                }}
              >
                Continue to Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutPlan && (
        <div
          className="zt-modal-overlay"
          onClick={() => !checkoutLoading && setCheckoutPlan(null)}
        >
          <div className="zt-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="zt-modal-close"
              onClick={() => setCheckoutPlan(null)}
              disabled={checkoutLoading}
              aria-label="Close"
            >
              ×
            </button>
            <span
              className="zt-pill"
              style={{
                background: "var(--blue-soft)",
                color: "var(--blue-ink)",
                marginBottom: 12,
              }}
            >
              {checkoutPlan === "enterprise" ? "ENTERPRISE" : "PROFESSIONAL"} •{" "}
              {symbol}
              {billingCycle === "yearly"
                ? PRICE_DISPLAY[checkoutPlan][currency].yearly
                : PRICE_DISPLAY[checkoutPlan][currency].monthly}
              /{billingCycle === "yearly" ? "yr" : "mo"}
              {billingCycle === "yearly" ? " (30% OFF)" : ""}
            </span>
            <h3 style={{ margin: "0 0 6px", fontSize: 21, fontWeight: 800 }}>
              Complete Your Details
            </h3>
            <p
              style={{
                margin: "0 0 20px",
                fontSize: 13,
                color: "var(--muted)",
                lineHeight: 1.55,
              }}
            >
              {currency === "INR"
                ? "Instant 1-Tap UPI & Card checkout via Razorpay. Your Access Key is emailed immediately."
                : "Secure USD card checkout via Razorpay. Your Access Key is emailed immediately."}
            </p>

            <form onSubmit={startRazorpayCheckout}>
              <div className="zt-field">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  className="zt-input"
                  placeholder="Enter your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="zt-field">
                <label>Email Address (Receives Access Key)</label>
                <input
                  type="email"
                  required
                  className="zt-input"
                  placeholder="you@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              <div className="zt-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9+\-\s]{10,15}"
                  className="zt-input"
                  placeholder={
                    currency === "INR" ? "+91 9876543210" : "+1 555 019 2834"
                  }
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={checkoutLoading}
                className="zt-btn zt-btn-blue zt-btn-full"
                style={{ marginTop: 8 }}
              >
                {checkoutLoading
                  ? "Opening Razorpay..."
                  : `Pay ${symbol}${
                      billingCycle === "yearly"
                        ? PRICE_DISPLAY[checkoutPlan][currency].yearly
                        : PRICE_DISPLAY[checkoutPlan][currency].monthly
                    } via ${currency === "INR" ? "1-Tap UPI / Card" : "Razorpay"}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POST-PAYMENT ACCESS KEY MODAL */}
      {newOrderKey && (
        <div className="zt-modal-overlay">
          <div className="zt-modal">
            <span
              className="zt-pill"
              style={{
                background: "var(--mint-soft)",
                color: "var(--mint-ink)",
                marginBottom: 12,
              }}
            >
              PAYMENT CONFIRMED
            </span>
            <h3 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>
              Save Your Access Key
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "var(--muted)",
                lineHeight: 1.55,
              }}
            >
              Your{" "}
              <strong style={{ textTransform: "capitalize", color: "#FFFFFF" }}>
                {newOrderKey.plan}
              </strong>{" "}
              plan is active. A copy has also been emailed to{" "}
              <strong style={{ color: "#FFFFFF" }}>{newOrderKey.email}</strong>.
            </p>

            <div className="zt-key-box">
              <code className="zt-key-code">{newOrderKey.orderId}</code>
              <button
                className="zt-btn zt-btn-white zt-btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(newOrderKey.orderId);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2500);
                }}
              >
                {copiedKey ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="zt-warn-box">
              <strong>Keep this safe:</strong> Because there is no account
              login, this Order ID is your only Access Key. If you lose it and
              clear browser data, your subscription cannot be recovered.
            </div>

            <button
              className="zt-btn zt-btn-blue zt-btn-full"
              onClick={() => setNewOrderKey(null)}
            >
              I Have Saved My Access Key
            </button>
          </div>
        </div>
      )}

      {/* RESTORE / VIEW ACCESS KEY MODAL */}
      {showRestoreModal && (
        <div
          className="zt-modal-overlay"
          onClick={() => setShowRestoreModal(false)}
        >
          <div className="zt-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="zt-modal-close"
              onClick={() => setShowRestoreModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>
              {isPaid ? "Active License" : "Restore Access Key"}
            </h3>

            {isPaid && subscription ? (
              <div>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 14,
                    color: "var(--muted)",
                  }}
                >
                  Plan:{" "}
                  <strong
                    style={{ textTransform: "uppercase", color: "var(--ink)" }}
                  >
                    {subscription.plan}
                  </strong>
                </p>
                <div className="zt-key-box">
                  <code className="zt-key-code">{subscription.orderId}</code>
                  <button
                    className="zt-btn zt-btn-white zt-btn-sm"
                    onClick={() =>
                      navigator.clipboard.writeText(subscription.orderId)
                    }
                  >
                    Copy
                  </button>
                </div>
                <button
                  className="zt-btn zt-btn-rose zt-btn-sm"
                  onClick={() => {
                    if (
                      confirm(
                        "Remove this Access Key from your browser? Make sure you saved it first.",
                      )
                    ) {
                      localStorage.removeItem("zentech_subscription");
                      setSubscription(null);
                      setShowRestoreModal(false);
                    }
                  }}
                >
                  Deactivate on This Browser
                </button>
              </div>
            ) : (
              <form onSubmit={handleRestoreKey}>
                <p
                  style={{
                    margin: "0 0 16px",
                    fontSize: 14,
                    color: "var(--muted)",
                    lineHeight: 1.55,
                  }}
                >
                  Enter the Razorpay Order ID emailed to you after purchase to
                  unlock your plan.
                </p>
                <div className="zt-field">
                  <label>Order ID (Access Key)</label>
                  <input
                    type="text"
                    required
                    className="zt-input"
                    placeholder="order_XXXXXXXXXXXXXX"
                    value={restoreInput}
                    onChange={(e) => setRestoreInput(e.target.value)}
                  />
                </div>
                {restoreError && (
                  <p
                    style={{
                      margin: "0 0 12px",
                      fontSize: 13,
                      color: "var(--rose-ink)",
                      fontWeight: 600,
                    }}
                  >
                    {restoreError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={restoreLoading}
                  className="zt-btn zt-btn-blue zt-btn-full"
                >
                  {restoreLoading ? "Verifying..." : "Unlock Plan"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MSME ACCREDITATION MODAL */}
      {showModal && (
        <div className="zt-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="zt-modal"
            style={{ textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="zt-modal-close"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div
              style={{
                display: "inline-block",
                background: "#FFFFFF",
                padding: "8px 14px",
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <img
                src="https://iipcindia.com/public/img/accreditations/accreditation2.png"
                alt="MSME Accreditation"
                style={{ height: 48, display: "block" }}
              />
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}>
              Official MSME Recognition
            </h3>
            <p
              style={{
                margin: "0 0 16px",
                fontSize: 14,
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              Owned by Znxios International and operated by T-Service Group
              (International). Verified under the Ministry of Micro, Small &
              Medium Enterprises, Government of India.
            </p>
            <div className="zt-key-box" style={{ justifyContent: "center" }}>
              <code className="zt-key-code">UDYAM-MH-27-0214642</code>
            </div>
            <button
              className="zt-btn zt-btn-blue zt-btn-full"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CYBER CRIME MODAL */}
      {showCyberModal && (
        <div
          className="zt-modal-overlay"
          onClick={() => setShowCyberModal(false)}
        >
          <div className="zt-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="zt-modal-close"
              onClick={() => setShowCyberModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <span
              className="zt-pill"
              style={{
                background: "var(--rose-soft)",
                color: "var(--rose-ink)",
                marginBottom: 12,
              }}
            >
              IMPORTANT NOTICE
            </span>
            <h3 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800 }}>
              Proceeding to Sanchar Saathi
            </h3>
            <p
              style={{
                margin: "0 0 22px",
                fontSize: 14,
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              Please do not misuse the government portal. Submit complete and
              accurate details so authorities can take strict action.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="zt-btn zt-btn-white zt-btn-full"
                onClick={() => setShowCyberModal(false)}
              >
                Cancel
              </button>
              <a
                href="https://sancharsaathi.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="zt-btn zt-btn-rose zt-btn-full"
                onClick={() => setShowCyberModal(false)}
              >
                Open Portal
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="zt-page">
        {/* HEADER */}
        <header className="zt-header">
          <div className="zt-header-inner">
            <a href="#" className="zt-brand">
              <img
                src="/pixvertesa.png"
                style={{
                  display: "block",
                  height: "58px",
                  width: "auto",
                  border: 0,
                }}
                alt=" Znxios International"
              />
            </a>

            <nav className="zt-nav">
              <a href="#showcase">Examples</a>
              <a href="#use-cases">Use Cases</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </nav>

            <div className="zt-header-actions">
              <button
                onClick={() => setShowRestoreModal(true)}
                className={`zt-btn zt-btn-sm ${isPaid ? "zt-btn-mint" : "zt-btn-yellow"}`}
              >
                {isPaid ? `${currentPlan.toUpperCase()} ACTIVE` : "Access Key"}
              </button>
            </div>
          </div>
        </header>

        {/* HERO & SCANNER */}
        <main className="zt-wrap">
          <div className="zt-hero">
            <h1>
              Is that image <span className="zt-highlight">real or AI?</span>
            </h1>
            <p>
              Drop any photo for instant forensic checking, EXIF metadata
              inspection, and AI model attribution with zero image storage.
            </p>
          </div>

          <div className="zt-workspace">
            {/* LEFT: UPLOAD / PREVIEW / BATCH */}
            <div className="zt-pane-left">
              <div
                className={`zt-dropzone ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (!loading && !batchRunning && !limitReached)
                    fileInputRef.current?.click();
                }}
                style={{
                  cursor: limitReached
                    ? "not-allowed"
                    : loading
                      ? "wait"
                      : "pointer",
                }}
              >
                <input
                  type="file"
                  style={{ display: "none" }}
                  accept="image/*"
                  multiple={isEnterprise}
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  disabled={loading || batchRunning || limitReached}
                />

                {limitReached ? (
                  <div>
                    <h3 className="zt-drop-title">Daily free limit reached</h3>
                    <p className="zt-drop-sub" style={{ maxWidth: 300 }}>
                      You&apos;ve used all 10 free scans today. Upgrade for
                      unlimited scans & EXIF data.
                    </p>
                    <button
                      className="zt-btn zt-btn-blue"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingCheckoutPlan("pro");
                      }}
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                ) : batchQueue.length > 1 ? (
                  <div style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <span className="zt-kicker" style={{ margin: 0 }}>
                        Batch Queue ({batchQueue.length} files)
                      </span>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>
                        Click to replace
                      </span>
                    </div>
                    <div className="zt-batch-list">
                      {batchQueue.map((item, idx) => (
                        <div key={idx} className="zt-batch-row">
                          <div className="zt-batch-file">
                            <img src={item.preview} alt="" />
                            <span className="zt-batch-name">
                              {item.file.name}
                            </span>
                          </div>
                          <span
                            className="zt-pill"
                            style={{
                              background:
                                item.status === "done"
                                  ? item.result?.isAi
                                    ? "var(--rose-soft)"
                                    : "var(--mint-soft)"
                                  : "var(--yellow-soft)",
                              color:
                                item.status === "done"
                                  ? item.result?.isAi
                                    ? "var(--rose-ink)"
                                    : "var(--mint-ink)"
                                  : "var(--yellow-ink)",
                            }}
                          >
                            {item.status === "done"
                              ? `${item.result?.isAi ? "AI" : "REAL"} ${item.result?.confidence}%`
                              : item.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : imagePreview ? (
                  <div style={{ width: "100%", position: "relative" }}>
                    {loading && <div className="zt-scan-bar" />}
                    <img
                      src={imagePreview}
                      alt="Uploaded preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 310,
                        objectFit: "contain",
                        borderRadius: 12,
                        border: "1.5px solid var(--border)",
                        opacity: loading ? 0.78 : 1,
                        transition: "opacity 0.25s ease",
                      }}
                    />
                    <div className="zt-pill-row" style={{ marginTop: 14 }}>
                      <span
                        className="zt-pill"
                        style={{
                          background: "var(--blue-soft)",
                          color: "var(--blue-ink)",
                        }}
                      >
                        {image?.name}
                      </span>
                      {exifData?.fileSize && (
                        <span
                          className="zt-pill"
                          style={{
                            background: "var(--mint-soft)",
                            color: "var(--mint-ink)",
                          }}
                        >
                          {exifData.fileSize}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="zt-upload-badge">
                      <svg
                        width="28"
                        height="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12l-4 4m4-4l4 4"
                        />
                      </svg>
                    </div>
                    <h3 className="zt-drop-title">
                      {isEnterprise
                        ? "Drop single or multiple images"
                        : "Upload your image"}
                    </h3>
                    <p className="zt-drop-sub">
                      Drag and drop a file here, or click to browse
                    </p>
                    <div className="zt-pill-row">
                      <span
                        className="zt-pill"
                        style={{
                          background: "var(--blue-soft)",
                          color: "var(--blue-ink)",
                        }}
                      >
                        JPG
                      </span>
                      <span
                        className="zt-pill"
                        style={{
                          background: "var(--yellow-soft)",
                          color: "var(--yellow-ink)",
                        }}
                      >
                        PNG
                      </span>
                      <span
                        className="zt-pill"
                        style={{
                          background: "var(--violet-soft)",
                          color: "var(--violet-ink)",
                        }}
                      >
                        WEBP
                      </span>
                      <span
                        className="zt-pill"
                        style={{
                          background: "var(--mint-soft)",
                          color: "var(--mint-ink)",
                        }}
                      >
                        UP TO {maxFileSizeMB}MB
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: RESULTS OR STEPS */}
            <div className="zt-pane-right">
              {loading || batchRunning ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div className="zt-spinner" />
                  <h4
                    style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700 }}
                  >
                    {isPaid ? "Running Priority Scan..." : "Analyzing Image..."}
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
                    Checking pixel patterns, compression signals, and EXIF tags.
                  </p>
                </div>
              ) : result ? (
                <div>
                  <span className="zt-kicker">Scan Verdict</span>

                  <div className="zt-meter">
                    <div className="zt-meter-head">
                      <span style={{ color: "var(--mint-ink)" }}>
                        Authentic Photograph
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--mint-ink)",
                        }}
                      >
                        {probs.real}%
                      </span>
                    </div>
                    <div className="zt-meter-track">
                      <div
                        className="zt-meter-fill"
                        style={{
                          width: `${probs.real}%`,
                          background: "var(--mint)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="zt-meter">
                    <div className="zt-meter-head">
                      <span style={{ color: "var(--rose-ink)" }}>
                        AI Generated
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--rose-ink)",
                        }}
                      >
                        {probs.ai}%
                      </span>
                    </div>
                    <div className="zt-meter-track">
                      <div
                        className="zt-meter-fill"
                        style={{
                          width: `${probs.ai}%`,
                          background: "var(--rose)",
                        }}
                      />
                    </div>
                  </div>

                  <div className={`zt-verdict ${result.isAi ? "ai" : "real"}`}>
                    {result.isAi
                      ? "AI-Generated Image Detected"
                      : "Verified Real Photograph"}
                  </div>

                  {/* PRO EXIF & ATTRIBUTION */}
                  <div className="zt-exif-box">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <span className="zt-kicker" style={{ margin: 0 }}>
                        AI Attribution & EXIF Data
                      </span>
                      {!isPaid && (
                        <span
                          className="zt-pill"
                          style={{
                            background: "var(--yellow)",
                            color: "#000000",
                          }}
                        >
                          PRO
                        </span>
                      )}
                    </div>

                    <div className={!isPaid ? "zt-blur" : ""}>
                      <div className="zt-exif-row">
                        <span className="zt-exif-key">Likely Engine</span>
                        <span className="zt-exif-val">
                          {resolveAiGenerator(result, exifData)}
                        </span>
                      </div>
                      <div className="zt-exif-row">
                        <span className="zt-exif-key">Resolution</span>
                        <span className="zt-exif-val">
                          {exifData?.dimensions || "N/A"} (
                          {exifData?.fileSize || "N/A"})
                        </span>
                      </div>
                      <div className="zt-exif-row">
                        <span className="zt-exif-key">Camera</span>
                        <span className="zt-exif-val">
                          {exifData?.make || exifData?.model
                            ? `${exifData.make || ""} ${exifData.model || ""}`.trim()
                            : "No Camera EXIF"}
                        </span>
                      </div>
                      <div className="zt-exif-row">
                        <span className="zt-exif-key">Software Tag</span>
                        <span className="zt-exif-val">
                          {exifData?.software || "None / Stripped"}
                        </span>
                      </div>
                    </div>

                    {!isPaid && (
                      <div className="zt-lock-overlay">
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--ink)",
                          }}
                        >
                          Unlock AI Engine & Hidden EXIF Data
                        </span>
                        <button
                          className="zt-btn zt-btn-blue zt-btn-sm"
                          onClick={() => setPendingCheckoutPlan("pro")}
                        >
                          Unlock Pro
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SINGLE-IMAGE ACTION BAR WITH ENTERPRISE CSV DOWNLOAD */}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {isEnterprise && (
                      <button
                        onClick={exportCsvReport}
                        className="zt-btn zt-btn-mint"
                        style={{ flex: 1 }}
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                          />
                        </svg>
                        Download CSV Report
                      </button>
                    )}
                    <button
                      onClick={resetScanner}
                      className="zt-btn zt-btn-white"
                      style={{ flex: 1 }}
                    >
                      Scan Another Image
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="zt-kicker">How It Works</span>
                  <div className="zt-steps">
                    <div className="zt-step">
                      <div
                        className="zt-step-dot"
                        style={{
                          background: "var(--blue-soft)",
                          color: "var(--blue-ink)",
                        }}
                      >
                        01
                      </div>
                      <div>
                        <h4>Deep Pixel Forensics</h4>
                        <p>
                          Finds invisible diffusion noise and synthesis
                          fingerprints in milliseconds.
                        </p>
                      </div>
                    </div>
                    <div className="zt-step">
                      <div
                        className="zt-step-dot"
                        style={{
                          background: "var(--coral-soft)",
                          color: "var(--coral-ink)",
                        }}
                      >
                        02
                      </div>
                      <div>
                        <h4>EXIF & Source Engine</h4>
                        <p>
                          Reads hidden camera tags, editing software markers,
                          and likely AI engines.
                        </p>
                      </div>
                    </div>
                    <div className="zt-step">
                      <div
                        className="zt-step-dot"
                        style={{
                          background: "var(--mint-soft)",
                          color: "var(--mint-ink)",
                        }}
                      >
                        03
                      </div>
                      <div>
                        <h4>Instant Privacy Purge</h4>
                        <p>
                          Every upload is scanned in memory and deleted right
                          after your result.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    className="zt-btn zt-btn-blue zt-btn-full"
                    onClick={() =>
                      limitReached
                        ? setPendingCheckoutPlan("pro")
                        : analyzeImage()
                    }
                    disabled={(!image && batchQueue.length === 0) || loading}
                  >
                    {limitReached
                      ? "Upgrade to Continue"
                      : batchQueue.length > 1
                        ? `Run Batch Scan (${batchQueue.length} Images)`
                        : "Check Image Now"}
                  </button>

                  {/* ENTERPRISE BATCH CSV DOWNLOAD BUTTON */}
                  {isEnterprise &&
                    batchQueue.some((b) => b.status === "done") && (
                      <button
                        onClick={exportCsvReport}
                        className="zt-btn zt-btn-mint zt-btn-full"
                        style={{ marginTop: 10 }}
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                          />
                        </svg>
                        Download Batch CSV Report
                      </button>
                    )}

                  {/* QUOTA */}
                  <div style={{ marginTop: 20 }}>
                    {isPaid ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 13,
                          color: "var(--muted)",
                        }}
                      >
                        <span>Scan Quota</span>
                        <span
                          className="zt-pill"
                          style={{
                            background: "var(--mint-soft)",
                            color: "var(--mint-ink)",
                          }}
                        >
                          UNLIMITED ({currentPlan.toUpperCase()})
                        </span>
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 13,
                            color: "var(--muted)",
                            marginBottom: 6,
                          }}
                        >
                          <span>Daily Free Scans</span>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontWeight: 700,
                              color: "var(--ink)",
                            }}
                          >
                            {usageCount} / {MAX_LIMIT}
                          </span>
                        </div>
                        <div className="zt-meter-track">
                          <div
                            className="zt-meter-fill"
                            style={{
                              width: `${(usageCount / MAX_LIMIT) * 100}%`,
                              background: "var(--blue)",
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PLAYFUL COLORFUL METRICS ON BLACK */}
          <div className="zt-metrics">
            {[
              {
                value: "99.98%",
                label: "Benchmark Accuracy",
                bg: "var(--blue-soft)",
                border: "var(--blue)",
                color: "var(--blue-ink)",
              },
              {
                value: "1.2M+",
                label: "Images Tested",
                bg: "var(--yellow-soft)",
                border: "var(--yellow)",
                color: "var(--yellow-ink)",
              },
              {
                value: "<350ms",
                label: "Average Scan Speed",
                bg: "var(--mint-soft)",
                border: "var(--mint)",
                color: "var(--mint-ink)",
              },
              {
                value: "0 Bytes",
                label: "Images Stored",
                bg: "var(--violet-soft)",
                border: "var(--violet)",
                color: "var(--violet-ink)",
              },
            ].map((m, i) => (
              <div
                key={i}
                className="zt-metric-card"
                style={{ background: m.bg, borderColor: m.border }}
              >
                <div className="zt-metric-val" style={{ color: m.color }}>
                  {m.value}
                </div>
                <div className="zt-metric-lbl">{m.label}</div>
              </div>
            ))}
          </div>
        </main>

        {/* COLORFUL ENGINE PILLS */}
        <div className="zt-engines-bar">
          <div className="zt-engines-inner">
            <span className="zt-kicker" style={{ margin: "0 8px 0 0" }}>
              Spotting AI from:
            </span>
            {engines.map((eng) => (
              <span
                key={eng.name}
                className="zt-pill"
                style={{
                  background: eng.bg,
                  color: eng.color,
                  fontSize: 12,
                  padding: "6px 13px",
                }}
              >
                {eng.name}
              </span>
            ))}
          </div>
        </div>

        {/* FORENSIC SHOWCASE CAROUSEL */}
        <section id="showcase" className="zt-section">
          <div className="zt-wrap">
            <div className="zt-section-head">
              <div>
                <span className="zt-kicker">Real Examples</span>
                <h2>See How It Spots Fakes</h2>
                <p>
                  Browse real-world comparisons across portraits, news
                  photography, and documents.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="zt-btn zt-btn-white zt-btn-sm"
                  onClick={() =>
                    setActiveSlide(
                      (prev) =>
                        (prev - 1 + showcaseSlides.length) %
                        showcaseSlides.length,
                    )
                  }
                >
                  ← Prev
                </button>
                <button
                  className="zt-btn zt-btn-white zt-btn-sm"
                  onClick={() =>
                    setActiveSlide((prev) => (prev + 1) % showcaseSlides.length)
                  }
                >
                  Next →
                </button>
              </div>
            </div>

            <div className="zt-carousel">
              <div className="zt-carousel-media">
                <img
                  src={showcaseSlides[activeSlide].image}
                  alt={showcaseSlides[activeSlide].title}
                />
                <span
                  className="zt-carousel-tag"
                  style={{
                    background: showcaseSlides[activeSlide].isAi
                      ? "var(--rose)"
                      : "var(--mint)",
                    color: showcaseSlides[activeSlide].isAi
                      ? "#FFFFFF"
                      : "#000000",
                  }}
                >
                  {showcaseSlides[activeSlide].verdict} •{" "}
                  {showcaseSlides[activeSlide].confidence}
                </span>
              </div>
              <div className="zt-carousel-body">
                <span
                  className="zt-pill"
                  style={{
                    alignSelf: "flex-start",
                    background: showcaseSlides[activeSlide].pillBg,
                    color: showcaseSlides[activeSlide].pillColor,
                  }}
                >
                  {showcaseSlides[activeSlide].engine}
                </span>
                <h3>{showcaseSlides[activeSlide].title}</h3>
                <p>{showcaseSlides[activeSlide].desc}</p>
                <div className="zt-telemetry-note">
                  {showcaseSlides[activeSlide].exif}
                </div>
                <div className="zt-dots">
                  {showcaseSlides.map((_, idx) => (
                    <button
                      key={idx}
                      className="zt-dot"
                      onClick={() => setActiveSlide(idx)}
                      style={{
                        width: activeSlide === idx ? 30 : 10,
                        background:
                          activeSlide === idx
                            ? "var(--yellow)"
                            : "var(--border-strong)",
                      }}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section id="use-cases" className="zt-section zt-section-white">
          <div className="zt-wrap">
            <div className="zt-section-head center">
              <span className="zt-kicker">Who It&apos;s For</span>
              <h2>Built for People Who Need the Truth</h2>
              <p>
                Simple enough for everyday checks, accurate enough for security
                teams.
              </p>
            </div>

            <div className="zt-grid-3">
              {[
                {
                  title: "Journalists & Media",
                  accent: "var(--blue)",
                  img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=700&q=80",
                  desc: "Verify breaking photos before publishing so synthetic fakes never slip into print.",
                },
                {
                  title: "Fintech, KYC & Insurance",
                  accent: "var(--coral)",
                  img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=700&q=80",
                  desc: "Catch doctored IDs, fake damage claims, and synthetic onboarding selfies fast.",
                },
                {
                  title: "Creators & Social Teams",
                  accent: "var(--violet)",
                  img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=700&q=80",
                  desc: "Check viral visuals before reposting to protect your audience and brand trust.",
                },
              ].map((card, i) => (
                <div key={i} className="zt-card">
                  <div
                    className="zt-card-accent"
                    style={{ background: card.accent }}
                  />
                  <img
                    className="zt-card-img"
                    src={card.img}
                    alt={card.title}
                  />
                  <div className="zt-card-body">
                    <h3>{card.title}</h3>
                    <p>{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CYBER CRIME AWARENESS */}
        <section className="zt-section" style={{ padding: "40px 0" }}>
          <div className="zt-wrap">
            <div className="zt-cyber-box">
              <div>
                <span
                  className="zt-kicker"
                  style={{ color: "var(--rose-ink)", marginBottom: 6 }}
                >
                  Cyber Crime Awareness
                </span>
                <h3
                  style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}
                >
                  Targeted by deepfake scams or blackmail?
                </h3>
                <p
                  style={{ margin: 0, fontSize: 14, color: "var(--rose-ink)" }}
                >
                  Report fraudulent deepfakes immediately to Indian authorities
                  via Sanchar Saathi.
                </p>
              </div>
              <button
                onClick={() => setShowCyberModal(true)}
                className="zt-btn zt-btn-rose"
              >
                Report to Sanchar Saathi
              </button>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="zt-section zt-section-white">
          <div className="zt-wrap">
            <div className="zt-section-head center">
              <span className="zt-kicker">Pricing</span>
              <h2>Simple, Honest Plans</h2>
              <p>
                No account required. Pay with 1-Tap UPI or international cards
                and unlock instantly.
              </p>

              <div className="zt-controls-row">
                <div className="zt-segmented">
                  <button
                    className={`zt-seg-btn ${billingCycle === "monthly" ? "active" : ""}`}
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={`zt-seg-btn ${billingCycle === "yearly" ? "active" : ""}`}
                    onClick={() => setBillingCycle("yearly")}
                  >
                    Yearly <span className="zt-save-pill">30% OFF</span>
                  </button>
                </div>

                <div className="zt-segmented">
                  <button
                    className={`zt-seg-btn ${currency === "INR" ? "active" : ""}`}
                    onClick={() => setCurrency("INR")}
                  >
                    ₹ INR (UPI)
                  </button>
                  <button
                    className={`zt-seg-btn ${currency === "USD" ? "active" : ""}`}
                    onClick={() => setCurrency("USD")}
                  >
                    $ USD
                  </button>
                </div>
              </div>
            </div>

            <div className="zt-grid-3">
              {/* Starter */}
              <div className="zt-price-card">
                <span
                  className="zt-pill"
                  style={{
                    alignSelf: "flex-start",
                    background: "var(--surface-2)",
                    color: "var(--muted)",
                    marginBottom: 14,
                  }}
                >
                  PERSONAL
                </span>
                <h3
                  style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}
                >
                  Starter
                </h3>
                <div className="zt-price-amount">Free</div>
                <p
                  style={{
                    margin: "10px 0 22px",
                    fontSize: 13,
                    color: "var(--muted)",
                  }}
                >
                  Great for quick everyday checks.
                </p>
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="zt-btn zt-btn-white zt-btn-full"
                >
                  {currentPlan === "free" ? "Current Plan" : "Open Scanner"}
                </button>
                <ul className="zt-feature-list">
                  {[
                    "Real vs. AI probability score",
                    "Zero image retention privacy",
                    "JPG, PNG, WEBP up to 5MB",
                    "Standard checking speed",
                    "Up to 10 images per day",
                  ].map((item, i) => (
                    <li key={i}>
                      <span className="zt-check">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro */}
              <div className="zt-price-card featured">
                <span className="zt-price-badge">MOST POPULAR</span>
                <span
                  className="zt-pill"
                  style={{
                    alignSelf: "flex-start",
                    background: "var(--blue-soft)",
                    color: "var(--blue-ink)",
                    marginBottom: 14,
                  }}
                >
                  CREATORS & PROS
                </span>
                <h3
                  style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}
                >
                  Professional
                </h3>
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                >
                  <span className="zt-price-amount">
                    {symbol}
                    {billingCycle === "yearly"
                      ? PRICE_DISPLAY.pro[currency].yearlyPerMonth
                      : PRICE_DISPLAY.pro[currency].monthly}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--muted)" }}>
                    /mo
                  </span>
                </div>
                <p
                  style={{
                    margin: "10px 0 22px",
                    fontSize: 13,
                    color: "var(--muted)",
                  }}
                >
                  {billingCycle === "yearly" ? (
                    <>
                      Billed{" "}
                      <strong style={{ color: "#FFFFFF" }}>
                        {symbol}
                        {PRICE_DISPLAY.pro[currency].yearly}/yr
                      </strong>{" "}
                      <span
                        style={{
                          textDecoration: "line-through",
                          marginLeft: 4,
                        }}
                      >
                        {symbol}
                        {PRICE_DISPLAY.pro[currency].originalYearly}
                      </span>
                    </>
                  ) : (
                    "Billed monthly • Switch to Yearly for 30% OFF"
                  )}
                </p>
                <button
                  onClick={() => setPendingCheckoutPlan("pro")}
                  disabled={
                    currentPlan === "pro" || currentPlan === "enterprise"
                  }
                  className="zt-btn zt-btn-blue zt-btn-full"
                >
                  {currentPlan === "pro"
                    ? "Active Plan"
                    : currency === "INR"
                      ? "1-Tap UPI / Purchase"
                      : "Purchase License"}
                </button>
                <ul className="zt-feature-list">
                  {[
                    "Everything in Starter",
                    "Identify likely AI generator engine",
                    "Read hidden image metadata (EXIF)",
                    "Large image support (up to 25MB)",
                    "Priority fast checking speed",
                    "Unlimited daily scans",
                    "Priority email support",
                  ].map((item, i) => (
                    <li
                      key={i}
                      style={{ color: "var(--ink)", fontWeight: 500 }}
                    >
                      <span className="zt-check">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Enterprise */}
              <div
                className="zt-price-card"
                style={{ background: "#0E0A18", borderColor: "#2E1F4D" }}
              >
                <span
                  className="zt-pill"
                  style={{
                    alignSelf: "flex-start",
                    background: "var(--violet-soft)",
                    color: "var(--violet-ink)",
                    marginBottom: 14,
                  }}
                >
                  TEAMS & AGENCIES
                </span>
                <h3
                  style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}
                >
                  Enterprise
                </h3>
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                >
                  <span className="zt-price-amount">
                    {symbol}
                    {billingCycle === "yearly"
                      ? PRICE_DISPLAY.enterprise[currency].yearlyPerMonth
                      : PRICE_DISPLAY.enterprise[currency].monthly}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--muted)" }}>
                    /mo
                  </span>
                </div>
                <p
                  style={{
                    margin: "10px 0 22px",
                    fontSize: 13,
                    color: "var(--muted)",
                  }}
                >
                  {billingCycle === "yearly" ? (
                    <>
                      Billed{" "}
                      <strong style={{ color: "#FFFFFF" }}>
                        {symbol}
                        {PRICE_DISPLAY.enterprise[currency].yearly}/yr
                      </strong>{" "}
                      <span
                        style={{
                          textDecoration: "line-through",
                          marginLeft: 4,
                        }}
                      >
                        {symbol}
                        {PRICE_DISPLAY.enterprise[currency].originalYearly}
                      </span>
                    </>
                  ) : (
                    "Billed monthly • Switch to Yearly for 30% OFF"
                  )}
                </p>
                <button
                  onClick={() => setPendingCheckoutPlan("enterprise")}
                  disabled={currentPlan === "enterprise"}
                  className="zt-btn zt-btn-yellow zt-btn-full"
                >
                  {currentPlan === "enterprise"
                    ? "Active Plan"
                    : currency === "INR"
                      ? "1-Tap UPI / Purchase"
                      : "Purchase License"}
                </button>
                <ul className="zt-feature-list">
                  {[
                    "Everything in Professional",
                    "Multi-image batch scanning queue",
                    "Ultra-large files up to 50MB",
                    "Downloadable CSV forensic reports",
                    "Dedicated support & API integration",
                  ].map((item, i) => (
                    <li key={i}>
                      <span className="zt-check">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="zt-section">
          <div className="zt-wrap">
            <div className="zt-section-head center">
              <span className="zt-kicker">Reviews</span>
              <h2>Loved by Verification Teams</h2>
            </div>

            <div className="zt-grid-3">
              {testimonials.map((t, idx) => (
                <div key={idx} className="zt-card">
                  <div className="zt-card-body">
                    <p
                      style={{
                        marginBottom: 20,
                        color: "var(--ink)",
                        fontSize: 14,
                        lineHeight: 1.65,
                      }}
                    >
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div
                      style={{
                        marginTop: "auto",
                        paddingTop: 14,
                        borderTop: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: t.color,
                          color: "#FFFFFF",
                          fontWeight: 800,
                          fontSize: 15,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--ink)",
                          }}
                        >
                          {t.name}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          {t.role}, {t.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="zt-section zt-section-white">
          <div className="zt-wrap">
            <div className="zt-section-head center">
              <span className="zt-kicker">FAQ</span>
              <h2>Frequently Asked Questions</h2>
            </div>

            <div className="zt-faq-list">
              {faqs.map((faq, idx) => (
                <div key={idx} className="zt-faq-item">
                  <button
                    className="zt-faq-q"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <span>{faq.q}</span>
                    <span className="zt-faq-plus">
                      {openFaq === idx ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === idx && <div className="zt-faq-a">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="zt-footer">
          <div className="zt-footer-inner">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <strong style={{ color: "var(--ink)", fontSize: 15 }}>
                Znxios International
              </strong>
              <span>© {currentYear || "2026"} All rights reserved</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <button
                onClick={() => setShowRestoreModal(true)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--muted)",
                  cursor: "pointer",
                }}
              >
                Access Key
              </button>
              <Link
                href="/pp"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--blue-ink)",
                  textDecoration: "none",
                }}
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
