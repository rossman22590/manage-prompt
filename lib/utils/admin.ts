import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() ??
  "rcohen@mytsi.org".toLowerCase();

export async function getSuperAdminEmail(): Promise<string> {
  return SUPER_ADMIN_EMAIL;
}

export async function isSuperAdmin(): Promise<boolean> {
  if (!SUPER_ADMIN_EMAIL) return false;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const email = session?.user?.email?.trim().toLowerCase();
  return email === SUPER_ADMIN_EMAIL;
}

export async function requireSuperAdmin(): Promise<void> {
  const allowed = await isSuperAdmin();
  if (!allowed) {
    const { redirect } = await import("next/navigation");
    redirect("/workflows");
  }
}
