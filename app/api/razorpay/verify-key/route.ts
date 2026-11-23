import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { orderId } = (await req.json()) as { orderId?: string };

    if (!orderId || !orderId.trim().startsWith("order_")) {
      return NextResponse.json(
        { valid: false, error: "Invalid Order ID format." },
        { status: 400 },
      );
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          valid: false,
          error: "Razorpay keys are not configured on the server.",
        },
        { status: 500 },
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.fetch(orderId.trim());

    if (order.status !== "paid") {
      return NextResponse.json(
        { valid: false, error: "This order has not been paid." },
        { status: 400 },
      );
    }

    const plan = order.notes?.plan === "enterprise" ? "enterprise" : "pro";

    return NextResponse.json({
      valid: true,
      orderId: order.id,
      plan,
    });
  } catch (error) {
    console.error("Razorpay verify-key error:", error);
    return NextResponse.json(
      { valid: false, error: "Could not verify Access Key." },
      { status: 400 },
    );
  }
}
