import { Spinner } from "./Spinner";

type LoadingTextProps = {
  className?: string;
  label?: string;
};

/** Centered loading spinner for client-side data fetching. */
export function LoadingText({
  className = "mt-8 flex items-center justify-center text-zinc-500",
  label = "Loading",
}: LoadingTextProps) {
  return (
    <div className={className} aria-busy="true">
      <Spinner className="h-6 w-6" label={label} />
    </div>
  );
}
