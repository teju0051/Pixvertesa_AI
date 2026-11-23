type AccessKeyEmailParams = {
  name?: string;
  planLabel: string;
  orderId: string;
  paymentId: string;
  phone?: string;
};

const HEADER_LOGO_URL =
  "https://zen-tech.vercel.app/Assets/zt-portrait-logo.png";

export function getAccessKeyEmailHtml({
  name,
  planLabel,
  orderId,
  paymentId,
  phone,
}: AccessKeyEmailParams): string {
  const year = new Date().getFullYear();
  const issueDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Confirmation & Access Key   Znxios</title>
</head>
<body style="margin:0; padding:0; background-color:#F4F5F7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#18181B; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F4F5F7; padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- MAIN CARD -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background-color:#FFFFFF; border:1px solid #E4E4E7; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.04);">
          
          <!-- TOP ACCENT BAR -->
          <tr>
            <td style="height:4px; background-color:#000000; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <!-- HEADER WITH LOGO & STATUS -->
          <tr>
            <td style="padding:28px 36px 20px; border-bottom:1px solid #F1F1F4;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <img src="https://static.vecteezy.com/system/resources/previews/026/756/293/large_2x/green-tick-confirm-or-checkmark-line-art-icons-for-apps-and-websites-vector.jpg" alt="Znxios International" height="36" style="display:block; height:36px; width:auto; border:0;" />
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

          <!-- GREETING & BODY -->
          <tr>
            <td style="padding:32px 36px 28px;">
              <h1 style="margin:0 0 12px; font-size:22px; font-weight:700; color:#09090B; letter-spacing:-0.3px;">
                Thank you for your subscription
              </h1>
              <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#3F3F46;">
                Dear ${name || "Valued Customer"},<br /><br />
                Your payment for <strong>${planLabel}</strong> has been successfully verified. Your license is now active and ready for immediate use.
              </p>

              <!-- ACCESS KEY BLOCK -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FAFAFA; border:1.5px solid #D4D4D8; border-radius:10px; margin-bottom:24px;">
                <tr>
                  <td align="center" style="padding:22px 20px;">
                    <p style="margin:0 0 8px; font-size:11px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#71717A;">
                      Your Official Access Key 
                    </p>
                    <p style="margin:0; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:20px; font-weight:700; color:#09090B; letter-spacing:0.8px; word-break:break-all;">
                      ${orderId}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- FORMAL RECEIPT DETAILS TABLE -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #E4E4E7; margin-bottom:24px;">
                <tr>
                  <td style="padding:11px 0; border-bottom:1px solid #F1F1F4; font-size:13px; color:#71717A;">Plan Activated</td>
                  <td align="right" style="padding:11px 0; border-bottom:1px solid #F1F1F4; font-size:13px; font-weight:600; color:#18181B;">${planLabel}</td>
                </tr>
                <tr>
                  <td style="padding:11px 0; border-bottom:1px solid #F1F1F4; font-size:13px; color:#71717A;">Payment Reference</td>
                  <td align="right" style="padding:11px 0; border-bottom:1px solid #F1F1F4; font-size:13px; font-family:monospace; color:#18181B;">${paymentId}</td>
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

              <!-- IMPORTANT RETENTION NOTICE -->
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

          <!-- BLACK FOOTER: LOGO LEFT | RIGHTS RIGHT -->
          <tr>
            <td style="background-color:#000000; padding:24px 36px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle" style="padding-right:16px;">
                    <img src="https://www.image2url.com/r2/default/images/1795362087790-7ae8496b-e1df-454f-8797-24327e2fc5e9.png" alt="Znxios" height="28" style="display:block; height:58px; width:auto; border:0;" />
                  </td>
                  <td align="right" valign="middle">
                    <p style="margin:0; font-size:12px; font-weight:600; color:#FFFFFF; line-height:1.4;">
                      &copy; ${year} Znxios International.<br />
                      <span style="font-weight:400; color:#A1A1AA;">All rights reserved.</span>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- NO-REPLY NOTICE -->
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
</html>`;
}
