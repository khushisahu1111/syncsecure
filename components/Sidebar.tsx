"use client";

import Link from "next/link";
import Image from "next/image";
import { navItems } from "@/constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  fullName: string;
  avatar: string;
  email: string;
}

const Sidebar = ({ fullName, avatar, email }: Props) => {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Brand mark */}
      <Link href="/" className="flex items-center gap-2.5 px-1">
        {/* Icon mark — always visible */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16a34a] shrink-0 shadow-sm">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
          >
            <path
              d="M10 2L17 6V14L10 18L3 14V6L10 2Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M10 2V18"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
        </div>
        {/* Text — only on wide sidebar */}
        <span className="hidden lg:block text-[16px] font-bold tracking-tight text-[#0f172a]">
          SyncSecure
        </span>
      </Link>

      {/* Divider */}
      <div className="mt-5 hidden lg:block h-px bg-[#f1f5f9]" />

      <nav className="sidebar-nav">
        <ul className="flex flex-1 flex-col gap-0.5">
          {navItems.map(({ url, name, icon }) => (
            <Link key={name} href={url} className="lg:w-full">
              <li
                className={cn(
                  "sidebar-nav-item",
                  pathname === url && "shad-active",
                )}
              >
                <Image
                  src={icon}
                  alt={name}
                  width={18}
                  height={18}
                  className={cn(
                    "nav-icon",
                    pathname === url && "nav-icon-active",
                  )}
                />
                <p className="hidden lg:block">{name}</p>
              </li>
            </Link>
          ))}
        </ul>
      </nav>

      {/* User info */}
      <div className="sidebar-user-info">
        <Image
          src={avatar}
          alt="Avatar"
          width={32}
          height={32}
          className="sidebar-user-avatar"
        />
        <div className="hidden lg:block min-w-0">
          <p className="text-[13px] font-semibold text-[#0f172a] capitalize truncate">
            {fullName}
          </p>
          <p className="text-[11px] text-[#94a3b8] truncate">{email}</p>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
