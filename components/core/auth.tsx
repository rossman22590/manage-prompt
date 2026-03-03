"use client";
import { User, Settings, CreditCard, ReceiptText, LifeBuoy, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type MProps = { href?: string; icon: React.ElementType; label: string; onClick?: () => void; external?: boolean; destructive?: boolean };

const MI = ({ href, icon: Icon, label, onClick, external, destructive }: MProps) => {
  const inner = (
    <div className={cn("flex w-full items-center gap-2.5 text-[13px]", destructive ? "text-destructive" : "text-foreground/80")}>
      <Icon className={cn("h-3.5 w-3.5 shrink-0", destructive ? "text-destructive/70" : "text-muted-foreground")} />
      {label}
    </div>
  );
  if (onClick) return <DropdownMenuItem onClick={onClick} className="px-3 py-2 rounded-lg cursor-pointer focus:bg-muted hover:bg-muted">{inner}</DropdownMenuItem>;
  return (
    <DropdownMenuItem asChild className="px-3 py-2 rounded-lg focus:bg-muted hover:bg-muted">
      <Link href={href!} className="w-full cursor-pointer" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{inner}</Link>
    </DropdownMenuItem>
  );
};

export const UserButton = () => {
  const router = useRouter();
  const handleSignOut = () => toast.promise(signOut().then(() => router.push("/")), { loading: "Signing out…", success: "Signed out", error: "Failed" });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-2.5 py-1.5",
            "border border-border/60 bg-card text-[13px] font-medium",
            "transition-all duration-200",
            "hover:border-primary/40 hover:bg-primary/[0.04] hover:text-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            "data-[state=open]:border-primary/40 data-[state=open]:text-primary"
          )}
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted ring-1 ring-border/60">
            <User className="h-3 w-3 text-muted-foreground" />
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-52 rounded-2xl border border-border/60 bg-popover p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.10)] animate-in fade-in-0 zoom-in-95 duration-200"
      >
        <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 bg-border/60" />
        <MI href="/settings"     icon={Settings}    label="Settings" />
        <MI href="/billing"      icon={CreditCard}  label="Billing" />
        <MI href="/transactions" icon={ReceiptText} label="Transactions" />
        <MI href="https://support.myapps.ai/aitutor-api/aitutor-api-info" icon={LifeBuoy} label="Support" external />
        <DropdownMenuSeparator className="my-1 bg-border/60" />
        <MI icon={LogOut} label="Sign Out" onClick={handleSignOut} destructive />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
