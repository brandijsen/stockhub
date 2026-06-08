type ArticlesListPaginationProps = {
  rangeStart: number;
  rangeEnd: number;
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function ArticlesListPagination({
  rangeStart,
  rangeEnd,
  total,
  page,
  totalPages,
  loading,
  onPrevious,
  onNext,
}: ArticlesListPaginationProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600">
      <p>
        Showing {rangeStart}–{rangeEnd} of {total}
      </p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={onPrevious}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={onNext}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
