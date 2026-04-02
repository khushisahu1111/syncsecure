import React from "react";
import Sort from "@/components/Sort";
import { getFiles } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import Card from "@/components/Card";
import { getFileTypesParams, convertFileSize } from "@/lib/utils";

const Page = async ({ searchParams, params }: SearchParamProps) => {
  const type = ((await params)?.type as string) || "";
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";

  const types = getFileTypesParams(type) as FileType[];

  const files = await getFiles({ types, searchText, sort });

  // Compute real total size across all fetched documents
  const totalSize = files.documents.reduce(
    (acc: number, file: Models.Document) => acc + (file.size ?? 0),
    0,
  );

  return (
    <div className="page-container">
      <section className="w-full">
        {/* Page heading — Playfair Display via font-serif */}
        <h1
          className="text-[34px] leading-[42px] font-bold capitalize text-[#2C2C2C]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {type}
        </h1>

        <div className="total-size-section">
          <p className="text-[16px] leading-[24px] text-[#5C5142]">
            Total:{" "}
            <span className="text-[16px] font-semibold text-[#C5A059]">
              {convertFileSize(totalSize)}
            </span>
          </p>

          <div className="sort-container">
            <p className="hidden text-[14px] text-[#8A7A65] sm:block">
              Sort by:
            </p>
            <Sort />
          </div>
        </div>
      </section>

      {/* Render the files */}
      {files.total > 0 ? (
        <section className="file-list">
          {files.documents.map((file: Models.Document) => (
            <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <div className="mt-10 w-full flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#C5A059]/40 bg-[#FDFBF7] py-16">
          <p className="text-[16px] text-[#8A7A65] font-light tracking-wide">
            No files uploaded
          </p>
          <p className="text-[12px] text-[#C5A059]/60 tracking-[0.15em] uppercase">
            This folder is empty
          </p>
        </div>
      )}
    </div>
  );
};

export default Page;
