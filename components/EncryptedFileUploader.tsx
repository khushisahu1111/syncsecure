"use client";

import React, { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "@/components/Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";

interface Props {
  ownerId: string;
  accountId: string;
  className?: string;
}

/**
 * EncryptedFileUploader — drop files here to upload them AES-256-GCM encrypted.
 * The original FileUploader is completely untouched.
 * Encryption happens server-side; users never interact with keys or passwords.
 */
const EncryptedFileUploader = ({ ownerId, accountId, className }: Props) => {
  const path = usePathname();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);

      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((prev) => prev.filter((f) => f.name !== file.name));
          return toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span> is too large.
                Max file size is 50 MB.
              </p>
            ),
            className: "error-toast",
          });
        }

        // Pass isEncrypted: true — the server action handles encryption
        return uploadFile({
          file,
          ownerId,
          accountId,
          path,
          isEncrypted: true,
        })
          .then((uploadedFile) => {
            if (uploadedFile) {
              setFiles((prev) => prev.filter((f) => f.name !== file.name));
            }
          })
          .catch((err: unknown) => {
            console.error("[EncryptedFileUploader] Upload failed:", err);
            // Remove the stuck file preview immediately on failure
            setFiles((prev) => prev.filter((f) => f.name !== file.name));
            toast({
              description: (
                <p className="body-2 text-white">
                  Failed to encrypt & upload{" "}
                  <span className="font-semibold">{file.name}</span>. Please
                  try again.
                </p>
              ),
              className: "error-toast",
            });
          });
      });

      await Promise.all(uploadPromises);
    },
    [ownerId, accountId, path],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleRemoveFile = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    fileName: string,
  ) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />

      {/* Encrypted upload button — visually distinct from the plain upload button */}
      <Button
        type="button"
        className={cn(
          "flex items-center gap-2 rounded-md border border-[#C5A059]/60 bg-[#C5A059]/10 px-4 py-2 text-sm font-medium text-[#C5A059] transition-all hover:bg-[#C5A059]/20",
          className,
        )}
      >
        {/* Shield / lock icon using an inline SVG so no extra asset is needed */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>Upload Encrypted</span>
      </Button>

      {/* Preview list while uploading */}
      {files.length > 0 && typeof document !== "undefined" && createPortal(
        <ul className="uploader-preview-list" onClick={(e) => e.stopPropagation()}>
          <h4
            className="text-[16px] font-semibold text-charcoal mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Encrypting &amp; Uploading
          </h4>

          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);
            return (
              <li
                key={`${file.name}-${index}`}
                className="uploader-preview-item"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Thumbnail
                      type={type}
                      extension={extension}
                      url=""
                    />
                    {/* Lock badge overlay */}
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C5A059] text-white text-[8px]">
                      🔒
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 items-start">
                    <span className="subtitle-2 line-clamp-1 max-w-[200px] sm:max-w-[250px] text-charcoal">
                      {file.name}
                    </span>
                    <Image
                      src="/assets/icons/file-loader.gif"
                      width={80}
                      height={26}
                      alt="Loader"
                    />
                  </div>
                </div>

                <Image
                  src="/assets/icons/remove.svg"
                  width={22}
                  height={22}
                  alt="Remove"
                  onClick={(e) => handleRemoveFile(e, file.name)}
                />
              </li>
            );
          })}
        </ul>,
        document.body
      )}
    </div>
  );
};

export default EncryptedFileUploader;
