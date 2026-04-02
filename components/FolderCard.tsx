"use client";

import Link from "next/link";
import { Models } from "node-appwrite";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { renameFolder, deleteFolder, toggleStarFolder } from "@/lib/actions/folder.actions";

interface Props {
  folder: Models.Document;
}

const FolderCard = ({ folder }: Props) => {
  const path = usePathname();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarred, setIsStarred] = useState(folder.isStarred ?? false);

  const handleRename = async () => {
    if (!newName.trim()) return;
    setIsLoading(true);
    await renameFolder({ folderId: folder.$id, name: newName.trim(), path });
    setIsLoading(false);
    setIsRenameOpen(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    await deleteFolder({ folderId: folder.$id, path });
    setIsLoading(false);
    setIsDeleteOpen(false);
  };

  const handleToggleStar = async () => {
    setIsStarred((prev: boolean) => !prev);
    await toggleStarFolder(folder.$id, isStarred, path);
  };

  return (
    <>
      <div className="group relative flex flex-col rounded-2xl border border-[#e2e8f0] bg-white p-4 transition-all duration-200 hover:border-[#16a34a]/30 hover:shadow-md hover:-translate-y-0.5">
        {/* Star badge */}
        {isStarred && (
          <span className="absolute top-2.5 right-8 text-[#16a34a] text-xs">★</span>
        )}

        {/* Folder icon + name */}
        <Link href={`/folders/${folder.$id}`} className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f0fdf4]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="line-clamp-1 text-center text-[13px] font-semibold text-[#0f172a]">
            {folder.name}
          </p>
        </Link>

        {/* 3-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-[#f1f5f9]">
            <Image src="/assets/icons/dots.svg" alt="options" width={18} height={18} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-xl border-[#e2e8f0] shadow-xl">
            <DropdownMenuItem onClick={() => setIsRenameOpen(true)} className="rounded-lg">
              <div className="flex items-center gap-2 text-[13px]">
                <Image src="/assets/icons/edit.svg" alt="rename" width={15} height={15} />
                Rename
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleStar} className="rounded-lg">
              <div className="flex items-center gap-2 text-[13px]">
                <span className="text-[#16a34a] text-[13px]">{isStarred ? "★" : "☆"}</span>
                {isStarred ? "Unstar" : "Star"}
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="rounded-lg text-red-500">
              <div className="flex items-center gap-2 text-[13px]">
                <Image src="/assets/icons/delete.svg" alt="delete" width={15} height={15} />
                Delete
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Rename dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="shad-dialog button">
          <DialogHeader>
            <DialogTitle className="text-center text-[#0f172a] font-semibold">
              Rename Folder
            </DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            className="rounded-xl border-[#e2e8f0] focus:border-[#16a34a]/50"
          />
          <DialogFooter className="flex gap-3">
            <Button onClick={() => setIsRenameOpen(false)} className="flex-1 h-[44px] border border-[#e2e8f0] bg-transparent text-[#64748b] hover:bg-[#f1f5f9] rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={isLoading} className="flex-1 h-[44px] bg-[#16a34a] text-white hover:bg-[#15803d] rounded-xl">
              {isLoading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="shad-dialog button">
          <DialogHeader>
            <DialogTitle className="text-center text-[#0f172a] font-semibold">
              Delete Folder
            </DialogTitle>
            <p className="text-center text-[13px] text-[#64748b] mt-1">
              Delete{" "}
              <span className="font-semibold text-[#16a34a]">{folder.name}</span>?
              {" "}Files inside will not be deleted.
            </p>
          </DialogHeader>
          <DialogFooter className="flex gap-3">
            <Button onClick={() => setIsDeleteOpen(false)} className="flex-1 h-[44px] border border-[#e2e8f0] bg-transparent text-[#64748b] hover:bg-[#f1f5f9] rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={isLoading} className="flex-1 h-[44px] bg-red-500 text-white hover:bg-red-600 rounded-xl">
              {isLoading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FolderCard;
