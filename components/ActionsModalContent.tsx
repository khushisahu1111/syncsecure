import { Models } from "node-appwrite";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const ImageThumbnail = ({ file }: { file: Models.Document }) => (
  <div className="file-details-thumbnail">
    <Thumbnail type={file.type} extension={file.extension} url={file.url} />
    <div className="flex flex-col">
      <p className="subtitle-2 mb-1">{file.name}</p>
      <FormattedDateTime date={file.$createdAt} className="caption" />
    </div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <p className="file-details-label text-left">{label}</p>
    <p className="file-details-value text-left">{value}</p>
  </div>
);

export const FileDetails = ({ file }: { file: Models.Document }) => {
  return (
    <>
      <ImageThumbnail file={file} />
      <div className="space-y-4 px-2 pt-2">
        <DetailRow label="Format:" value={file.extension} />
        <DetailRow label="Size:" value={convertFileSize(file.size)} />
        <DetailRow label="Owner:" value={file.owner.fullName} />
        <DetailRow label="Last edit:" value={formatDateTime(file.$updatedAt)} />
        <DetailRow
          label="Encrypted:"
          value={file.isEncrypted ? "Yes 🔒" : "No"}
        />
      </div>
    </>
  );
};

interface Props {
  file: Models.Document;
  onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRemove: (email: string) => void;
}

export const ShareInput = ({ file, onInputChange, onRemove }: Props) => {
  return (
    <>
      <ImageThumbnail file={file} />

      <div className="share-wrapper">
        <p className="subtitle-2 pl-1 text-latte">
          Share file with other users
        </p>
        <Input
          type="email"
          placeholder="Enter email address"
          onChange={(e) => onInputChange(e.target.value.trim().split(","))}
          className="share-input-field"
        />
        <div className="pt-4">
          <div className="flex justify-between">
            <p className="subtitle-2 text-latte">Shared with</p>
            <p className="subtitle-2 text-latte-dark">
              {file.users.length} users
            </p>
          </div>

          <ul className="pt-2">
            {file.users.map((email: string) => (
              <li
                key={email}
                className="flex items-center justify-between gap-2"
              >
                <p className="subtitle-2">{email}</p>
                <Button
                  onClick={() => onRemove(email)}
                  className="share-remove-user"
                >
                  <Image
                    src="/assets/icons/remove.svg"
                    alt="Remove"
                    width={24}
                    height={24}
                    className="remove-icon"
                  />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

interface MoveProps {
  file: Models.Document;
  folders: Models.Document[];
  onSelectFolder: (folderId: string) => void;
  selectedFolderId: string;
}

export const MoveToFolderInput = ({ file, folders, onSelectFolder, selectedFolderId }: MoveProps) => {
  return (
    <>
      <ImageThumbnail file={file} />
      <div className="share-wrapper mt-4">
        <p className="subtitle-2 pl-1 text-latte text-[#2C2C2C]">
          Select destination folder
        </p>
        <div className="flex flex-col gap-2 pt-2 max-h-[200px] overflow-y-auto">
          {/* Option to move to root (Dashboard) */}
          <button
             onClick={() => onSelectFolder("")}
             className={`flex items-center gap-3 rounded-xl p-3 w-full text-left transition-colors border ${
              selectedFolderId === ""
                ? "border-[#16a34a]/50 bg-[#f0fdf4]"
                : "border-[#e2e8f0] hover:border-[#16a34a]/30 hover:bg-[#f8fafc]"
            }`}
          >
            <Image src="/assets/icons/dashboard.svg" alt="root" width={20} height={20} />
            <p className="text-[13px] font-medium text-[#0f172a]">Dashboard (Root)</p>
          </button>
          
          {folders.length === 0 && (
            <p className="text-[12px] text-[#94a3b8] italic py-2 pl-1">No folders found. Create one first.</p>
          )}

          {folders.map((folder) => (
            <button
               key={folder.$id}
               onClick={() => onSelectFolder(folder.$id)}
               className={`flex items-center gap-3 rounded-xl p-3 w-full text-left transition-colors border ${
                selectedFolderId === folder.$id
                  ? "border-[#16a34a]/50 bg-[#f0fdf4]"
                  : "border-[#e2e8f0] hover:border-[#16a34a]/30 hover:bg-[#f8fafc]"
              }`}
            >
              <Image src="/assets/icons/documents.svg" alt="folder" width={20} height={20} />
              <p className="text-[13px] font-medium text-[#0f172a]">{folder.name}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
