import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (
      !orderId ||
      typeof orderId !== "string" ||
      !orderId.startsWith("order_")
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: "Please enter a valid Order ID (starts with order_).",
        },
        { status: 400 },
      );
    }

    const order = await razorpay.orders.fetch(orderId.trim());

    if (order.status !== "paid") {
      return NextResponse.json(
        {
          valid: false,
          error: "This Order ID does not have a completed payment.",
        },
        { status: 400 },
      );
    }

    const notesPlan = (order.notes as Record<string, string>)?.plan;
    const plan =
      notesPlan === "enterprise" || Number(order.amount) >= 99900
        ? "enterprise"
        : "pro";

    return NextResponse.json({
      valid: true,
      orderId: order.id,
      plan,
    });
  } catch (error) {
    console.error("Verify key error:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Access Key not found. Please check your Order ID.",
      },
      { status: 404 },
    );
  }
}
