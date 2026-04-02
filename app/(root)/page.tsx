import Link from "next/link";
import { Models } from "node-appwrite";
import { FileText, Image as ImageIcon, Film, Database } from "lucide-react";

import ActionDropdown from "@/components/ActionDropdown";
import { Chart } from "@/components/Chart";
import { FormattedDateTime } from "@/components/FormattedDateTime";
import { Thumbnail } from "@/components/Thumbnail";
import { Separator } from "@/components/ui/separator";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { convertFileSize, getUsageSummary } from "@/lib/utils";

const Dashboard = async () => {
  // Parallel requests
  const [files, totalSpace] = await Promise.all([
    getFiles({ types: [], limit: 10 }),
    getTotalSpaceUsed(),
  ]);

  // Get usage summary
  const usageSummary = getUsageSummary(totalSpace);

  return (
    <div className="dashboard-container">
      <section>
        <Chart used={totalSpace.used} />

        {/* Storage type summaries */}
        <ul className="dashboard-summary-list">
          {usageSummary.map((summary) => (
            <Link
              href={summary.url}
              key={summary.title}
              className="dashboard-summary-card"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center justify-center p-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc]">
                     {summary.title === 'Documents' && <FileText className="w-5 h-5 text-charcoal" />}
                     {summary.title === 'Images' && <ImageIcon className="w-5 h-5 text-charcoal" />}
                     {summary.title === 'Media' && <Film className="w-5 h-5 text-charcoal" />}
                     {summary.title === 'Others' && <Database className="w-5 h-5 text-charcoal" />}
                  </div>
                  <h4 className="summary-type-size">
                    {convertFileSize(summary.size) || 0}
                  </h4>
                </div>

                <h5 className="summary-type-title">{summary.title}</h5>
                <Separator className="bg-[#e2e8f0]" />
                <FormattedDateTime
                  date={summary.latestDate}
                  className="text-center text-[12px] text-[#94a3b8]"
                />
              </div>
            </Link>
          ))}
        </ul>
      </section>

      {/* Recent files */}
      <section className="dashboard-recent-files">
        <h2 className="h3 xl:h2 text-[#0f172a] font-semibold">
          Recent Files
        </h2>
        {files.documents.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-4">
            {files.documents.map((file: Models.Document) => (
              // Encrypted files must NOT link to the raw Appwrite URL (ciphertext).
              // Use "Decrypt & Download" from the ActionDropdown (⋯ menu) instead.
              file.isEncrypted ? (
                <div
                  key={file.$id}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 cursor-default select-none"
                >
                  <div className="relative">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                    />
                    {/* Lock badge */}
                    <span
                      title="Encrypted file"
                      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#16a34a] text-[8px] text-white"
                    >
                      🔒
                    </span>
                  </div>

                  <div className="recent-file-details">
                    <div className="flex flex-col gap-1">
                      <p className="recent-file-name">{file.name}</p>
                      <FormattedDateTime
                        date={file.$createdAt}
                        className="caption"
                      />
                    </div>
                    <ActionDropdown file={file} />
                  </div>
                </div>
              ) : (
                <Link
                  href={file.url}
                  target="_blank"
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#f8fafc]"
                  key={file.$id}
                >
                  <Thumbnail
                    type={file.type}
                    extension={file.extension}
                    url={file.url}
                  />

                  <div className="recent-file-details">
                    <div className="flex flex-col gap-1">
                      <p className="recent-file-name">{file.name}</p>
                      <FormattedDateTime
                        date={file.$createdAt}
                        className="caption"
                      />
                    </div>
                    <ActionDropdown file={file} />
                  </div>
                </Link>
              )
            ))}
          </ul>
        ) : (
          <p className="empty-list">No files uploaded yet</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
