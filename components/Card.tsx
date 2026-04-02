import { Models } from "node-appwrite";
import Link from "next/link";
import Thumbnail from "@/components/Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "@/components/FormattedDateTime";
import ActionDropdown from "@/components/ActionDropdown";

// ─── Encrypted-file icon ────────────────────────────────────────────────────
// Renders a styled container with a type-aware inline SVG + a subtle lock
// overlay. No external image is loaded, so there is no broken-image state.

function EncryptedTypeIcon({ type }: { type: string }) {
  // Colour / icon differs by file type so the card still feels contextual
  const config: Record<string, { bg: string; stroke: string; path: JSX.Element }> = {
    image: {
      bg: "from-violet-50 to-violet-100",
      stroke: "#7c3aed",
      path: (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </>
      ),
    },
    video: {
      bg: "from-blue-50 to-blue-100",
      stroke: "#2563eb",
      path: (
        <polygon points="23 7 16 12 23 17 23 7" />
      ),
    },
    audio: {
      bg: "from-pink-50 to-pink-100",
      stroke: "#db2777",
      path: (
        <>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </>
      ),
    },
    document: {
      bg: "from-amber-50 to-amber-100",
      stroke: "#d97706",
      path: (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </>
      ),
    },
  };

  const { bg, stroke, path } = config[type] ?? {
    bg: "from-slate-50 to-slate-100",
    stroke: "#64748b",
    path: (
      <>
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </>
    ),
  };

  return (
    <figure
      className={`!size-16 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center relative overflow-hidden shadow-sm border border-white/60`}
      title="Encrypted file"
    >
      {/* subtle pattern overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill={stroke} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* type icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10 drop-shadow-sm"
      >
        {path}
      </svg>

      {/* tiny lock badge bottom-right */}
      <span
        className="absolute bottom-1 right-1 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-white/90 shadow text-[8px]"
        style={{ fontSize: 7 }}
      >
        🔒
      </span>
    </figure>
  );
}

// ─── Card content ────────────────────────────────────────────────────────────

const CardContent = ({ file }: { file: Models.Document }) => (
  <>
    <div className="flex justify-between">
      <div className="relative">
        {file.isEncrypted ? (
          // Encrypted files get a styled inline icon — never a broken image
          <EncryptedTypeIcon type={file.type} />
        ) : (
          // Normal files keep their existing thumbnail behaviour untouched
          <Thumbnail
            type={file.type}
            extension={file.extension}
            url={file.url}
            className="!size-16"
            imageClassName="!size-10"
          />
        )}
        {/* Green lock badge top-right (only on encrypted cards, sits over the icon) */}
        {file.isEncrypted && (
          <span
            title="Encrypted file — use ⋯ menu to decrypt & download"
            className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#16a34a] text-[8px] text-white shadow z-20"
          >
            🔒
          </span>
        )}
      </div>

      <div className="flex flex-col items-end justify-between">
        <ActionDropdown file={file} />
        <span className="text-[12px] font-semibold text-[#16a34a] tabular-nums">
          {convertFileSize(file.size)}
        </span>
      </div>
    </div>

    <div className="file-card-details">
      <div className="flex items-center gap-1.5">
        <p className="subtitle-2 line-clamp-1 text-[#0f172a] flex-1">
          {file.name}
        </p>
        {file.isStarred && (
          <span className="text-[#16a34a] text-xs leading-none">★</span>
        )}
      </div>
      <FormattedDateTime
        date={file.$createdAt}
        className="text-[11px] text-[#94a3b8]"
      />
      <p className="text-[11px] leading-[16px] line-clamp-1 text-[#cbd5e1]">
        {file.owner.fullName}
      </p>
    </div>
  </>
);

const Card = ({ file }: { file: Models.Document }) => {
  if (file.isEncrypted) {
    return (
      <div className="file-card group cursor-default select-none">
        <CardContent file={file} />
      </div>
    );
  }

  return (
    <Link
      href={file.url}
      target="_blank"
      className="file-card group"
    >
      <CardContent file={file} />
    </Link>
  );
};

export default Card;
