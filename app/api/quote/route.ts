import { NextResponse } from "next/server";
import { Resend } from "resend";

type SelectedSolution = {
  id: string;
  name: string;
  category: string;
  tier: "Template" | "Configured" | "Bespoke";
  priceFrom: number;
};

type QuoteRequest = {
  name: string;
  company: string;
  email: string;
  phone?: string;
  referral_source: string;
  notes?: string;
  selected_solutions: SelectedSolution[];
  total_price: number;
};

const formatSGD = (amount: number) => `SGD ${amount.toLocaleString()}`;

export async function POST(request: Request) {
  try {
    const body: QuoteRequest = await request.json();

    const {
      name,
      company,
      email,
      phone,
      referral_source,
      notes,
      selected_solutions,
      total_price,
    } = body;

    if (
      !name ||
      !company ||
      !email ||
      !selected_solutions?.length ||
      typeof total_price !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save to Supabase (skip if not configured)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        const { error: dbError } = await supabase.from("quotes").insert({
          name,
          company,
          email,
          phone: phone || null,
          referral_source,
          notes: notes || null,
          selected_solutions,
          total_price,
          created_at: new Date().toISOString(),
        });
        if (dbError) {
          console.error("Supabase error (non-blocking):", dbError);
        }
      } catch (dbErr) {
        console.error("Supabase save failed (non-blocking):", dbErr);
      }
    } else {
      console.log("Supabase not configured — skipping DB save");
    }

    // Build solution table rows for emails (Tier · From SGD X)
    const solutionRows = selected_solutions
      .map(
        (s) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${s.name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${s.category}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${s.tier}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">From ${formatSGD(s.priceFrom)}</td>
          </tr>`
      )
      .join("");

    const indicativeNote =
      `<p style="margin:8px 0 0;color:#6b7280;font-size:12px;font-style:italic;">All amounts are indicative starting prices. Final scope and pricing are confirmed during Discovery.</p>`;

    // Send emails via Resend (skip if not configured)
    if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

        // Send notification email to agency
        await resend.emails.send({
          from: "Automation Quote <onboarding@resend.dev>",
          to: NOTIFY_EMAIL,
          subject: `New Quote Request from ${name} at ${company}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#185FA5;padding:24px;border-radius:12px 12px 0 0;">
                <h1 style="color:white;margin:0;font-size:20px;">New Quote Request</h1>
              </div>
              <div style="padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
                <h2 style="margin-top:0;color:#1f2937;">Contact Details</h2>
                <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                  <tr><td style="padding:4px 0;color:#6b7280;width:140px;">Name</td><td style="padding:4px 0;font-weight:600;">${name}</td></tr>
                  <tr><td style="padding:4px 0;color:#6b7280;">Company</td><td style="padding:4px 0;font-weight:600;">${company}</td></tr>
                  <tr><td style="padding:4px 0;color:#6b7280;">Email</td><td style="padding:4px 0;"><a href="mailto:${email}">${email}</a></td></tr>
                  ${phone ? `<tr><td style="padding:4px 0;color:#6b7280;">Phone</td><td style="padding:4px 0;">${phone}</td></tr>` : ""}
                  <tr><td style="padding:4px 0;color:#6b7280;">Referral Source</td><td style="padding:4px 0;">${referral_source}</td></tr>
                  ${notes ? `<tr><td style="padding:4px 0;color:#6b7280;">Notes</td><td style="padding:4px 0;">${notes}</td></tr>` : ""}
                </table>

                <h2 style="color:#1f2937;">Selected Solutions</h2>
                <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                  <thead>
                    <tr style="background:#f9fafb;">
                      <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Solution</th>
                      <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Category</th>
                      <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Tier</th>
                      <th style="padding:8px 12px;text-align:right;border-bottom:2px solid #e5e7eb;">From</th>
                    </tr>
                  </thead>
                  <tbody>${solutionRows}</tbody>
                </table>

                <div style="background:#f0f9ff;padding:16px;border-radius:8px;margin-top:16px;">
                  <p style="margin:0 0 4px;color:#6b7280;font-size:14px;">Indicative total (${selected_solutions.length} solutions)</p>
                  <p style="margin:0;font-size:24px;font-weight:700;color:#185FA5;">From ${formatSGD(total_price)}</p>
                  ${selected_solutions.length >= 3 ? '<p style="margin:4px 0 0;color:#059669;font-size:13px;">10% bundle discount applied</p>' : ""}
                  ${indicativeNote}
                </div>
              </div>
            </div>
          `,
        });

        // Send confirmation email to customer
        await resend.emails.send({
          from: "Automation Solutions <onboarding@resend.dev>",
          to: email,
          subject: `Your Automation Quote - ${company}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#185FA5;padding:24px;border-radius:12px 12px 0 0;">
                <h1 style="color:white;margin:0;font-size:20px;">Your Automation Quote</h1>
              </div>
              <div style="padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
                <p style="color:#1f2937;font-size:16px;">Hi ${name},</p>
                <p style="color:#4b5563;">Thank you for your interest in our automation solutions! We&rsquo;ve received your quote request and our team will be in touch within <strong>24 hours</strong> with a detailed proposal.</p>

                <h2 style="color:#1f2937;margin-top:24px;">Your Selected Solutions</h2>
                <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                  <thead>
                    <tr style="background:#f9fafb;">
                      <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Solution</th>
                      <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Tier</th>
                      <th style="padding:8px 12px;text-align:right;border-bottom:2px solid #e5e7eb;">From</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${selected_solutions
                      .map(
                        (s) =>
                          `<tr>
                            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${s.name}</td>
                            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${s.tier}</td>
                            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">From ${formatSGD(s.priceFrom)}</td>
                          </tr>`
                      )
                      .join("")}
                  </tbody>
                </table>

                <div style="background:#f0f9ff;padding:16px;border-radius:8px;">
                  <p style="margin:0 0 4px;color:#6b7280;font-size:14px;">Indicative total (${selected_solutions.length} solutions)</p>
                  <p style="margin:0;font-size:24px;font-weight:700;color:#185FA5;">From ${formatSGD(total_price)}</p>
                  ${selected_solutions.length >= 3 ? '<p style="margin:4px 0 0;color:#059669;font-size:13px;">10% bundle discount applied</p>' : ""}
                  ${indicativeNote}
                </div>

                <p style="color:#4b5563;margin-top:24px;">If you have any questions in the meantime, simply reply to this email.</p>
                <p style="color:#4b5563;">Best regards,<br/><strong>The Automation Solutions Team</strong></p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Email send error (non-blocking):", emailErr);
      }
    } else {
      console.log("Resend not configured — skipping emails");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quote submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
