"use client";

import React, { useState } from "react";
import { Models } from "node-appwrite";
import Image from "next/image";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { convertFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  restoreFile,
  permanentlyDeleteFile,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";

const DeletedFileCard = ({ file }: { file: Models.Document }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<"restore" | "delete" | null>(null);
  const path = usePathname();

  // Calculate days remaining before auto-purge
  const deletedDate = file.deletedAt ? new Date(file.deletedAt) : new Date();
  const now = new Date();
  const daysSinceDeletion = Math.floor(
    (now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const daysRemaining = Math.max(0, 15 - daysSinceDeletion);

  const handleRestore = async () => {
    setAction("restore");
    setIsLoading(true);
    try {
      await restoreFile({ fileId: file.$id, path });
    } catch (error) {
      console.error("Failed to restore file:", error);
    }
    setIsLoading(false);
    setAction(null);
  };

  const handlePermanentDelete = async () => {
    setAction("delete");
    setIsLoading(true);
    try {
      await permanentlyDeleteFile({
        fileId: file.$id,
        bucketFileId: file.bucketFileId,
        path,
      });
    } catch (error) {
      console.error("Failed to permanently delete file:", error);
    }
    setIsLoading(false);
    setAction(null);
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#e2e8f0] bg-white p-4 transition-all hover:border-red-200 hover:shadow-sm">
      {/* File thumbnail */}
      <Thumbnail type={file.type} extension={file.extension} url={file.url} />

      {/* File info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#0f172a] line-clamp-1">
          {file.name}
        </p>
        <p className="text-[11px] text-[#94a3b8]">
          {convertFileSize(file.size)}
        </p>
      </div>

      {/* Deletion date */}
      <div className="hidden sm:flex flex-col gap-1">
        <p className="text-[11px] font-medium text-red-400 uppercase tracking-wider">
          Deleted
        </p>
        <FormattedDateTime
          date={file.deletedAt}
          className="text-[12px] text-[#8A7A65]"
        />
      </div>

      {/* Days remaining badge */}
      <div className="hidden md:flex items-center">
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-medium ${
            daysRemaining <= 3
              ? "bg-red-100 text-red-600"
              : "bg-[#f0fdf4] text-[#16a34a]"
          }`}
        >
          {daysRemaining}d left
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Restore */}
        <Button
          onClick={handleRestore}
          disabled={isLoading}
          className="h-8 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3 text-[12px] font-medium text-[#16a34a] hover:bg-[#dcfce7] transition-colors"
        >
          {isLoading && action === "restore" ? (
            <Image
              src="/assets/icons/loader.svg"
              alt="loader"
              width={16}
              height={16}
              className="animate-spin"
            />
          ) : (
            "Restore"
          )}
        </Button>

        {/* Permanently Delete */}
        <Button
          onClick={handlePermanentDelete}
          disabled={isLoading}
          className="h-8 rounded-xl border border-red-200 bg-red-50 px-3 text-[12px] font-medium text-red-600 hover:bg-red-100 transition-colors"
        >
          {isLoading && action === "delete" ? (
            <Image
              src="/assets/icons/loader.svg"
              alt="loader"
              width={16}
              height={16}
              className="animate-spin"
            />
          ) : (
            "Delete Forever"
          )}
        </Button>
      </div>
    </div>
  );
};

export default DeletedFileCard;
