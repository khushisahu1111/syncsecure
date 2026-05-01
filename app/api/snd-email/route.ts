import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSessionClient } from "@/lib/appwrite";

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to escape HTML special characters (XSS prevention)
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Verify user is authenticated
    const { account } = await createSessionClient();
    const user = await account.get();
    
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { toEmail, fileName, ownerName, fileId, bucketFileId } = await req.json();

    if (!toEmail || !fileName || !ownerName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // SECURITY: Validate email format using RFC 5322 simplified validation
    const emailRegex = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail) || toEmail.length > 254) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    // SECURITY: Validate that inputs are strings (no null/undefined passed as string)
    if (typeof fileName !== "string" || fileName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid file name" },
        { status: 400 }
      );
    }

    if (typeof ownerName !== "string" || ownerName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid owner name" },
        { status: 400 }
      );
    }

    // SECURITY: Escape HTML to prevent XSS in email
    const safeOwnerName = escapeHtml(ownerName);
    const safeFileName = escapeHtml(fileName);
    const safeFileId = encodeURIComponent(fileId);

    // Create a download link for the shared file
    const downloadLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/shared?fileId=${safeFileId}`;

    const emailContent = `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9f9f9;border-radius:8px;">
          <h2 style="color:#16a34a;margin-top:0;">File Shared with You</h2>
          <p style="font-size:16px;color:#333;"><b>${safeOwnerName}</b> has shared <b>${safeFileName}</b> with you on SyncSecure.</p>
          <div style="margin:24px 0;">
            <a href="${downloadLink}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">
              View Shared File
            </a>
          </div>
          <p style="font-size:14px;color:#666;margin-bottom:0;">
            If you don't have a SyncSecure account, you can create one to access this shared file securely.
          </p>
        </div>
      `;

    const senderEmail = process.env.RESEND_FROM_EMAIL || "noreply@resend.dev";
    const senderName = process.env.RESEND_FROM_NAME || "SyncSecure";
    
    const response = await resend.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: toEmail,
      subject: `${safeOwnerName} shared a file with you`,
      html: emailContent,
    });
    
    if (response.error) {
      console.error("[snd-email] Resend error:", response.error);
      // SECURITY: Don't leak error details to client
      return NextResponse.json(
        { success: false, error: "Failed to send email" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, emailId: response.data.id });
  } catch (error) {
    console.error("[snd-email] Catch error:", error);
    return NextResponse.json(
      { success: false, error: `Failed to send email: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}