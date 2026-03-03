"use client";

import { type KeyboardEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { updateUserCredits } from "@/app/(dashboard)/admin/actions";
import { Plus, Minus, Loader2 } from "lucide-react";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  emailVerified: boolean;
  workflowsCount: number;
  runsCount: number;
  apiKeysCount: number;
  createdAt: Date;
};

type Props = {
  users: AdminUserRow[];
};

export default function AdminUsersTable({ users }: Props) {
  const router = useRouter();
  const handleRowClick = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement | HTMLDivElement>,
    userId: string,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    router.push(`/admin/users/${userId}`);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:hidden">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 space-y-4 cursor-pointer transition hover:border-pink-300 dark:hover:border-pink-800"
            role="button"
            tabIndex={0}
            aria-label={`Open details for ${user.email}`}
            onClick={() => handleRowClick(user.id)}
            onKeyDown={(event) => handleRowKeyDown(event, user.id)}
          >
            <div className="space-y-1">
              <p className="font-medium text-gray-900 dark:text-gray-100 break-all">
                {user.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.name || "No name set"}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Badge
                  variant="secondary"
                  className="font-mono bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-0"
                >
                  {user.credits.toLocaleString()} credits
                </Badge>
                <Badge
                  variant={user.emailVerified ? "default" : "outline"}
                  className={user.emailVerified ? "bg-green-600 text-white" : ""}
                >
                  {user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <StatTile label="Workflows" value={user.workflowsCount} />
              <StatTile label="Runs" value={user.runsCount} />
              <StatTile label="Keys" value={user.apiKeysCount} />
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Joined{" "}
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>

            <div onClick={(event) => event.stopPropagation()}>
              <CreditActions userId={user.id} currentCredits={user.credits} />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 dark:border-gray-800 hover:bg-transparent">
              <TableHead className="text-gray-600 dark:text-gray-400 font-semibold min-w-[260px]">
                User
              </TableHead>
              <TableHead className="text-gray-600 dark:text-gray-400 font-semibold">
                Verified
              </TableHead>
              <TableHead className="text-gray-600 dark:text-gray-400 font-semibold">
                Credits
              </TableHead>
              <TableHead className="text-gray-600 dark:text-gray-400 font-semibold">
                Workflows
              </TableHead>
              <TableHead className="text-gray-600 dark:text-gray-400 font-semibold">
                Runs
              </TableHead>
              <TableHead className="text-gray-600 dark:text-gray-400 font-semibold">
                API Keys
              </TableHead>
              <TableHead className="text-gray-600 dark:text-gray-400 font-semibold">
                Joined
              </TableHead>
              <TableHead className="text-gray-600 dark:text-gray-400 font-semibold text-right min-w-[240px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="border-gray-200 dark:border-gray-800 cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`Open details for ${user.email}`}
                onClick={() => handleRowClick(user.id)}
                onKeyDown={(event) => handleRowKeyDown(event, user.id)}
              >
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-gray-900 dark:text-gray-100 break-all">
                      {user.email}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {user.name || "No name set"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.emailVerified ? "default" : "outline"}
                    className={user.emailVerified ? "bg-green-600 text-white" : ""}
                  >
                    {user.emailVerified ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="font-mono text-base bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-0"
                  >
                    {user.credits.toLocaleString()}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{user.workflowsCount}</TableCell>
                <TableCell className="font-medium">{user.runsCount}</TableCell>
                <TableCell className="font-medium">{user.apiKeysCount}</TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div onClick={(event) => event.stopPropagation()}>
                    <CreditActions
                      userId={user.id}
                      currentCredits={user.credits}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-800 p-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function CreditActions({
  userId,
  currentCredits,
}: {
  userId: string;
  currentCredits: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (delta: number) => {
    const value = amount.trim() ? parseInt(amount, 10) : 0;
    const effectiveDelta = delta > 0 ? (value || 0) : -(value || 0);
    if (effectiveDelta === 0) {
      toast.error("Enter an amount first.");
      return;
    }
    setLoading(true);
    try {
      const result = await updateUserCredits(userId, effectiveDelta);
      if (result.ok) {
        toast.success(
          effectiveDelta > 0
            ? `Added ${effectiveDelta} credits.`
            : `Removed ${-effectiveDelta} credits.`,
        );
        setAmount("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => handleSubmit(1);
  const handleRemove = () => handleSubmit(-1);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Input
        type="number"
        min={1}
        max={999999}
        placeholder="Amount"
        value={amount}
        onChange={(e) =>
          setAmount(e.target.value.replace(/\D/g, "").slice(0, 6))
        }
        className="w-24 h-9 text-center"
        aria-label="Credit amount"
        disabled={loading}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-green-600 border-green-300 dark:border-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
        onClick={handleAdd}
        disabled={loading}
        aria-label="Add credits"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Plus className="h-4 w-4" aria-hidden />
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-red-600 border-red-300 dark:border-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={handleRemove}
        disabled={loading || currentCredits <= 0}
        aria-label="Remove credits"
      >
        <Minus className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
