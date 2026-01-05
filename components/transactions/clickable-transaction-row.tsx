"use client";

import { TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";

interface ClickableTransactionRowProps {
  workflowId?: number;
  children: React.ReactNode;
  className?: string;
}

export function ClickableTransactionRow({ 
  workflowId, 
  children, 
  className 
}: ClickableTransactionRowProps) {
  const router = useRouter();

  const handleClick = () => {
    if (workflowId) {
      router.push(`/workflows/${workflowId}`);
    }
  };

  return (
    <TableRow 
      className={`${workflowId ? "cursor-pointer" : ""} ${className || ""}`}
      onClick={handleClick}
    >
      {children}
    </TableRow>
  );
}

