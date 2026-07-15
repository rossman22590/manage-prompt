import { notFound } from "next/navigation";
import { isAgentsFeatureEnabled } from "@/lib/utils/feature-flags";

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAgentsFeatureEnabled()) {
    notFound();
  }
  return children;
}
