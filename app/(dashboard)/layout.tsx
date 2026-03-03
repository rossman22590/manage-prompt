import NavBar from "@/components/console/navbar";
import { isSuperAdmin } from "@/lib/utils/admin";

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const showAdminLink = await isSuperAdmin();
  return (
    <div className="relative flex min-h-full flex-col">
      <NavBar showAdminLink={showAdminLink} />

      <div className="mx-auto w-full flex-grow lg:flex">
        <div className="min-w-0 flex-1 xl:flex">
          <div className="min-h-screen lg:min-w-0 lg:flex-1 pb-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
