import { LoadingBlock } from "@/components/common/states";

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <LoadingBlock label="Loading LifeLedger..." />
    </div>
  );
}
