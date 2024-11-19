import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/logo.png";

const navigation = {
  solutions: [
    { name: "Workflows", href: "https://myapps.ai" },
    { name: "Free AI Tools", href: "https://myapps.ai" },
  ],
  tools: [
    { name: "Proof Reading", href: "https://myapps.ai" },
    { name: "Summarise Text", href: "https://myapps.ai" },
    { name: "Photo Colorizer", href: "https://myapps.ai" },
    { name: "Realistic Image Creator", href: "https://myapps.ai" },
    { name: "Image Upscale", href: "https://myapps.ai" },
    { name: "Remove Background", href: "https://myapps.ai" },
  ],
  project: [
    { name: "Support", href: "https://myapps.ai" },
    { name: "Documentation", href: "https://myapps.ai" },
  ],
  legal: [
    { name: "Privacy", href: "https://myapps.ai" },
    { name: "Terms", href: "https://myapps.ai" },
  ],
  social: [
    {
      name: "Twitter",
      href: "https://twitter.com/tsi_org",
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
  ],
};

export function Footer({ isHome = false }: { isHome?: boolean }) {
  return (
    <footer className={cn(isHome ? "mt-24" : "", "text-white")}>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Image
              src={logo}
              alt="AI Tutor"
              width={32}
              height={32}
              className="h-8"
            />
            <p className="text-sm leading-6">Powered by AI</p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6">Solutions</h3>
                <ul role="list" className="mt-6 space-y-1">
                  {navigation.solutions.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-400 hover:text-white"
                        prefetch={false}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6">
                  Free AI Tools
                </h3>
                <ul role="list" className="mt-6 space-y-1">
                  {navigation.tools.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-400 hover:text-white"
                        prefetch={false}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6">Project</h3>
                <ul role="list" className="mt-6 space-y-1">
                  {navigation.project.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-400 hover:text-white"
                        prefetch={false}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6">Legal</h3>
                <ul role="list" className="mt-6 space-y-1">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-400 hover:text-white"
                        prefetch={false}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-gray-400">
            &copy; {new Date().getFullYear()} AI Tutor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
