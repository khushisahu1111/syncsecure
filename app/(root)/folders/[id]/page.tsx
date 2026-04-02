import { Models } from "node-appwrite";
import { notFound } from "next/navigation";
import { getFilesInFolder, getFolders } from "@/lib/actions/folder.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import Breadcrumbs from "@/components/Breadcrumbs";
import Card from "@/components/Card";
import FolderFileUploader from "@/components/FolderFileUploader";

interface Props {
  params: Promise<{ id: string }>;
}

const FolderPage = async ({ params }: Props) => {
  const { id } = await params;

  // Fetch folder meta + current user in parallel
  const [allFolders, currentUser] = await Promise.all([
    getFolders(),
    getCurrentUser(),
  ]);

  const folder = allFolders?.documents?.find(
    (f: Models.Document) => f.$id === id,
  );

  if (!folder || !currentUser) return notFound();

  const result = await getFilesInFolder(id);
  const files: Models.Document[] = result?.documents ?? [];

  return (
    <div className="page-container">
      {/* Breadcrumbs */}
      <Breadcrumbs
        crumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Folders", href: "/folders" },
          { label: folder.name },
        ]}
      />

      {/* Heading row */}
      <section className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: folder icon + name */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5EDD7]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C5A059"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h1
                className="text-[28px] font-bold text-[#2C2C2C] flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {folder.name}
                {folder.isStarred && (
                  <span className="text-[#C5A059] text-xl">★</span>
                )}
              </h1>
              <p className="text-[13px] text-[#8A7A65]">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Right: Upload into this folder */}
          <FolderFileUploader
            ownerId={currentUser.$id}
            accountId={currentUser.accountId}
            folderId={id}
            folderName={folder.name}
          />
        </div>
      </section>

      {/* Files grid */}
      <section className="mt-6 w-full">
        {files.length > 0 ? (
          <ul className="total-size-section-grid mt-0">
            {files.map((file: Models.Document) => (
              <Card key={file.$id} file={file} />
            ))}
          </ul>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#C5A059]/40 bg-[#FDFBF7] py-16 mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C5A059"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 opacity-30"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-[16px] text-[#8A7A65] font-light tracking-wide">
              This folder is empty
            </p>
            <p className="text-[12px] text-[#C5A059]/60 tracking-[0.15em] uppercase">
              Use the upload button above or move files here from the main view
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default FolderPage;
