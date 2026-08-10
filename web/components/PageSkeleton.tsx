/** Auth route loading fallback. */

export function AuthFormSkeleton() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="h-8 w-36 animate-pulse rounded-md bg-zinc-200" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-zinc-100" />
      <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-zinc-100" />
      <div className="mt-10 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-14 animate-pulse rounded bg-zinc-200" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100" />
        </div>
        <div className="mt-2 h-11 w-full animate-pulse rounded-lg bg-zinc-200" />
      </div>
    </div>
  );
}
