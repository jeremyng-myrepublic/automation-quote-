import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { readFileSync } from "fs";
import { join } from "path";

type SelectedSolution = {
  name: string;
  mandays: number;
  price: number;
};

type SAFRequest = {
  name: string;
  company: string;
  email: string;
  phone: string;
  designation: string;
  uen: string;
  address: string;
  postalCode: string;
  contractLength: "24" | "36";
  selectedSolutions: SelectedSolution[];
  totalDays: number;
  subtotal: number;
  discountAmount: number;
  finalPrice: number;
};

export async function POST(request: Request) {
  let emailWarning = "";

  try {
    const body: SAFRequest = await request.json();
    const {
      name, company, email, phone, designation, uen,
      address, postalCode, contractLength,
      selectedSolutions, finalPrice,
    } = body;

    if (!name || !company || !email || !designation || !uen || !address || !postalCode || !selectedSolutions?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Step 1: Load PDF
    console.log("Loading PDF...");
    const pdfPath = join(process.cwd(), "public", "SAF.pdf");
    const pdfBytes = readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    console.log("PDF loaded, filling fields...");

    // Set default font size 10 on ALL text fields to prevent oversized rendering
    for (const field of form.getFields()) {
      if (field.constructor.name === "PDFTextField") {
        try { (field as ReturnType<typeof form.getTextField>).setFontSize(10); } catch { /* skip */ }
      }
    }

    // Helper to safely set text fields — skip silently if field missing
    const setText = (fieldName: string, value: string, fontSize?: number) => {
      try {
        const field = form.getTextField(fieldName);
        field.setText(value);
        if (fontSize !== undefined) field.setFontSize(fontSize);
      } catch {
        console.log(`Field not found (skipped): "${fieldName}"`);
      }
    };
    const checkBox = (fieldName: string) => {
      try {
        form.getCheckBox(fieldName).check();
      } catch {
        console.log(`Checkbox not found (skipped): "${fieldName}"`);
      }
    };

    // ── Customer Info ──
    setText("Name of Business  Company as per official ACRA records", company);
    setText("Unique Entity Number UEN", uen);
    setText("Main Office Contact Number", phone);
    setText("Registered Address as per ACRA", address);
    setText("Installation Address", address);
    setText("Postal Code", postalCode);
    setText("Postal Code_2", postalCode);

    // ── Authorised Officer ──
    setText("Name of Authorised Officer as per NRIC  Passport  FIN", name);
    setText("Designation", designation);
    setText("Mobile Number", phone);
    setText("Email Address", email);

    // ── Billing Officer (same as authorised) ──
    setText("Billing Address check here if same as Registered Address", address);
    setText("Name of Billing Officer as per NRIC  Passport  FIN", name);
    setText("Designation_3", designation);
    setText("Mobile Number_3", phone);
    setText("Postal Code_3", postalCode);
    setText("Email Address_3", email);

    // ── AI Solution Section ──
    const descriptionLines = selectedSolutions
      .map((s) => `${s.name} - ${s.mandays} mandays @ $${s.price.toLocaleString()}`)
      .join("\n");
    setText("Description Artificial Intelligence AI SolutionRow1", descriptionLines, 8);

    const priceStr = `$${finalPrice.toLocaleString()}`;
    const beforeGst = finalPrice;
    const afterGst = Math.round(finalPrice * 1.09 * 100) / 100;

    setText("OneTime ChargeRow1_2", priceStr, 9);
    setText("OneTime Charge24 Months 36 Months Other please specify_4", priceStr, 9);
    setText("OneTime ChargeTotal Charges Before GST_4", `$${beforeGst.toLocaleString()}`, 9);
    setText("OneTime ChargeTotal Charges After GST_4", `$${afterGst.toLocaleString()}`, 9);

    // Contract length checkbox (AI Solution section uses _4 suffix)
    if (contractLength === "24") {
      checkBox("24 Months_4");
    } else {
      checkBox("36 Months_4");
    }

    // ── Payment Method ──
    checkBox("Bank Transfer");

    // ── Date ──
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    setText("Date DDMMYYYY", `${dd}/${mm}/${yyyy}`);

    console.log("Fields filled, saving...");

    // Flatten form so fields are not editable
    form.flatten();

    // Save the filled PDF
    const filledPdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(filledPdfBytes).toString("base64");
    console.log("PDF saved, sending email...");

    // Send email via Resend (non-blocking — PDF is returned even if email fails)
    if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

        const emailHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#185FA5;padding:24px;border-radius:12px 12px 0 0;">
              <h1 style="color:white;margin:0;font-size:20px;">Your Service Application Form</h1>
            </div>
            <div style="padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
              <p style="color:#1f2937;font-size:16px;">Hi ${name},</p>
              <p style="color:#4b5563;">Please find your completed Service Application Form (SAF) attached to this email.</p>
              <p style="color:#4b5563;">Review the form carefully, sign it, and return it to us to proceed with your order.</p>
              <div style="background:#f0f9ff;padding:16px;border-radius:8px;margin-top:16px;">
                <p style="margin:0 0 4px;color:#6b7280;font-size:14px;">Total (before GST): <strong style="color:#1f2937;">$${beforeGst.toLocaleString()}</strong></p>
                <p style="margin:0;color:#6b7280;font-size:14px;">Total (after 9% GST): <strong style="color:#185FA5;">$${afterGst.toLocaleString()}</strong></p>
              </div>
              <p style="color:#4b5563;margin-top:24px;">If you have any questions, simply reply to this email.</p>
              <p style="color:#4b5563;">Best regards,<br/><strong>Jem AI Solutions</strong></p>
            </div>
          </div>
        `;

        await resend.emails.send({
          from: "Jem AI Solutions <onboarding@resend.dev>",
          to: email,
          subject: "Your Jem AI Solutions Service Application Form",
          html: emailHtml,
          attachments: [
            {
              filename: `SAF-${company.replace(/\s+/g, "-")}.pdf`,
              content: pdfBase64,
              contentType: "application/pdf",
            },
          ],
        });

        await resend.emails.send({
          from: "Jem AI Solutions <onboarding@resend.dev>",
          to: NOTIFY_EMAIL,
          subject: `SAF Submitted: ${company} — ${name}`,
          html: emailHtml.replace("Hi " + name, "New SAF submission from " + name + " at " + company),
          attachments: [
            {
              filename: `SAF-${company.replace(/\s+/g, "-")}.pdf`,
              content: pdfBase64,
              contentType: "application/pdf",
            },
          ],
        });

        console.log("Emails sent successfully");
      } catch (emailErr) {
        console.error("Email send error (non-blocking):", emailErr);
        emailWarning = "PDF generated but email delivery failed. Please download the PDF manually.";
      }
    } else {
      console.log("Resend not configured — skipping emails");
      emailWarning = "Email not configured — PDF generated for download only.";
    }

    return NextResponse.json({
      success: true,
      pdfBase64,
      ...(emailWarning && { warning: emailWarning }),
    });
  } catch (error) {
    console.error("SAF generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to generate SAF: ${message}` }, { status: 500 });
  }
}
