"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NumericPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemName?: string;
  className?: string;
}

export function NumericPagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  itemName = "items",
  className = "",
}: NumericPaginationProps) {
  const safeTotalPages = Math.max(totalPages || 1, 1);

  const getPageNumbers = (): (number | "...")[] => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }

    if (page <= 4) {
      return [1, 2, 3, 4, 5, "...", safeTotalPages];
    }

    if (page >= safeTotalPages - 3) {
      return [
        1,
        "...",
        safeTotalPages - 4,
        safeTotalPages - 3,
        safeTotalPages - 2,
        safeTotalPages - 1,
        safeTotalPages,
      ];
    }

    return [1, "...", page - 1, page, page + 1, "...", safeTotalPages];
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/40 text-xs text-muted-foreground ${className}`}
    >
      <div>
        Page <strong>{page}</strong> of <strong>{safeTotalPages}</strong>
        {totalItems !== undefined && (
          <span>
            {" "}
            ({totalItems} {itemName})
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          className="h-8 px-2.5 text-xs gap-1 border-border/50 bg-background/40 hover:bg-background/80"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page Number Buttons */}
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1 text-xs text-muted-foreground select-none"
              >
                ...
              </span>
            );
          }

          const isCurrent = p === page;

          return (
            <Button
              key={`page-${p}`}
              variant={isCurrent ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(p as number)}
              className={`h-8 w-8 text-xs font-mono p-0 ${
                isCurrent
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "border-border/50 bg-background/40 text-muted-foreground hover:text-foreground hover:bg-background/80"
              }`}
            >
              {p}
            </Button>
          );
        })}

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= safeTotalPages}
          onClick={() => onPageChange(Math.min(page + 1, safeTotalPages))}
          className="h-8 px-2.5 text-xs gap-1 border-border/50 bg-background/40 hover:bg-background/80"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default NumericPagination;
