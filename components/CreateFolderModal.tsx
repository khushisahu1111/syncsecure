"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createFolder } from "@/lib/actions/folder.actions";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreateFolderModal = ({ isOpen, onClose }: Props) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const path = usePathname();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      await createFolder({ name: name.trim(), path });
      setName("");
      onClose();
    } catch (e) {
      console.error("Failed to create folder:", e);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-[#0f172a] font-semibold">
            Create New Folder
          </DialogTitle>
          <Input
            type="text"
            placeholder="Folder name…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-3 md:flex-row">
          <Button
            onClick={onClose}
            className="h-[48px] flex-1 rounded-xl border border-[#e2e8f0] bg-transparent text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isLoading}
            className="h-[48px] flex-1 rounded-xl bg-[#16a34a] text-white hover:bg-[#15803d] transition-colors"
          >
            {isLoading ? (
              <Image
                src="/assets/icons/loader.svg"
                alt="loader"
                width={20}
                height={20}
                className="animate-spin"
              />
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;
