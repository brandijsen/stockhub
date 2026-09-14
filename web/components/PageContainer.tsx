import type { ReactNode } from "react";

const WIDTH_CLASS = {
  /** Lists, dashboard — aligned with navbar/footer (max-w-5xl). */
  standard: "max-w-5xl",
  /** Wide tables / split views (e.g. articles, messages). */
  wide: "max-w-7xl",
  /** Forms and focused feeds (notifications, create/edit). */
  narrow: "max-w-3xl",
  /** Detail pages with side content (article/order detail). */
  detail: "max-w-4xl",
} as const;

export type PageContainerWidth = keyof typeof WIDTH_CLASS;

type PageContainerProps = {
  children: ReactNode;
  width?: PageContainerWidth;
  padding?: "default" | "marketing";
  className?: string;
};

export function PageContainer({
  children,
  width = "standard",
  padding = "default",
  className = "",
}: PageContainerProps) {
  const paddingClass = padding === "marketing" ? "py-16 sm:py-24" : "py-8";

  return (
    <div
      className={`mx-auto w-full min-w-0 px-4 ${paddingClass} ${WIDTH_CLASS[width]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

type AuthPageContainerProps = {
  children: ReactNode;
  className?: string;
  /** Default centers the auth form vertically in the viewport area. */
  centered?: boolean;
  minHeight?: "short" | "tall";
};

export function AuthPageContainer({
  children,
  className = "",
  centered = true,
  minHeight = "tall",
}: AuthPageContainerProps) {
  const minHeightClass = minHeight === "short" ? "min-h-[40vh]" : "min-h-[60vh]";

  return (
    <div
      className={`mx-auto w-full min-w-0 max-w-md px-4 py-12 ${centered ? `flex flex-col justify-center ${minHeightClass}` : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

/** Primary / secondary actions — shared height (h-11) across app surfaces. */
export const primaryButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60";

export const pageTitleClassName = "text-2xl font-semibold text-zinc-900";
