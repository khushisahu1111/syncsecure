"use client";

import React, { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "@/components/Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";

interface Props {
  ownerId: string;
  accountId: string;
  folderId: string;
  folderName: string;
  className?: string;
}

const FolderFileUploader = ({
  ownerId,
  accountId,
  folderId,
  folderName,
  className,
}: Props) => {
  const path = usePathname();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);

      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((prevFiles) =>
            prevFiles.filter((f) => f.name !== file.name),
          );
          return toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span> is too large.
                Max file size is 50MB.
              </p>
            ),
            className: "error-toast",
          });
        }

        // Upload with folderId so the file is associated with the folder
        return uploadFile({
          file,
          ownerId,
          accountId,
          path,
          folderId,
        })
          .then((uploadedFile) => {
            if (uploadedFile) {
              setFiles((prevFiles) =>
                prevFiles.filter((f) => f.name !== file.name),
              );
            }
          })
          .catch((err: unknown) => {
            console.error("[FolderFileUploader] Upload failed:", err);
            // Remove the stuck file preview immediately on failure
            setFiles((prevFiles) =>
              prevFiles.filter((f) => f.name !== file.name),
            );
            toast({
              description: (
                <p className="body-2 text-white">
                  Failed to upload{" "}
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
    [ownerId, accountId, path, folderId],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleRemoveFile = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    fileName: string,
  ) => {
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div {...getRootProps()} className={cn("cursor-pointer", className)}>
      <input {...getInputProps()} />
      <Button
        type="button"
        className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-3.5 py-2 text-[13px] font-medium text-[#64748b] shadow-sm transition-all hover:border-[#16a34a]/40 hover:text-[#16a34a] hover:bg-[#f0fdf4]"
      >
        <Image
          src="/assets/icons/upload.svg"
          alt="upload"
          width={16}
          height={16}
        />
        Upload to &quot;{folderName}&quot;
      </Button>

      {files.length > 0 && typeof document !== "undefined" && createPortal(
        <ul className="uploader-preview-list" onClick={(e) => e.stopPropagation()}>
          <h4
            className="text-[16px] font-semibold text-charcoal mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Uploading to {folderName}
          </h4>

          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);
            return (
              <li
                key={`${file.name}-${index}`}
                className="uploader-preview-item"
              >
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />
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

export default FolderFileUploader;
