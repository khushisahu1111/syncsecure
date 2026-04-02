/* eslint-disable no-unused-vars */

declare type FileType = "document" | "image" | "video" | "audio" | "other";

declare interface ActionType {
  label: string;
  icon: string;
  value: string;
}

declare interface SearchParamProps {
  params?: Promise<SegmentParams>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

declare interface UploadFileProps {
  file: File;
  ownerId: string;
  accountId: string;
  path: string;
  isEncrypted?: boolean; // opt-in; defaults to false — all existing uploads unaffected
  folderId?: string;     // opt-in; omit for root-level uploads
}
declare interface GetFilesProps {
  types: FileType[];
  searchText?: string;
  sort?: string;
  limit?: number;
}
declare interface RenameFileProps {
  fileId: string;
  name: string;
  extension: string;
  path: string;
}
declare interface UpdateFileUsersProps {
  fileId: string;
  emails: string[];
  path: string;
}
declare interface DeleteFileProps {
  fileId: string;
  bucketFileId: string;
  path: string;
}

declare interface FileUploaderProps {
  ownerId: string;
  accountId: string;
  className?: string;
}

declare interface MobileNavigationProps {
  ownerId: string;
  accountId: string;
  fullName: string;
  avatar: string;
  email: string;
}
declare interface SidebarProps {
  fullName: string;
  avatar: string;
  email: string;
}

declare interface ThumbnailProps {
  type: string;
  extension: string;
  url: string;
  className?: string;
  imageClassName?: string;
}

declare interface ShareInputProps {
  file: Models.Document;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (email: string) => void;
}

// ============================== SHARED & DELETED FEATURES
declare interface RestoreFileProps {
  fileId: string;
  path: string;
}

declare interface PermanentDeleteFileProps {
  fileId: string;
  bucketFileId: string;
  path: string;
}

// ============================== FOLDER & STARRED FEATURES

declare interface CreateFolderProps {
  name: string;
  path: string;
}

declare interface RenameFolderProps {
  folderId: string;
  name: string;
  path: string;
}

declare interface DeleteFolderProps {
  folderId: string;
  path: string;
}

declare interface ToggleStarFileProps {
  fileId: string;
  isStarred: boolean;
  path: string;
}

declare interface MoveFileToFolderProps {
  fileId: string;
  folderId: string | null;
  path: string;
}

