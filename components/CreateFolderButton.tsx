"use client";

import { useState } from "react";
import CreateFolderModal from "@/components/CreateFolderModal";

const CreateFolderButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-3.5 py-2 text-[13px] font-medium text-[#64748b] transition-all hover:border-[#16a34a]/40 hover:text-[#16a34a] hover:bg-[#f0fdf4] shadow-sm"
      >
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
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Folder
      </button>
      <CreateFolderModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default CreateFolderButton;
