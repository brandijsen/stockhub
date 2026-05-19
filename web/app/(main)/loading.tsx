import {
  MainContentSkeleton,
  NavBarSkeleton,
} from "@/components/PageSkeleton";

export default function MainLoading() {
  return (
    <>
      <NavBarSkeleton />
      <main className="flex-1">
        <MainContentSkeleton />
      </main>
    </>
  );
}
