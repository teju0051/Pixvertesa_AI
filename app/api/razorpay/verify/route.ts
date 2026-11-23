import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";

const HEADER_LOGO_URL =
  "https://static.vecteezy.com/system/resources/previews/026/756/293/large_2x/green-tick-confirm-or-checkmark-line-art-icons-for-apps-and-websites-vector.jpg";
const FOOTER_LOGO_URL =
  "https://www.image2url.com/r2/default/images/1795362087790-7ae8496b-e1df-454f-8797-24327e2fc5e9.png";

function formatPlanLabel(
  plan: string,
  billingCycle: string = "monthly",
  currency: string = "INR",
): string {
  const isYearly = billingCycle === "yearly";
  const isUsd = currency === "USD";

  if (plan === "enterprise") {
    if (isUsd) return isYearly ? "Enterprise ($126/yr)" : "Enterprise ($15/mo)";
    return isYearly ? "Enterprise (₹8,392/yr)" : "Enterprise (₹999/mo)";
  }
  if (isUsd) return isYearly ? "Professional ($17/yr)" : "Professional ($2/mo)";
  return isYearly ? "Professional (₹832/yr)" : "Professional (₹99/mo)";
}

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      billingCycle = "monthly",
      currency = "INR",
      name,
      email,
      phone,
    } = await req.json();

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { verified: false, error: "Invalid payment signature." },
        { status: 400 },
      );
    }

    if (email && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT || 465),
          secure: Number(process.env.SMTP_PORT || 465) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const planLabel = formatPlanLabel(plan, billingCycle, currency);
        const year = new Date().getFullYear();
        const issueDate = new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        await transporter.sendMail({
          from: `"Znxios Automation" <${process.env.SMTP_USER}>`,
          to: email,
          subject: `Your Access Key   ${planLabel}`,
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Confirmation & Access Key   Znxios</title>
</head>
<body style="margin:0; padding:0; background-color:#F4F5F7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#18181B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F4F5F7; padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background-color:#FFFFFF; border:1px solid #E4E4E7; border-radius:12px; overflow:hidden;">
          <tr>
            <td style="height:4px; background-color:#000000; font-size:0; line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 36px 20px; border-bottom:1px solid #F1F1F4;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <img src="${HEADER_LOGO_URL}" alt="Znxios International" height="36" style="display:block; height:36px; width:auto; border:0;" />
                  </td>
                  <td align="right" valign="middle">
                    <span style="display:inline-block; background-color:#ECFDF5; color:#047857; border:1px solid #A7F3D0; font-size:11px; font-weight:700; letter-spacing:0.6px; text-transform:uppercase; padding:5px 10px; border-radius:999px;">
                      Payment Confirmed
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px 28px;">
              <h1 style="margin:0 0 12px; font-size:22px; font-weight:700; color:#09090B;">
                Thank you for your subscription
              </h1>
              <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#3F3F46;">
                Dear ${name || "Valued Customer"},<br /><br />
                Your payment for <strong>${planLabel}</strong> has been successfully verified. Your license is now active and ready for immediate use.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FAFAFA; border:1.5px solid #D4D4D8; border-radius:10px; margin-bottom:24px;">
                <tr>
                  <td align="center" style="padding:22px 20px;">
                    <p style="margin:0 0 8px; font-size:11px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#71717A;">
                      Your Official Access Key (Order ID)
                    </p>
                    <p style="margin:0; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:20px; font-weight:700; color:#09090B; letter-spacing:0.8px; word-break:break-all;">
                      ${razorpay_order_id}
                    </p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #E4E4E7; margin-bottom:24px;">
                <tr>
                  <td style="padding:11px 0; border-bottom:1px solid #F1F1F4; font-size:13px; color:#71717A;">Plan Activated</td>
                  <td align="right" style="padding:11px 0; border-bottom:1px solid #F1F1F4; font-size:13px; font-weight:600; color:#18181B;">${planLabel}</td>
                </tr>
                <tr>
                  <td style="padding:11px 0; border-bottom:1px solid #F1F1F4; font-size:13px; color:#71717A;">Payment Reference</td>
                  <td align="right" style="padding:11px 0; border-bottom:1px solid #F1F1F4; font-size:13px; font-family:monospace; color:#18181B;">${razorpay_payment_id}</td>
                </tr>
                <tr>
                  <td style="padding:11px 0; border-bottom:1px solid #F1F1F4; font-size:13px; color:#71717A;">Registered Phone</td>
                  <td align="right" style="padding:11px 0; border-bottom:1px solid #F1F1F4; font-size:13px; color:#18181B;">${phone || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding:11px 0; border-bottom:1px solid #F1F1F4; font-size:13px; color:#71717A;">Date of Issue</td>
                  <td align="right" style="padding:11px 0; border-bottom:1px solid #F1F1F4; font-size:13px; color:#18181B;">${issueDate}</td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FEF2F2; border:1px solid #FECACA; border-left:4px solid #DC2626; border-radius:6px; margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0 0 4px; font-size:13px; font-weight:700; color:#991B1B;">
                      Important: Store this Access Key safely
                    </p>
                    <p style="margin:0; font-size:13px; line-height:1.55; color:#7F1D1D;">
                      Because Znxios does not require an account login, this Order ID is your sole Access Key. If you lose it or clear your browser storage without saving a copy, access to your subscription cannot be restored.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0; font-size:14px; line-height:1.6; color:#52525B;">
                Warm regards,<br />
                <span style="font-size:12px; color:#71717A;">Znxios International</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#000000; padding:24px 36px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle" style="padding-right:16px;">
                    <img src="${FOOTER_LOGO_URL}" alt="Znxios" height="28" style="display:block; height:58px; width:auto; border:0;" />
                  </td>
                  <td align="right" valign="middle">
                    <p style="margin:0; font-size:12px; font-weight:600; color:#FFFFFF; line-height:1.4;">
                      &copy; ${year} Znxios International.<br />
                      <span style="font-weight:400; color:#A1A1AA;">All rights reserved.</span>
                    </p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:16px; border-top:1px solid #27272A;">
                <tr>
                  <td align="center" style="padding-top:14px;">
                    <p style="margin:0; font-size:11px; line-height:1.5; color:#71717A;">
                      This is an automated message. Please do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        });
      } catch (mailErr) {
        console.error(
          "Email dispatch failed (payment still verified):",
          mailErr,
        );
      }
    }

    return NextResponse.json({
      verified: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      plan,
    });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json(
      { verified: false, error: "Payment verification failed." },
      { status: 500 },
    );
  }
}
