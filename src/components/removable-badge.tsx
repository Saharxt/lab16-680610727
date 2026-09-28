import { XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type RemovableBadgeProps = {
  label: string;
  onRemove: () => void;
};

export function RemovableBadge({ label, onRemove }: RemovableBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="gap-0.5 border-blue-500/20 bg-blue-500/10 pr-1 text-blue-700 dark:text-blue-300"
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`ลบ ${label}`}
        className="inline-flex size-4 items-center justify-center rounded-full opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-1"
      >
        <XIcon className="size-3" />
      </button>
    </Badge>
  );
}
