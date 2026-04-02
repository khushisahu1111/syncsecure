"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import Image from "next/image";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
  toggleStarFile,
  moveFileToFolder,
} from "@/lib/actions/file.actions";
import { getFolders } from "@/lib/actions/folder.actions";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput, MoveToFolderInput } from "@/components/ActionsModalContent";

const ActionDropdown = ({ file }: { file: Models.Document }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [folders, setFolders] = useState<Models.Document[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");

  const path = usePathname();

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
    //   setEmails([]);
  };

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);
    let success = false;

    const actions = {
      rename: () =>
        renameFile({ fileId: file.$id, name, extension: file.extension, path }),
      share: () => updateFileUsers({ fileId: file.$id, emails, path }),
      delete: () =>
        deleteFile({ fileId: file.$id, bucketFileId: file.bucketFileId, path }),
      move: () =>
        moveFileToFolder({ fileId: file.$id, folderId: selectedFolderId, path }),
    };

    success = await actions[action.value as keyof typeof actions]();

    if (success) closeAllModals();

    setIsLoading(false);
  };

  const handleRemoveUser = async (email: string) => {
    const updatedEmails = emails.filter((e) => e !== email);

    const success = await updateFileUsers({
      fileId: file.$id,
      emails: updatedEmails,
      path,
    });

    if (success) setEmails(updatedEmails);
    closeAllModals();
  };

  const renderDialogContent = () => {
    if (!action) return null;

    const { value, label } = action;

    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle
            className="text-center text-[#0f172a] font-semibold"
          >
            {label}
          </DialogTitle>
          {value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmails}
              onRemove={handleRemoveUser}
            />
          )}
          {value === "move" && (
            <MoveToFolderInput
              file={file}
              folders={folders}
              onSelectFolder={setSelectedFolderId}
              selectedFolderId={selectedFolderId}
            />
          )}
          {value === "delete" && (
            <p className="text-center text-[13px] text-[#64748b]">
              Are you sure you want to move{` `}
              <span className="font-semibold text-[#16a34a]">{file.name}</span>{" "}
              to trash?
            </p>
          )}
        </DialogHeader>
        {["rename", "delete", "share", "move"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button
              onClick={closeAllModals}
              className="h-[48px] flex-1 rounded-xl border border-[#e2e8f0] bg-transparent text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              className="h-[48px] flex-1 rounded-xl bg-[#16a34a] text-white hover:bg-[#15803d] transition-colors"
            >
              <p className="capitalize">{value === "delete" ? "Move to Trash" : value}</p>
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((actionItem) => (
            <DropdownMenuItem
              key={actionItem.value}
              className="shad-dropdown-item"
              onClick={async () => {
                if (actionItem.value === "star") {
                  await toggleStarFile({
                    fileId: file.$id,
                    isStarred: file.isStarred ?? false,
                    path,
                  });
                  return;
                }

                if (actionItem.value === "move") {
                  const result = await getFolders();
                  setFolders(result?.documents ?? []);
                  setSelectedFolderId(file.folderId ?? "");
                }

                setAction(actionItem);

                if (
                  ["rename", "share", "delete", "details", "move"].includes(
                    actionItem.value,
                  )
                ) {
                  setIsModalOpen(true);
                }
              }}
            >
              {actionItem.value === "download" ? (
                file.isEncrypted ? (
                  // Encrypted file — route through our server-side decrypt API
                  <Link
                    href={`/api/decrypt?bucketFileId=${file.bucketFileId}&name=${encodeURIComponent(file.name)}`}
                    download={file.name}
                    className="flex items-center gap-2"
                  >
                    <Image
                      src={actionItem.icon}
                      alt={actionItem.label}
                      width={30}
                      height={30}
                    />
                    Decrypt &amp; Download
                  </Link>
                ) : (
                  // Regular file — direct Appwrite download URL (unchanged)
                  <Link
                    href={constructDownloadUrl(file.bucketFileId)}
                    download={file.name}
                    className="flex items-center gap-2"
                  >
                    <Image
                      src={actionItem.icon}
                      alt={actionItem.label}
                      width={30}
                      height={30}
                    />
                    {actionItem.label}
                  </Link>
                )
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.value === "star" && file.isStarred ? "Unstar" : actionItem.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
  );
};
export default ActionDropdown;
