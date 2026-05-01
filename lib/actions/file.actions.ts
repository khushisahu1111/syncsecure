"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { InputFile } from "node-appwrite/file";
import { Databases } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { encryptBuffer } from "@/lib/crypto/serverCrypto";

const handleError = (error: unknown, message: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(error, message);
  }
  throw error;
};

// SECURITY: Helper to verify user has permission to modify a file
const verifyFileOwnership = async (
  fileId: string,
  databases: any,
) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("User not authenticated");

  const file = await databases.getDocument(
    appwriteConfig.databaseId,
    appwriteConfig.filesCollectionId,
    fileId,
  );

  // Handle both cases: owner as ID string or owner as object with $id
  const ownerId = typeof file.owner === "string" ? file.owner : file.owner?.$id;

  // Only the file owner can modify it
  if (ownerId !== currentUser.$id) {
    throw new Error("Unauthorized: You don't have permission to modify this file");
  }

  return file;
};

// Helper: retry an async operation up to `maxAttempts` times with exponential backoff.
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  label = "operation",
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delayMs = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
        console.warn(
          `[uploadFile] ${label} failed (attempt ${attempt}/${maxAttempts}). Retrying in ${delayMs}ms…`,
          err,
        );
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }
  throw lastError;
}

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
  isEncrypted = false,
  folderId,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    // Always convert the incoming Web File → Node.js Buffer so that
    // InputFile.fromBuffer() can correctly size and stream the multipart payload.
    // Skipping this conversion causes malformed multipart data → Appwrite never
    // finishes reading → 504 Gateway Timeout.
    let inputFile: ReturnType<typeof InputFile.fromBuffer>;

    if (isEncrypted) {
      try {
        const rawBuffer = Buffer.from(await file.arrayBuffer());
        const encryptedBuffer = encryptBuffer(rawBuffer);
        inputFile = InputFile.fromBuffer(encryptedBuffer, file.name);
      } catch (encryptError) {
        console.error("[uploadFile] Encryption failed:", encryptError);
        throw new Error(
          `Encryption failed: ${encryptError instanceof Error ? encryptError.message : "Unknown error"}`,
        );
      }
    } else {
      // FIX: convert Web File → Node Buffer before passing to the SDK.
      const rawBuffer = Buffer.from(await file.arrayBuffer());
      inputFile = InputFile.fromBuffer(rawBuffer, file.name);
    }

    // Retry the network call up to 3 times to handle transient timeouts.
    const bucketFile = await withRetry(
      () =>
        storage.createFile(
          appwriteConfig.bucketId,
          ID.unique(),
          inputFile,
        ),
      3,
      `storage.createFile(${file.name})`,
    );
    console.log(`[uploadFile] Successfully stored bucket file: ${bucketFile.$id}`);

    const fileDocument: Record<string, unknown> = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
      isEncrypted,
      // Only set folderId when explicitly provided — root-level uploads will have null
      ...(folderId ? { folderId } : {}),
    };

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument,
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

const createQueries = (
  currentUser: Models.Document,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number,
) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
    // Exclude soft-deleted files from all standard views
    Query.equal("isDeleted", false),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");

    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
    );
  }

  return queries;
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");

    const queries = createQueries(currentUser, types, searchText, sort, limit);

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries,
    );

    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { databases } = await createAdminClient();

  try {
    // SECURITY: Verify user owns the file
    await verifyFileOwnership(fileId, databases);

    const newName = `${name}.${extension}`;
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        name: newName,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { databases } = await createAdminClient();

  try {
    // SECURITY: Verify user owns the file before allowing shares
    await verifyFileOwnership(fileId, databases);

    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        users: emails,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to share file");
  }
};

// Soft-delete: moves file to trash instead of permanent deletion.
// File stays in Appwrite Storage. Auto-purged after 15 days.
export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases } = await createAdminClient();

  try {
    // SECURITY: Verify user owns the file before deletion
    await verifyFileOwnership(fileId, databases);

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
      },
    );

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to move file to trash");
  }
};

// ============================== TOTAL FILE SPACE USED
export async function getTotalSpaceUsed() {
  try {
    const { databases } = await createSessionClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [currentUser.$id]), Query.equal("isDeleted", false)],
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used:, ");
  }
}

// ============================== SHARED FILES
export const getSharedFiles = async () => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    // Files owned by current user that have been shared with others
    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [
        Query.equal("owner", [currentUser.$id]),
        Query.equal("isDeleted", false),
        Query.isNotNull("users"),
        Query.orderDesc("$updatedAt"),
      ],
    );

    // Filter to only files that actually have shared users
    const sharedFiles = files.documents.filter(
      (f) => Array.isArray(f.users) && f.users.length > 0,
    );

    return parseStringify(sharedFiles);
  } catch (error) {
    handleError(error, "Failed to get shared files");
  }
};

export const getSharedWithMeFiles = async () => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    // Files shared WITH the current user (not owned by them)
    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [
        Query.contains("users", [currentUser.email]),
        Query.notEqual("owner", currentUser.$id),
        Query.equal("isDeleted", false),
        Query.orderDesc("$updatedAt"),
      ],
    );

    return parseStringify(files.documents);
  } catch (error) {
    handleError(error, "Failed to get files shared with me");
  }
};

// ============================== DELETED / TRASH
export const getDeletedFiles = async () => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [
        Query.equal("owner", [currentUser.$id]),
        Query.equal("isDeleted", true),
        Query.orderDesc("deletedAt"),
      ],
    );

    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get deleted files");
  }
};

export const restoreFile = async ({ fileId, path }: RestoreFileProps) => {
  const { databases } = await createAdminClient();

  try {
    // SECURITY: Verify user owns the file before restoring
    await verifyFileOwnership(fileId, databases);

    const restoredFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        isDeleted: false,
        deletedAt: null,
      },
    );

    revalidatePath(path);
    return parseStringify(restoredFile);
  } catch (error) {
    handleError(error, "Failed to restore file");
  }
};

export const permanentlyDeleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: PermanentDeleteFileProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    // SECURITY: Verify user owns the file before permanently deleting
    await verifyFileOwnership(fileId, databases);

    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to permanently delete file");
  }
};

// Purge files that have been in trash for more than 15 days
export const purgeExpiredFiles = async () => {
  const { databases, storage } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [
        Query.equal("owner", [currentUser.$id]),
        Query.equal("isDeleted", true),
      ],
    );

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const expiredFiles = files.documents.filter(
      (f) => f.deletedAt && new Date(f.deletedAt) < fifteenDaysAgo,
    );

    let purgedCount = 0;
    for (const file of expiredFiles) {
      try {
        await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.filesCollectionId,
          file.$id,
        );
        await storage.deleteFile(appwriteConfig.bucketId, file.bucketFileId);
        purgedCount++;
      } catch (err) {
        console.error(`Failed to purge file ${file.$id}:`, err);
      }
    }

    return parseStringify({ purgedCount, totalExpired: expiredFiles.length });
  } catch (error) {
    handleError(error, "Failed to purge expired files");
  }
};

// ============================== STAR / UNSTAR FILE
export const toggleStarFile = async ({
  fileId,
  isStarred,
  path,
}: ToggleStarFileProps) => {
  const { databases } = await createAdminClient();

  try {
    // SECURITY: Verify user owns the file before starring
    await verifyFileOwnership(fileId, databases);

    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { isStarred: !isStarred },
    );

    revalidatePath(path);
    return parseStringify(updated);
  } catch (error) {
    handleError(error, "Failed to toggle star on file");
  }
};

// ============================== MOVE FILE TO FOLDER
export const moveFileToFolder = async ({
  fileId,
  folderId,
  path,
}: MoveFileToFolderProps) => {
  const { databases } = await createAdminClient();

  try {
    // SECURITY: Verify user owns the file before moving
    await verifyFileOwnership(fileId, databases);

    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { folderId: folderId ?? null },
    );

    revalidatePath(path);
    return parseStringify(updated);
  } catch (error) {
    handleError(error, "Failed to move file to folder");
  }
};

// ============================== GET STARRED FILES
export const getStarredFiles = async () => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [
        Query.equal("owner", [currentUser.$id]),
        Query.equal("isStarred", true),
        Query.equal("isDeleted", false),
        Query.orderDesc("$updatedAt"),
      ],
    );

    return parseStringify(files.documents);
  } catch (error) {
    handleError(error, "Failed to get starred files");
  }
};
