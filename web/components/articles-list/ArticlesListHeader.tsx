import Link from "next/link";
import type { ChangeEvent, RefObject } from "react";

import { Spinner } from "@/components/Spinner";

type ArticlesListHeaderProps = {
  canManage: boolean;
  exporting: boolean;
  importing: boolean;
  importInputRef: RefObject<HTMLInputElement | null>;
  onExport: () => void;
  onImportFile: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function ArticlesListHeader({
  canManage,
  exporting,
  importing,
  importInputRef,
  onExport,
  onImportFile,
}: ArticlesListHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Articles</h1>
        <p className="mt-1 text-zinc-600">
          Catalog spreadsheet — one row per product variant.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={exporting}
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
        >
          {exporting ? <Spinner className="h-4 w-4" label="Exporting" /> : null}
          Export Excel
        </button>
        {canManage ? (
          <>
            <input
              ref={importInputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              onChange={onImportFile}
            />
            <button
              type="button"
              disabled={importing}
              onClick={() => importInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
            >
              {importing ? (
                <Spinner className="h-4 w-4" label="Importing" />
              ) : null}
              Import Excel
            </button>
            <Link
              href="/articles/new"
              className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              New article
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
