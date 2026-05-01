import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
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
 * 
 * SECURITY: Requires user authentication and file access permission
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bucketFileId = searchParams.get("bucketFileId");
  const fileId = searchParams.get("fileId");
  const name = searchParams.get("name") || "file";

  if (!bucketFileId || !fileId) {
    return new NextResponse("Missing required parameters", {
      status: 400,
    });
  }

  try {
    // SECURITY: Verify user is authenticated
    const { account } = await createSessionClient();
    const user = await account.get();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { databases, storage } = await createAdminClient();

    // SECURITY: Verify user has access to this file
    const file = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    // Handle both cases: owner as ID string or owner as object with $id
    const ownerId = typeof file.owner === "string" ? file.owner : file.owner?.$id;

    const hasAccess = 
      ownerId === user.$id || 
      (file.users && file.users.includes(user.email));

    if (!hasAccess) {
      return new NextResponse("Forbidden: No access to this file", { status: 403 });
    }

    // Download the raw (encrypted) bytes from Appwrite Storage
    const fileData = await storage.getFileDownload(
      appwriteConfig.bucketId,
      bucketFileId,
    );

    // SECURITY: Validate file size to prevent DoS (50MB limit)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const fileSize = (fileData as ArrayBuffer).byteLength;
    if (fileSize > MAX_FILE_SIZE) {
      return new NextResponse("File too large", { status: 413 });
    }

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
    console.error("[/api/decrypt] Error:", error);
    return new NextResponse(
      "Decryption failed. The file may be corrupted or the server key may have changed.",
      { status: 500 },
    );
  }
}
