"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/useDebounce";

export function WorkflowSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchValue, 100);

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (debouncedSearch !== currentSearch) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
        params.delete("page"); // Reset to page 1 when searching
      } else {
        params.delete("search");
      }
      router.replace(`/workflows?${params.toString()}`);
    }
  }, [debouncedSearch, router, searchParams]);

  return (
    <div className="relative text-gray-600 dark:text-gray-400 focus-within:text-gray-800 dark:focus-within:text-gray-200">
      <Input
        name="search"
        placeholder="Search Workflows"
        type="search"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
    </div>
  );
}

