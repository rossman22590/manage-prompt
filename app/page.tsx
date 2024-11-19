// app/page.tsx
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SITE_METADATA } from "@/data/marketing";
import dynamic from 'next/dynamic';

const ClientHome = dynamic(() => import('./ClientHome'), { ssr: false });

export const revalidate = 86400;

async function getGitHubStars(): Promise<string> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/ai-tutor/ai-tutor-api",
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!response?.ok) {
      return "-";
    }

    const json = await response.json();

    return parseInt(json["stargazers_count"]).toLocaleString();
  } catch (error) {
    return "-";
  }
}

export default async function Home() {
  const stars = await getGitHubStars();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <ClientHome description={SITE_METADATA.DESCRIPTION} stars={stars} />
      <Footer isHome />
    </div>
  );
}
