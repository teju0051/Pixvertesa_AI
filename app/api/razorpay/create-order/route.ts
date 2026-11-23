import { NextResponse } from "next/server";
import Razorpay from "razorpay";

type Plan = "pro" | "enterprise";
type Currency = "INR" | "USD";
type BillingCycle = "monthly" | "yearly";

const PRICING: Record<Plan, Record<Currency, Record<BillingCycle, number>>> = {
  pro: {
    INR: { monthly: 99, yearly: 832 },
    USD: { monthly: 2, yearly: 17 },
  },
  enterprise: {
    INR: { monthly: 999, yearly: 8392 },
    USD: { monthly: 15, yearly: 126 },
  },
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      plan?: string;
      currency?: string;
      billingCycle?: string;
      name?: string;
      email?: string;
      phone?: string;
    };

    const plan = body.plan as Plan;
    const currency = body.currency as Currency;
    const billingCycle = body.billingCycle as BillingCycle;
    const { name = "", email = "", phone = "" } = body;

    if (
      !(plan in PRICING) ||
      !(currency in PRICING[plan]) ||
      !(billingCycle in PRICING[plan][currency])
    ) {
      return NextResponse.json(
        { error: "Invalid plan, currency, or billing cycle." },
        { status: 400 },
      );
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured on the server." },
        { status: 500 },
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amount = PRICING[plan][currency][billingCycle] * 100;

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `rcpt_${Date.now()}`,
      notes: {
        plan,
        billingCycle,
        name,
        email,
        phone,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json(
      { error: "Could not create Razorpay order." },
      { status: 500 },
    );
  }
}
