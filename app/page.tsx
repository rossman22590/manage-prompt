import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { buttonVariants } from "@/components/ui/button";
import { SITE_METADATA } from "@/data/marketing";
import promoImage from "@/public/images/promo.png";
import {
  BoltIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
  ServerIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 86400;

const features = [
  {
    name: "Deploy instantly",
    description: "Tweak prompts, update models, and deliver changes to your users instantly using our workflows.",
    icon: CloudArrowUpIcon,
  },
  {
    name: "Security controls",
    description: "Filter and control malicious requests with features like single-use tokens and rate limiting.",
    icon: LockClosedIcon,
  },
  {
    name: "Multiple models",
    description: "Use models from OpenAI, Meta, Google, Mixtral, and Anthropic with a single API.",
    icon: ServerIcon,
  },
  {
    name: "Real-time switching",
    description: "Dynamically switch between AI models based on your needs, without changing your code.",
    icon: BoltIcon,
  },
];

const demoVideos = [
  { title: "Setup in 60 seconds", description: "Quick start guide to integrate our API" },
  { title: "Multi-model requests", description: "Learn how to leverage multiple AI models in a single request" },
  { title: "Advanced NLP tasks", description: "Explore advanced natural language processing capabilities" },
  { title: "Scaling for production", description: "Best practices for scaling our API in production environments" },
];

async function getGitHubStars(): Promise<string> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/techulus/manage-prompt",
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
    <div className="min-h-screen bg-[#0A0E17] text-white">
      <Header />

      <main className="relative isolate">
        {/* Hero section */}
        <div className="relative px-6 lg:px-8">
          <div className="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                Use the AI Tutor AI Gateway to run and secure LLM traffic
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                {SITE_METADATA.DESCRIPTION}
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/console/workflows"
                  className={buttonVariants({ variant: "default", size: "lg", className: "bg-blue-600 hover:bg-blue-500" })}
                  prefetch={false}
                >
                  Get started
                </Link>
                <Link
                  href="https://github.com/techulus/manage-prompt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold leading-6 text-gray-300 hover:text-white transition-colors"
                  prefetch={false}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                  </svg>
                  {stars} stars on GitHub
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* AI Gateway Diagram */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-24">
          <Image src={promoImage} alt="AI Gateway Diagram" className="w-full h-auto rounded-lg shadow-2xl" />
        </div>

        {/* Feature section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-400">Powerful Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Accelerate AI adoption in your apps</p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
                  <dt className="text-base font-semibold leading-7 text-white flex items-center gap-x-3">
                    <feature.icon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-300">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Demo Videos Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-24">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Watch our API in action</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {demoVideos.map((video, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
                <div className="aspect-w-16 aspect-h-9 mb-4 bg-gray-700 rounded-lg"></div>
                <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
                <p className="text-gray-300">{video.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA section */}
        <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Boost your AI development.
              <br />
              Start using our API today.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Join thousands of developers who are already building the future with our API. Get started for free and scale as you grow.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/signup"
                className={buttonVariants({ variant: "default", size: "lg", className: "bg-black text-white hover:bg-gray-800" })}
              >
                Sign up for free
              </Link>
              <Link href="/contact-sales" className="text-sm font-semibold leading-6 text-white hover:text-gray-100 transition-colors">
                Contact sales <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer isHome />
    </div>
  );
}
