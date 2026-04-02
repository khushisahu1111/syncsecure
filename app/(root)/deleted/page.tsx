import { Models } from "node-appwrite";
import { getDeletedFiles } from "@/lib/actions/file.actions";
import DeletedFileCard from "@/components/DeletedFileCard";
import PurgeButton from "@/components/PurgeButton";

const DeletedPage = async () => {
  const result = await getDeletedFiles();
  const files = result?.documents ?? [];

  return (
    <div className="page-container">
      <section className="w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#0f172a]">
              Deleted Files
            </h1>
            <p className="text-[13px] text-[#94a3b8] mt-0.5">
              Files are automatically purged after 15 days
            </p>
          </div>

          {files.length > 0 && <PurgeButton />}
        </div>
      </section>

      <section className="mt-4 w-full">
        {files.length > 0 ? (
          <div className="flex flex-col gap-2">
            {files.map((file: Models.Document) => (
              <DeletedFileCard key={file.$id} file={file} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#e2e8f0] bg-white py-16">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 opacity-40">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            <p className="text-[15px] text-[#94a3b8] font-normal">
              Trash is empty
            </p>
            <p className="text-[11px] text-[#cbd5e1] tracking-[0.15em] uppercase">
              Deleted files will appear here
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default DeletedPage;
