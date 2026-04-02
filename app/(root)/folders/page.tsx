import { Models } from "node-appwrite";
import { getFolders } from "@/lib/actions/folder.actions";
import FolderCard from "@/components/FolderCard";
import CreateFolderButton from "@/components/CreateFolderButton";

const FoldersPage = async () => {
  const result = await getFolders();
  const folders: Models.Document[] = result?.documents ?? [];

  return (
    <div className="page-container">
      <section className="w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#0f172a]">
              Folders
            </h1>
            <p className="mt-0.5 text-[13px] text-[#94a3b8]">
              {folders.length} folder{folders.length !== 1 ? "s" : ""}
            </p>
          </div>
          <CreateFolderButton />
        </div>
      </section>

      <section className="mt-2 w-full">
        {folders.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {folders.map((folder: Models.Document) => (
              <FolderCard key={folder.$id} folder={folder} />
            ))}
          </div>
        ) : (
          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#e2e8f0] bg-white py-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 opacity-20"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-[15px] text-[#94a3b8] font-normal">
              No folders yet
            </p>
            <p className="text-[11px] text-[#cbd5e1] tracking-[0.15em] uppercase">
              Click &quot;New Folder&quot; to get started
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default FoldersPage;
