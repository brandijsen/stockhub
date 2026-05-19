/** Shared skeleton primitives for route `loading.tsx` fallbacks. */

export function NavBarSkeleton() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="h-5 w-24 animate-pulse rounded bg-zinc-200" />
        <div className="flex gap-4">
          <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
        </div>
      </div>
    </header>
  );
}

export function MainContentSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="h-8 w-48 animate-pulse rounded-md bg-zinc-200" />
      <div className="mt-4 h-4 max-w-xl animate-pulse rounded bg-zinc-100" />
      <div className="mt-2 h-4 max-w-md animate-pulse rounded bg-zinc-100" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-lg bg-zinc-100" />
        <div className="h-32 animate-pulse rounded-lg bg-zinc-100" />
      </div>
    </div>
  );
}

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
