import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Amounts in smallest currency unit (paise for INR, cents for USD)
const PRICING_MATRIX: Record<
  "pro" | "enterprise",
  Record<"INR" | "USD", Record<"monthly" | "yearly", number>>
> = {
  pro: {
    INR: {
      monthly: 99 * 100, // ₹99 / month
      yearly: 832 * 100, // ₹832 / year (30% OFF ₹1,188)
    },
    USD: {
      monthly: 2 * 100, // $2 / month
      yearly: 17 * 100, // $17 / year (30% OFF $24)
    },
  },
  enterprise: {
    INR: {
      monthly: 999 * 100, // ₹999 / month
      yearly: 8392 * 100, // ₹8,392 / year (30% OFF ₹11,988)
    },
    USD: {
      monthly: 15 * 100, // $15 / month
      yearly: 126 * 100, // $126 / year (30% OFF $180)
    },
  },
};

export async function POST(req: Request) {
  try {
    const {
      plan,
      billingCycle = "monthly",
      currency = "INR",
      name,
      email,
      phone,
    } = await req.json();

    if (plan !== "pro" && plan !== "enterprise") {
      return NextResponse.json(
        { error: "Invalid plan selected." },
        { status: 400 },
      );
    }
    const cycle: "monthly" | "yearly" =
      billingCycle === "yearly" ? "yearly" : "monthly";
    const curr: "INR" | "USD" = currency === "USD" ? "USD" : "INR";

    const amount = PRICING_MATRIX[plan][curr][cycle];

    const order = await razorpay.orders.create({
      amount,
      currency: curr,
      receipt: `zt_${plan}_${cycle}_${Date.now()}`,
      notes: {
        plan,
        billingCycle: cycle,
        currency: curr,
        customer_name: name || "",
        customer_email: email || "",
        customer_phone: phone || "",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
      billingCycle: cycle,
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment order." },
      { status: 500 },
    );
  }
}
