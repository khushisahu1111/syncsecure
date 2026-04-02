import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { decryptBuffer } from "@/lib/crypto/serverCrypto";

/**
 * GET /api/decrypt?bucketFileId=<id>&name=<filename>
 *
 * Fetches the encrypted blob from Appwrite Storage, decrypts it
 * server-side using the ENCRYPTION_SECRET, and streams the
 * original file bytes back to the browser as a download.
 *
 * The encryption key never leaves the server.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bucketFileId = searchParams.get("bucketFileId");
  const name = searchParams.get("name") || "file";

  if (!bucketFileId) {
    return new NextResponse("Missing required parameter: bucketFileId", {
      status: 400,
    });
  }

  try {
    const { storage } = await createAdminClient();

    // Download the raw (encrypted) bytes from Appwrite Storage
    const fileData = await storage.getFileDownload(
      appwriteConfig.bucketId,
      bucketFileId,
    );

    // node-appwrite returns ArrayBuffer; convert to Node.js Buffer
    const encryptedBuffer = Buffer.from(fileData as ArrayBuffer);

    // Decrypt server-side — throws if auth tag fails (tamper detection)
    const decryptedBuffer = decryptBuffer(encryptedBuffer);

    // Convert to Uint8Array — NextResponse requires BodyInit, not Buffer
    const body = new Uint8Array(decryptedBuffer);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}"`,
        "Content-Length": String(decryptedBuffer.length),
        // Never cache decrypted content
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[/api/decrypt] Decryption error:", error);
    return new NextResponse(
      "Decryption failed. The file may be corrupted or the server key may have changed.",
      { status: 500 },
    );
  }
}
