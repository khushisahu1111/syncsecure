import { Models } from "node-appwrite";
import { Separator } from "@/components/ui/separator";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import ActionDropdown from "@/components/ActionDropdown";
import {
  getSharedFiles,
  getSharedWithMeFiles,
} from "@/lib/actions/file.actions";
import { convertFileSize } from "@/lib/utils";

const SharedPage = async () => {
  const [sharedByMe, sharedWithMe] = await Promise.all([
    getSharedFiles(),
    getSharedWithMeFiles(),
  ]);

  return (
    <div className="page-container">
      <section className="w-full">
        <h1
          className="text-[34px] leading-[42px] font-bold text-[#2C2C2C]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Shared Files
        </h1>
      </section>

      {/* ===== FILES I SHARED ===== */}
      <section className="mt-8 w-full">
        <h2
          className="text-[22px] leading-[30px] font-semibold text-[#2C2C2C] mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Files I Shared
        </h2>

        {sharedByMe && sharedByMe.length > 0 ? (
          <div className="flex flex-col gap-3">
            {sharedByMe.map((file: Models.Document) => (
              <div
                key={file.$id}
                className="flex items-center gap-4 rounded-xl border border-[#E8DCC8] bg-white p-4 transition-colors hover:border-[#C5A059]/50"
              >
                <Thumbnail
                  type={file.type}
                  extension={file.extension}
                  url={file.url}
                />

                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#2C2C2C] line-clamp-1">
                    {file.name}
                  </p>
                  <p className="text-[12px] text-[#8A7A65]">
                    {convertFileSize(file.size)}
                  </p>
                </div>

                {/* Shared with */}
                <div className="hidden sm:flex flex-col gap-1 max-w-[200px]">
                  <p className="text-[11px] font-medium text-[#C5A059] uppercase tracking-wider">
                    Shared with
                  </p>
                  {file.users.slice(0, 3).map((email: string) => (
                    <p
                      key={email}
                      className="text-[12px] text-[#5C5142] truncate"
                    >
                      {email}
                    </p>
                  ))}
                  {file.users.length > 3 && (
                    <p className="text-[11px] text-[#C5A059]">
                      +{file.users.length - 3} more
                    </p>
                  )}
                </div>

                {/* Date */}
                <div className="hidden md:block">
                  <FormattedDateTime
                    date={file.$updatedAt}
                    className="text-[12px] text-[#8A7A65]"
                  />
                </div>

                <ActionDropdown file={file} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#C5A059]/40 bg-[#FDFBF7] py-12">
            <p className="text-[16px] text-[#8A7A65] font-light tracking-wide">
              No files shared by you
            </p>
          </div>
        )}
      </section>

      <Separator className="my-8 bg-ivory-border" />

      {/* ===== FILES SHARED WITH ME ===== */}
      <section className="w-full">
        <h2
          className="text-[22px] leading-[30px] font-semibold text-[#2C2C2C] mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Shared With Me
        </h2>

        {sharedWithMe && sharedWithMe.length > 0 ? (
          <div className="flex flex-col gap-3">
            {sharedWithMe.map((file: Models.Document) => (
              <div
                key={file.$id}
                className="flex items-center gap-4 rounded-xl border border-[#E8DCC8] bg-white p-4 transition-colors hover:border-[#C5A059]/50"
              >
                <Thumbnail
                  type={file.type}
                  extension={file.extension}
                  url={file.url}
                />

                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#2C2C2C] line-clamp-1">
                    {file.name}
                  </p>
                  <p className="text-[12px] text-[#8A7A65]">
                    {convertFileSize(file.size)}
                  </p>
                </div>

                {/* Owner info */}
                <div className="hidden sm:flex flex-col gap-1">
                  <p className="text-[11px] font-medium text-[#C5A059] uppercase tracking-wider">
                    From
                  </p>
                  <p className="text-[12px] text-[#5C5142]">
                    {file.owner?.fullName || "Unknown"}
                  </p>
                </div>

                <div className="hidden md:block">
                  <FormattedDateTime
                    date={file.$updatedAt}
                    className="text-[12px] text-[#8A7A65]"
                  />
                </div>

                <ActionDropdown file={file} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#C5A059]/40 bg-[#FDFBF7] py-12">
            <p className="text-[16px] text-[#8A7A65] font-light tracking-wide">
              No files shared with you
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SharedPage;
