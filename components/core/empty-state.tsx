import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function EmptyState({
  label,
  show,
  createLink,
  isSearchResult = false,
}: {
  label: string;
  show: boolean;
  createLink: string;
  isSearchResult?: boolean;
}) {
  if (!show) return null;

  return (
    <div className="p-4">
      <Link
        href={createLink}
        prefetch={false}
        tabIndex={0}
        aria-label={isSearchResult ? `No ${label} found` : `Create new ${label}`}
        className={cn(
          "group relative flex flex-col items-center justify-center w-full",
          "rounded-2xl border border-dashed border-border/60 p-16 text-center",
          "transition-all duration-300",
          "hover:border-primary/40 hover:bg-primary/[0.02]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        )}
      >
        <div className={cn(
          "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl",
          "border border-border/60 bg-muted/50",
          "transition-all duration-300",
          "group-hover:border-primary/30 group-hover:bg-primary/[0.06] group-hover:shadow-glow-xs"
        )}>
          <svg
            className="h-6 w-6 text-muted-foreground transition-colors duration-300 group-hover:text-primary"
            stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6" />
          </svg>
        </div>

        {isSearchResult ? (
          <p className="text-sm font-semibold text-foreground">No {label} match your search</p>
        ) : (
          <>
            <p className="text-sm font-semibold text-foreground">No {label} yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Click to create your first one</p>
          </>
        )}

        <div className={cn(
          "mt-5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold",
          "border border-border/60 bg-background text-muted-foreground",
          "transition-all duration-300",
          "group-hover:border-primary/40 group-hover:bg-primary/[0.06] group-hover:text-primary"
        )}>
          <Plus className="h-3 w-3" />
          New {label}
        </div>
      </Link>
    </div>
  );
}
