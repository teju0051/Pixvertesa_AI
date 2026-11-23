import { getAccessKeyEmailHtml } from "@/lib/emailTemplates";

export async function GET() {
  // Block access in production automatically
  if (process.env.NODE_ENV === "production") {
    return new Response("Not Found", { status: 404 });
  }

  const html = getAccessKeyEmailHtml({
    name: "Rahul Sharma",
    planLabel: "Enterprise (₹8,392/yr)",
    orderId: "order_Q9x7Kp2LmN4vRt",
    paymentId: "pay_Q9x8Ab1CdE3fGh",
    phone: "+91 98765 43210",
  });

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
