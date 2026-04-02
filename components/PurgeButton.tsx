"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { purgeExpiredFiles } from "@/lib/actions/file.actions";
import Image from "next/image";

const PurgeButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    purgedCount: number;
    totalExpired: number;
  } | null>(null);

  const handlePurge = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await purgeExpiredFiles();
      if (res) setResult(res);
    } catch (error) {
      console.error("Failed to purge expired files:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-[12px] text-emerald-600 font-medium">
          {result.purgedCount > 0
            ? `Purged ${result.purgedCount} expired file${result.purgedCount > 1 ? "s" : ""}`
            : "No expired files to purge"}
        </span>
      )}

      <Button
        onClick={handlePurge}
        disabled={isLoading}
        className="h-9 rounded-md border border-red-300/50 bg-red-50 px-4 text-[12px] font-medium text-red-600 hover:bg-red-100 transition-colors gap-2"
      >
        {isLoading ? (
          <Image
            src="/assets/icons/loader.svg"
            alt="loader"
            width={16}
            height={16}
            className="animate-spin"
          />
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clean Up Expired
          </>
        )}
      </Button>
    </div>
  );
};

export default PurgeButton;
