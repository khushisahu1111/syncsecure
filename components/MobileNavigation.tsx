"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Separator } from "@radix-ui/react-separator";
import { navItems } from "@/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/FileUploader";
import EncryptedFileUploader from "@/components/EncryptedFileUploader";
import { signOutUser } from "@/lib/actions/user.actions";

interface Props {
  $id: string;
  accountId: string;
  fullName: string;
  avatar: string;
  email: string;
}

const MobileNavigation = ({
  $id: ownerId,
  accountId,
  fullName,
  avatar,
  email,
}: Props) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="mobile-header">
      {/* Mobile brand mark */}
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#16a34a]">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
            <path d="M10 2L17 6V14L10 18L3 14V6L10 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-[15px] font-bold text-[#0f172a] tracking-tight">
          SyncSecure
        </span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Image
            src="/assets/icons/menu.svg"
            alt="Menu"
            width={26}
            height={26}
          />
        </SheetTrigger>
        <SheetContent className="shad-sheet h-screen px-4">
          <SheetTitle>
            <div className="header-user">
              <Image
                src={avatar}
                alt="avatar"
                width={40}
                height={40}
                className="header-user-avatar"
              />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#0f172a] capitalize truncate">
                  {fullName}
                </p>
                <p className="text-[11px] text-[#94a3b8] truncate">{email}</p>
              </div>
            </div>
            <Separator className="mb-4 h-px bg-[#e2e8f0]" />
          </SheetTitle>

          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              {navItems.map(({ url, name, icon }) => (
                <Link key={name} href={url} className="lg:w-full">
                  <li
                    className={cn(
                      "mobile-nav-item",
                      pathname === url && "shad-active",
                    )}
                  >
                    <Image
                      src={icon}
                      alt={name}
                      width={22}
                      height={22}
                      className={cn(
                        "nav-icon",
                        pathname === url && "nav-icon-active",
                      )}
                    />
                    <p>{name}</p>
                  </li>
                </Link>
              ))}
            </ul>
          </nav>

          <Separator className="my-5 h-px bg-[#e2e8f0]" />

          <div className="flex flex-col justify-between gap-4 pb-5">
            <FileUploader ownerId={ownerId} accountId={accountId} />
            <EncryptedFileUploader ownerId={ownerId} accountId={accountId} />
            <Button
              type="submit"
              className="mobile-sign-out-button"
              onClick={async () => await signOutUser()}
            >
              <Image
                src="/assets/icons/logout.svg"
                alt="logout"
                width={22}
                height={22}
              />
              <p>Sign Out</p>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileNavigation;
