import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"
import nodemailer from "npm:nodemailer"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const smtpUser = Deno.env.get("SMTP_USER")
const smtpPass = Deno.env.get("SMTP_PASS")

console.log("Function started")
console.log("SUPABASE_URL:", supabaseUrl ? "set" : "MISSING")
console.log("SERVICE_ROLE_KEY:", supabaseServiceKey ? "set" : "MISSING")
console.log("SMTP_USER:", smtpUser ? smtpUser : "MISSING")
console.log("SMTP_PASS:", smtpPass ? "set (length: " + smtpPass.length + ")" : "MISSING")

// Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Reminder types and how many days before expiry
const REMINDER_TYPES = [
  { type: "30_day", daysBefore: 30 },
  { type: "7_day", daysBefore: 7 },
  { type: "1_day", daysBefore: 1 },
  { type: "expiry_day", daysBefore: 0 },
] as const

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function buildEmailHtml(
  userName: string,
  productName: string,
  brand: string | null,
  expiryDate: string,
  daysLeft: number,
  category: string,
): string {
  const urgencyColor = daysLeft <= 1 ? "#e74c3c" : daysLeft <= 7 ? "#f39c12" : "#7d7086"
  const urgencyBg = daysLeft <= 1 ? "#fef2f2" : daysLeft <= 7 ? "#fef9ee" : "#f5f3f7"
  const urgencyText =
    daysLeft === 0
      ? "Expires today!"
      : daysLeft === 1
        ? "Expires tomorrow!"
        : `Expires in ${daysLeft} days`

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f3f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(125,112,134,0.1);">
    <div style="background:#7d7086;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;letter-spacing:-0.5px;">Warrantify</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Warranty Reminder</p>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 20px;color:#2d2d2d;font-size:16px;">Hi ${userName},</p>
      <div style="background:${urgencyBg};border-left:4px solid ${urgencyColor};border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;color:${urgencyColor};font-size:15px;font-weight:600;">${urgencyText}</p>
      </div>
      <div style="background:#f9f8fa;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 4px;color:#7d7086;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">${category}</p>
        <p style="margin:0 0 6px;color:#2d2d2d;font-size:18px;font-weight:600;">${productName}</p>
        ${brand ? `<p style="margin:0 0 12px;color:#9c9ba1;font-size:14px;">${brand}</p>` : ""}
        <div style="border-top:1px solid #e8e6ec;padding-top:12px;margin-top:8px;">
          <p style="margin:0;color:#7d7086;font-size:13px;"><strong>Expiry date:</strong> ${formatDate(expiryDate)}</p>
        </div>
      </div>
      <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;">
        ${daysLeft === 0
          ? "Your warranty expires today. If you need to make a claim, act now before coverage ends."
          : daysLeft <= 7
            ? "Your warranty is expiring very soon. Make sure everything is in order and file any claims if needed."
            : "This is a friendly heads-up that your warranty will be expiring soon. Review your product and check if you need to take any action."}
      </p>
      <div style="text-align:center;">
        <a href="https://warrantify.vercel.app/dashboard"
           style="display:inline-block;background:#7d7086;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600;">
          View in Warrantify
        </a>
      </div>
    </div>
    <div style="background:#f9f8fa;padding:20px 32px;text-align:center;border-top:1px solid #e8e6ec;">
      <p style="margin:0;color:#9c9ba1;font-size:12px;">You're receiving this because you have warranty reminders enabled on Warrantify.</p>
    </div>
  </div>
</body>
</html>`
}

Deno.serve(async (req) => {
  try {
    // Accept both service role key and anon key for flexibility
    const authHeader = req.headers.get("Authorization")
    console.log("Auth header present:", !!authHeader)

    if (!smtpUser || !smtpPass) {
      console.error("SMTP credentials missing!")
      return new Response(
        JSON.stringify({ error: "SMTP_USER or SMTP_PASS secret not set" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    // Create transporter inside the handler to catch errors
    console.log("Creating SMTP transporter...")
    let transporter
    try {
      transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })
      console.log("Transporter created, verifying connection...")
      await transporter.verify()
      console.log("SMTP connection verified!")
    } catch (smtpError: any) {
      console.error("SMTP setup failed:", smtpError.message)
      return new Response(
        JSON.stringify({ error: "SMTP connection failed: " + smtpError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]
    console.log("Today:", todayStr)

    let totalSent = 0
    const errors: string[] = []
    const details: string[] = []

    for (const { type, daysBefore } of REMINDER_TYPES) {
      const targetDate = new Date(today)
      targetDate.setDate(targetDate.getDate() + daysBefore)
      const targetDateStr = targetDate.toISOString().split("T")[0]
      console.log(`Checking ${type}: looking for expiry_date = ${targetDateStr}`)

      const { data: warranties, error: fetchError } = await supabase
        .from("warranties")
        .select("id, product_name, brand, category, expiry_date, user_id, trashed_at")
        .eq("expiry_date", targetDateStr)
        .is("trashed_at", null)

      if (fetchError) {
        console.error(`Fetch error for ${type}:`, fetchError.message)
        errors.push(`Fetch error for ${type}: ${fetchError.message}`)
        continue
      }

      console.log(`Found ${warranties?.length || 0} warranties for ${type}`)
      if (!warranties || warranties.length === 0) continue

      for (const warranty of warranties) {
        // Check if reminder already sent
        const { data: existing } = await supabase
          .from("reminders")
          .select("id")
          .eq("warranty_id", warranty.id)
          .eq("type", type)
          .limit(1)

        if (existing && existing.length > 0) {
          console.log(`Reminder already sent for ${warranty.product_name} (${type}), skipping`)
          details.push(`Skipped ${warranty.product_name} (${type}) — already sent`)
          continue
        }

        // Get user email
        const { data: userData, error: userError } = await supabase
          .auth.admin.getUserById(warranty.user_id)

        if (userError || !userData?.user?.email) {
          console.error(`User lookup failed for warranty ${warranty.id}:`, userError?.message)
          errors.push(`User lookup failed for warranty ${warranty.id}`)
          continue
        }

        const userEmail = userData.user.email
        const userName = userData.user.user_metadata?.name || userEmail.split("@")[0]
        console.log(`Sending ${type} email to ${userEmail} for "${warranty.product_name}"`)

        try {
          const info = await transporter.sendMail({
            from: `"Warrantify" <${smtpUser}>`,
            to: userEmail,
            subject:
              daysBefore === 0
                ? `⚠️ ${warranty.product_name} warranty expires today!`
                : `Reminder: ${warranty.product_name} warranty expires in ${daysBefore} day${daysBefore > 1 ? "s" : ""}`,
            html: buildEmailHtml(
              userName,
              warranty.product_name,
              warranty.brand,
              warranty.expiry_date,
              daysBefore,
              warranty.category,
            ),
          })

          console.log(`Email sent! Message ID: ${info.messageId}`)

          // Record the reminder
          const { error: insertError } = await supabase.from("reminders").insert({
            warranty_id: warranty.id,
            type,
          })

          if (insertError) {
            console.error(`Failed to record reminder:`, insertError.message)
          }

          totalSent++
          details.push(`Sent ${type} for "${warranty.product_name}" to ${userEmail}`)
        } catch (emailError: any) {
          console.error(`Email send failed:`, emailError.message)
          errors.push(`Email failed for ${warranty.product_name}: ${emailError.message}`)
        }
      }
    }

    const result = {
      success: true,
      sent: totalSent,
      details,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    }
    console.log("Result:", JSON.stringify(result))

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("Fatal error:", err.message, err.stack)
    return new Response(
      JSON.stringify({ error: err.message, stack: err.stack }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
})
