"use server";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

// ============================== CREATE FOLDER
export const createFolder = async ({ name, path }: CreateFolderProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const folder = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      ID.unique(),
      {
        name: name.trim(),
        owner: currentUser.$id,
        isStarred: false,
        isDeleted: false,
      },
    );

    revalidatePath(path);
    return parseStringify(folder);
  } catch (error) {
    handleError(error, "Failed to create folder");
  }
};

// ============================== GET ALL FOLDERS
export const getFolders = async () => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const folders = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      [
        Query.equal("owner", currentUser.$id),
        Query.equal("isDeleted", false),
        Query.orderDesc("$createdAt"),
      ],
    );

    return parseStringify(folders);
  } catch (error) {
    handleError(error, "Failed to get folders");
  }
};

// ============================== GET FILES INSIDE A FOLDER
export const getFilesInFolder = async (folderId: string) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [
        Query.equal("owner", [currentUser.$id]),
        Query.equal("folderId", folderId),
        Query.equal("isDeleted", false),
        Query.orderDesc("$createdAt"),
      ],
    );

    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files in folder");
  }
};

// ============================== RENAME FOLDER
export const renameFolder = async ({
  folderId,
  name,
  path,
}: RenameFolderProps) => {
  const { databases } = await createAdminClient();

  try {
    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      folderId,
      { name: name.trim() },
    );

    revalidatePath(path);
    return parseStringify(updated);
  } catch (error) {
    handleError(error, "Failed to rename folder");
  }
};

// ============================== DELETE FOLDER (soft delete)
export const deleteFolder = async ({ folderId, path }: DeleteFolderProps) => {
  const { databases } = await createAdminClient();

  try {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      folderId,
      { isDeleted: true },
    );

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete folder");
  }
};

// ============================== TOGGLE STAR FOLDER
export const toggleStarFolder = async (
  folderId: string,
  isStarred: boolean,
  path: string,
) => {
  const { databases } = await createAdminClient();

  try {
    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      folderId,
      { isStarred: !isStarred },
    );

    revalidatePath(path);
    return parseStringify(updated);
  } catch (error) {
    handleError(error, "Failed to toggle star on folder");
  }
};

// ============================== GET STARRED FOLDERS
export const getStarredFolders = async () => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const folders = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      [
        Query.equal("owner", currentUser.$id),
        Query.equal("isStarred", true),
        Query.equal("isDeleted", false),
        Query.orderDesc("$updatedAt"),
      ],
    );

    return parseStringify(folders);
  } catch (error) {
    handleError(error, "Failed to get starred folders");
  }
};
