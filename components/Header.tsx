import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";
import EncryptedFileUploader from "@/components/EncryptedFileUploader";
import { signOutUser } from "@/lib/actions/user.actions";

const Header = ({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}) => {
  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        {/* Standard upload — unchanged */}
        <FileUploader ownerId={userId} accountId={accountId} />

        {/* Encrypted upload — isolated new component */}
        <EncryptedFileUploader ownerId={userId} accountId={accountId} />

        <form
          action={async () => {
            "use server";
            await signOutUser();
          }}
        >
          <Button type="submit" className="sign-out-button">
            <Image
              src="/assets/icons/logout.svg"
              alt="logo"
              width={18}
              height={18}
              className="w-[18px] opacity-60"
            />
          </Button>
        </form>
      </div>
    </header>
  );
};
export default Header;
