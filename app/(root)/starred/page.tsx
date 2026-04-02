import { Models } from "node-appwrite";
import { getStarredFiles } from "@/lib/actions/file.actions";
import { getStarredFolders } from "@/lib/actions/folder.actions";
import Card from "@/components/Card";
import FolderCard from "@/components/FolderCard";

const StarredPage = async () => {
  const [starredFiles, starredFolders] = await Promise.all([
    getStarredFiles(),
    getStarredFolders(),
  ]);

  const files: Models.Document[] = starredFiles ?? [];
  const folders: Models.Document[] = starredFolders?.documents ?? [];
  const totalItems = files.length + folders.length;

  return (
    <div className="page-container">
      <section className="w-full">
        <div className="flex items-center gap-2.5">
          <span className="text-[#16a34a] text-2xl leading-none">★</span>
          <h1 className="text-[28px] font-bold tracking-tight text-[#0f172a]">
            Starred
          </h1>
        </div>
        <p className="mt-0.5 text-[13px] text-[#94a3b8]">
          {totalItems} starred item{totalItems !== 1 ? "s" : ""}
        </p>
      </section>

      {totalItems === 0 ? (
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#e2e8f0] bg-white py-16">
          <span className="text-5xl text-[#16a34a]/20">★</span>
          <p className="text-[15px] text-[#94a3b8] font-normal">
            No starred items yet
          </p>
          <p className="text-[11px] text-[#cbd5e1] tracking-[0.15em] uppercase">
            Star files or folders from the ··· menu
          </p>
        </div>
      ) : (
        <>
          {/* Starred Folders */}
          {folders.length > 0 && (
            <section className="mt-6 w-full">
              <h2 className="text-[15px] font-semibold text-[#475569] mb-3 uppercase tracking-wide text-[11px]">
                Folders
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {folders.map((folder: Models.Document) => (
                  <FolderCard key={folder.$id} folder={folder} />
                ))}
              </div>
            </section>
          )}

          {/* Starred Files */}
          {files.length > 0 && (
            <section className="mt-6 w-full">
              <h2 className="text-[15px] font-semibold text-[#475569] mb-3 uppercase tracking-wide text-[11px]">
                Files
              </h2>
              <ul className="total-size-section-grid mt-0">
                {files.map((file: Models.Document) => (
                  <Card key={file.$id} file={file} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default StarredPage;
