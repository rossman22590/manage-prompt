// app/ClientHome.tsx
'use client'

import { buttonVariants } from "@/components/ui/button";
import screenshotImage from "@/public/images/promo.png";
import {
  BeakerIcon,
  BoltIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckIcon,
  CloudArrowUpIcon,
  CodeBracketIcon,
  CogIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    name: "Multi-LLM Integration",
    description: "Seamlessly integrate multiple LLMs into your app with a single API.",
    icon: CloudArrowUpIcon,
  },
  {
    name: "Diverse Model Access",
    description: "Access a variety of top-tier language models, including GPT-4, BERT, and more.",
    icon: BeakerIcon,
  },
  {
    name: "Real-time Responses",
    description: "Get lightning-fast responses from multiple LLMs for a smooth user experience.",
    icon: BoltIcon,
  },
  {
    name: "Customizable Outputs",
    description: "Fine-tune outputs from various LLMs to match your specific use case and brand voice.",
    icon: CogIcon,
  },
  {
    name: "Contextual Understanding",
    description: "Leverage advanced context handling across multiple LLMs for more accurate responses.",
    icon: LightBulbIcon,
  },
  {
    name: "Multilingual Support",
    description: "Build apps that communicate fluently in multiple languages using various LLMs.",
    icon: ChatBubbleBottomCenterTextIcon,
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$49",
    features: ["100,000 API calls/month", "Access to 3 LLMs", "Email support"],
  },
  {
    name: "Pro",
    price: "$199",
    features: ["500,000 API calls/month", "Access to 10 LLMs", "Priority support", "Custom LLM fine-tuning"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Unlimited API calls", "Access to all LLMs", "24/7 dedicated support", "On-premise deployment options"],
  },
];

const integrationSteps = [
  { title: "Sign Up", description: "Create an account and get your AI Tutor API key" },
  { title: "Install SDK", description: "Add the AI Tutor SDK to your project with npm or yarn" },
  { title: "Configure", description: "Set up your API key and choose your preferred LLMs" },
  { title: "Integrate", description: "Start making API calls to multiple LLMs in your application" },
];

export default function ClientHome({ description, stars }: { description: string; stars: string }) {
  return (
    <motion.main 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="flex-grow"
    >
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                AI Tutor API: Integrate Multiple LLMs with Ease
              </span>
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 text-lg leading-8 text-gray-600"
            >
              {description}
            </motion.p>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              <Link
                href="/console/workflows"
                className={buttonVariants({ 
                  variant: "default",
                  size: "lg",
                  className: "bg-purple-600 hover:bg-purple-700 text-white"
                })}
                prefetch={false}
              >
                Get started with AI Tutor API
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Integration Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-gray-50 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-purple-600">Seamless Integration</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Integrate Multiple LLMs in Minutes, Not Months
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              AI Tutor API makes it easy to add powerful language models to your application. Follow these simple steps to get started:
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              {integrationSteps.map((step, index) => (
                <motion.div 
                  key={step.title} 
                  className="flex flex-col items-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <div className="rounded-md bg-purple-600 p-2 ring-1 ring-white/10">
                    <CodeBracketIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <dt className="mt-4 font-semibold text-gray-900">{step.title}</dt>
                  <dd className="mt-2 leading-7 text-gray-600">{step.description}</dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </motion.div>

      {/* Screenshot Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="bg-white py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-purple-600">Intuitive Interface</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Manage Multiple LLMs with Ease
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our user-friendly dashboard lets you effortlessly manage and monitor your LLM integrations.
            </p>
          </div>
          <motion.div
            className="mt-16 relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={screenshotImage}
              alt="AI Tutor API Dashboard"
              className="rounded-xl shadow-2xl ring-1 ring-gray-900/10"
            />
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10"></div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="bg-white py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-purple-600">Build Smarter</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to build intelligent multi-LLM apps
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              AI Tutor API provides the tools and infrastructure to easily integrate multiple advanced language models into your applications.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <motion.div 
                  key={feature.name} 
                  className="flex flex-col"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-5 w-5 flex-none text-purple-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </motion.div>

      {/* Pricing Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.4 }}
        className="bg-gray-900 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
  Choose the AI Tutor API plan that's right for you. All plans include a 14-day free trial.
</p>

          </div>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-3">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                className={`rounded-3xl p-8 ring-1 ${
                  index === 1 ? 'bg-purple-600 ring-purple-700' : 'bg-white/5 ring-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className={`text-lg font-semibold leading-8 ${index === 1 ? 'text-white' : 'text-gray-300'}`}>
                  {tier.name}
                </h3>
                <p className={`mt-4 text-sm leading-6 ${index === 1 ? 'text-purple-200' : 'text-gray-300'}`}>
                  {tier.price}
                  <span className="text-xs">/month</span>
                </p>
                <ul className={`mt-8 space-y-3 text-sm leading-6 ${index === 1 ? 'text-white' : 'text-gray-300'}`}>
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon className={`h-6 w-5 flex-none ${index === 1 ? 'text-purple-300' : 'text-purple-600'}`} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="#"
                  className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    index === 1
                      ? 'bg-white text-purple-600 hover:bg-purple-50'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Get started with AI Tutor API
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.main>
  );
}
