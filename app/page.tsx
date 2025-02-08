"use client"

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { buttonVariants } from "@/components/ui/button";
import { AnimatePresence, motion } from 'framer-motion';
import { BrainIcon, CheckIcon, ChevronDownIcon, CodeIcon, MinusCircle, Network, PlusCircle, ShieldCheckIcon, Sparkles, Terminal, Workflow, Zap } from "lucide-react";
import Link from "next/link";
import React, { useState } from 'react';
import {
  AiOutlineOpenAI
} from "react-icons/ai";
import {
  DiRubyRough
} from "react-icons/di";
import {
  RiCodeSSlashLine,
  RiJavascriptLine,
  RiMistFill,
  RiNextjsFill,
  RiNodejsLine,
  RiReactjsLine
} from "react-icons/ri";
import {
  SiAnthropic,
  SiGoogle,
  SiMeta,
  SiMixcloud
} from "react-icons/si";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Feature = {
  name: string;
  description: string;
  icon: React.ElementType;
};


const modelIcons = [
  { name: "OpenAI", Icon: AiOutlineOpenAI },
  { name: "Google", Icon: SiGoogle  },
  { name: "Meta", Icon: SiMeta },
  { name: "Anthropic", Icon: SiAnthropic  },
  { name: "Mixtral", Icon: SiMixcloud },
  { name: "And more...", Icon: RiMistFill   },
];


const techIcons = [
  { name: "React", Icon: RiReactjsLine, color: "#CF9FFF" },
  { name: "Node.js", Icon: RiNodejsLine, color: "#CF9FFF" },
  { name: "Python", Icon: RiNextjsFill , color: "#CF9FFF" },
  { name: "Ruby", Icon: DiRubyRough , color: "#CF9FFF" }, // Using Gatsby icon as a placeholder for Ruby
  { name: "JavaScript", Icon: RiJavascriptLine, color: "#CF9FFF" },
  { name: "C#", Icon: RiCodeSSlashLine, color: "#CF9FFF" },
];

type FAQItem = {
  question: string;
  answer: string;
};

type CodeLanguage = 'python' | 'javascript' | 'curl';

const features: Feature[] = [
  {
    name: "Advanced AI",
    description: "Leverage cutting-edge AI models to provide personalized learning experiences for your users.",
    icon: BrainIcon,
  },
  {
    name: "Seamless Integration",
    description: "Easily integrate AI Tutor into your existing applications with our robust API and comprehensive documentation.",
    icon: CodeIcon,
  },
  {
    name: "Secure and Scalable",
    description: "Built with enterprise-grade security and designed to scale with your growing user base.",
    icon: ShieldCheckIcon,
  },
];

const includedFeatures: string[] = [
  "Unlimited workflows",
  "Unlimited chatbots",
  "Models by OpenAI, Meta, Google, Mixtral and Anthropic",
  "Email support",
];

const faqItems: FAQItem[] = [
  {
    question: "What is AI Tutor API?",
    answer: "AI Tutor API is a powerful, multi-model language learning platform that allows developers to integrate advanced AI tutoring capabilities into their applications."
  },
  {
    question: "Which language models are supported?",
    answer: "We support a wide range of models including those from OpenAI, Google, Meta, Anthropic, Mixtral, and more. Our API provides a unified interface to access all these models."
  },
  {
    question: "How does pricing work?",
    answer: "Our pricing is based on the number of tokens processed. We charge $0.01 per 1,000 tokens, which is approximately 750 words. We offer a pay-as-you-go model with no long-term commitments."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, we offer a free trial with a limited number of tokens so you can test our API and see how it fits your needs. Sign up on our website to start your free trial."
  },
  {
    question: "How can I integrate AI Tutor API into my application?",
    answer: "We provide comprehensive documentation and SDKs for popular programming languages. Our API is RESTful and easy to integrate. Check our documentation for detailed integration guides."
  }
];

const codeExamples: Record<CodeLanguage, string> = {
  python: `
import requests

API_KEY = "your_api_key_here"
API_URL = "https://api.aitutor.com/v1/generate"

prompt = "Explain the concept of quantum entanglement"

response = requests.post(API_URL, 
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={"prompt": prompt, "max_tokens": 150}
)

if response.status_code == 200:
    print(response.json()['generated_text'])
else:
    print("Error:", response.status_code, response.text)
  `,
  javascript: `
const axios = require('axios');

const API_KEY = 'your_api_key_here';
const API_URL = 'https://api.aitutor.com/v1/generate';

const prompt = 'Explain the concept of quantum entanglement';

axios.post(API_URL, 
  { prompt: prompt, max_tokens: 150 },
  { headers: { 'Authorization': \`Bearer \${API_KEY}\` } }
)
.then(response => {
  console.log(response.data.generated_text);
})
.catch(error => {
  console.error('Error:', error.response.status, error.response.data);
});
  `,
  curl: `
curl -X POST https://api.aitutor.com/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -d '{
    "prompt": "Explain the concept of quantum entanglement",
    "max_tokens": 150
  }'
  `
};

const AnimatedSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

const FAQItem: React.FC<{ item: FAQItem; isOpen: boolean; toggleOpen: () => void }> = ({ item, isOpen, toggleOpen }) => (
  <div className="mb-4">
    <button
      onClick={toggleOpen}
      className="flex justify-between items-center w-full p-4 bg-purple-50 rounded-lg focus:outline-none"
    >
      <span className="text-lg font-semibold text-gray-900">{item.question}</span>
      {isOpen ? <MinusCircle className="h-5 w-5 text-purple-600" /> : <PlusCircle className="h-5 w-5 text-purple-600" />}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-white"
        >
          <p className="text-gray-600">{item.answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<CodeLanguage>('python');

  const toggleFaq = (index: number) => {
    setOpenFaq(prevOpen => prevOpen === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 text-gray-800 overflow-hidden">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background animation */}
          <div className="absolute inset-0 z-0">
            <div className="relative h-full w-full">
              {['purple', 'pink', 'blue'].map((color, index) => (
                <div 
                  key={color}
                  className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-${color}-200 via-${color}-100 to-transparent opacity-${70 - index * 15} animate-pulse`}
                  style={{ animationDelay: `${-index * 2}s` }}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <AnimatedSection>
            <div className="relative z-10 text-center px-6 max-w-4xl">
              <h1 className="text-6xl sm:text-8xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 animate-gradient-x">
                AI Tutor API
              </h1>
              <p className="mt-6 text-xl sm:text-2xl leading-8 text-gray-600">
                Revolutionize learning with AI-driven technology that powers AI Tutor. Empower your applications with our cutting-edge AI Tutor API.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="https://aitutor-api.vercel.app/console/workflows"
                  className={buttonVariants({ variant: "default", size: "lg", className: "bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg" })}
                >
                  Get started
                </Link>
                <Link
                  href="/documentation"
                  className={buttonVariants({ variant: "outline", size: "lg", className: "text-purple-600 border-purple-600 hover:bg-purple-100 px-8 py-4 text-lg rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg" })}
                >
                  Documentation
                </Link>
              </div>
            </div>
          </AnimatedSection>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDownIcon className="h-10 w-10 text-purple-600 opacity-70" />
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32 relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-white opacity-50" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <AnimatedSection>
              <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-purple-600">Powerful Features</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  Build Intelligent Systems
                </p>
              </div>
            </AnimatedSection>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {features.map((feature, index) => (
                  <AnimatedSection key={feature.name} delay={index * 0.2}>
                    <div className="flex flex-col bg-purple-50 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-200 transform hover:scale-105">
                      <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-gray-900">
                        <feature.icon className="h-8 w-8 flex-none text-purple-600" aria-hidden="true" />
                        {feature.name}
                      </dt>
                      <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                        <p className="flex-auto">{feature.description}</p>
                      </dd>
                    </div>
                  </AnimatedSection>
                ))}
              </dl>
            </div>
          </div>
        </section>

      {/* Multi LLM API Section */}
<section className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-r from-purple-100 to-pink-100">
  <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
    <AnimatedSection>
      <div className="mx-auto max-w-2xl lg:text-center">
        <h2 className="text-base font-semibold leading-7 text-purple-600">Multi LLM API</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          One API, Multiple Language Models
        </p>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Access a wide range of language models through a single, unified API. Simplify your workflow and leverage the power of multiple AI models.
        </p>
      </div>
    </AnimatedSection>
    <AnimatedSection delay={0.2}>
      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {modelIcons.map((model, index) => (
          <motion.div
            key={model.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <model.Icon className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold">{model.name}</h3>
          </motion.div>
        ))}
      </div>
    </AnimatedSection>
  </div>
</section>

        {/* AI Workflows Section */}
        <section className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-white to-purple-50">
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <AnimatedSection>
              <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-purple-600">AI Workflows</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  Streamline Your AI Processes
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Create powerful AI workflows that combine multiple language models and custom logic to solve complex problems.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="mt-16 relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-gradient-to-r from-purple-50 via-white to-purple-50 px-6 text-lg font-semibold leading-6 text-gray-900">
                    Workflow Example
                  </span>
                </div>
              </div>
              <div className="mt-8 flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden"
                >
                  <div className="px-6 py-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced Question Answering Workflow</h3>
                    <div className="space-y-6">
                      {[
                        { step: 1, title: "Log In", description: "Access your AI Tutor API dashboard", icon: "🔐" },
                        { step: 2, title: "Create Workflow", description: "Design your AI tutoring process flow", icon: "🔀" },
                        { step: 3, title: "Choose Variables", description: "Define input parameters for your workflow", icon: "🔢" },
                        { step: 4, title: "Craft Prompt", description: "Write effective prompts for AI models", icon: "✍️" },
                        { step: 5, title: "Select Model", description: "Choose from various AI models (e.g., GPT-4, Gemini, Claude)", icon: "🤖" },
                        { step: 6, title: "Test & Deploy", description: "Validate and launch your AI tutoring workflow", icon: "🚀" },
                      ].map((item, index) => (
                        <div key={item.step} className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-lg">{item.icon}</span>
                          </div>
                          <div className="ml-4 flex-1">
                            <h4 className="text-lg font-medium text-gray-900">{item.title}</h4>
                            <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                          </div>
                          {index < 5 && (
                            <div className="ml-4 flex-shrink-0 h-full">
                              <div className="w-px h-full bg-gray-200 mx-auto"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.4}>
              <div className="mt-16 text-center">
                <Link
                  href="/documentation#workflows"
                  className={buttonVariants({ variant: "outline", size: "lg", className: "text-purple-600 border-purple-600 hover:bg-purple-100 px-8 py-4 text-lg rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg" })}
                >
                  Learn More About Workflows
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* API Usage Section */}
        <section className="py-24 sm:py-32 relative overflow-hidden bg-white">
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <AnimatedSection>
              <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-purple-600">API Usage</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  Integrate AI Tutor in Minutes
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Our API is designed for easy integration. Here's a quick example of how to use it in different languages.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="mt-16">
                <div className="flex justify-center space-x-4 mb-8">
                  {(Object.keys(codeExamples) as CodeLanguage[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveTab(lang)}
                      className={`px-4 py-2 rounded-lg ${activeTab === lang ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <SyntaxHighlighter language={activeTab} style={tomorrow} showLineNumbers>
                    {codeExamples[activeTab]}
                  </SyntaxHighlighter>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* API Features Section */}
        <section className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-r from-purple-100 to-pink-100">
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <AnimatedSection>
              <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-purple-600">API Features</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  Powerful Capabilities at Your Fingertips
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Explore the advanced features of our AI Tutor API that set it apart from the rest.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "Multi-Model Support", description: "Access various AI models through a single API", icon: BrainIcon },
                  { name: "Real-time Responses", description: "Get instant AI-generated answers for your applications", icon: Zap },
                  { name: "Custom Workflows", description: "Create and deploy complex AI workflows with ease", icon: Workflow },
                  { name: "Contextual Understanding", description: "AI that comprehends and maintains context in conversations", icon: Sparkles },
                  { name: "Language Agnostic", description: "Integrate with any programming language of your choice", icon: Terminal },
                  { name: "Scalable Infrastructure", description: "Built to handle millions of requests effortlessly", icon: Network },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <feature.icon className="h-12 w-12 text-purple-600 mb-4" />
                    <h3 className="text-lg font-semibold text-center">{feature.name}</h3>
                    <p className="mt-2 text-sm text-gray-600 text-center">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 sm:py-32 relative overflow-hidden bg-purple-50">
          <div className="absolute inset-0 bg-gradient-to-t from-white to-purple-50 opacity-50"></div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <AnimatedSection>
              <div className="mx-auto max-w-2xl sm:text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Simple, transparent pricing</h2>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Prices are per 10 Million  tokens.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-purple-200 bg-white shadow-xl sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
                <div className="p-8 sm:p-10 lg:flex-auto">
                  <h3 className="text-3xl font-bold tracking-tight text-gray-900">AI Tutor API Plan</h3>
                  <p className="mt-6 text-base leading-7 text-gray-600">
                    Get access to our powerful AI Tutor API with all the features you need to create intelligent tutoring systems.
                  </p>
                  <div className="mt-10 flex items-center gap-x-4">
                    <h4 className="flex-none text-sm font-semibold leading-6 text-purple-600">What&apos;s included</h4>
                    <div className="h-px flex-auto bg-purple-200" />
                  </div>
                  <ul
                    role="list"
                    className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6"
                  >
                    {includedFeatures.map((feature) => (
                      <li key={feature} className="flex gap-x-3 items-center">
                        <CheckIcon className="h-6 w-5 flex-none text-purple-600" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
                  <div className="rounded-2xl bg-purple-50 py-10 text-center ring-1 ring-inset ring-purple-200 lg:flex lg:flex-col lg:justify-center lg:py-16">
                    <div className="mx-auto max-w-xs px-8">
                      <p className="text-base font-semibold text-gray-600">Billed Monthly</p>
                      <p className="mt-6 flex items-baseline justify-center gap-x-2">
                        <span className="text-5xl font-bold tracking-tight text-gray-900">$150</span>
                        <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">/10M tokens</span>
                      </p>
                      <Link
                        href="https://aitutor-api.vercel.app/console/workflows"
                        className={buttonVariants({ variant: "default", size: "lg", className: "mt-10 bg-purple-600 hover:bg-purple-700 text-white w-full rounded-full transition-all duration-300 ease-in-out transform hover:scale-105" })}
                      >
                        Get started
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 sm:py-32 relative overflow-hidden bg-white">
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <AnimatedSection>
              <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-purple-600">FAQ</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  Frequently Asked Questions
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="mt-16 max-w-3xl mx-auto">
                {faqItems.map((item, index) => (
                  <FAQItem
                    key={index}
                    item={item}
                    isOpen={openFaq === index}
                    toggleOpen={() => toggleFaq(index)}
                  />
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Integration Section */}
        <section className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-purple-600">Easy Integration</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Integrate with Your Favorite Tools
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Our API seamlessly integrates with a wide range of development tools and platforms, making it easy to incorporate AI into your existing workflows.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="mt-16 flex flex-wrap justify-center gap-8">
              {techIcons.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col items-center justify-center w-32 h-32 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, #fff, ${tech.color})`,
                  }}
                >
                  <tech.Icon className="text-4xl mb-2" style={{ color: "#000" }} />
                  <span className="text-sm font-semibold text-gray-800">{tech.name}</span>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 15s ease infinite;
          background-size: 200% 200%;
        }
      `}</style>
    </div>
  );
}


// import { Footer } from "@/components/layout/footer";
// import { Header } from "@/components/layout/header";
// import { buttonVariants } from "@/components/ui/button";
// import { SITE_METADATA } from "@/data/marketing";
// import promoImage from "@/public/images/promo.png";
// import {
//   CheckIcon,
//   CloudArrowUpIcon,
//   LockClosedIcon,
//   ServerIcon,
// } from "@heroicons/react/20/solid";
// import Image from "next/image";
// import Link from "next/link";

// export const revalidate = 86400;

// const pricingIncludedFeatures = [
//   "Unlimited workflows",
//   "Unlimited chatbots",
//   "Models by OpenAI, Meta, Google, Mixtral and Anthropic",
//   "Email support",
// ];

// const features = [
//   {
//     name: "Deploy instantly.",
//     description:
//       "Using our workflows, you can tweak prompts, update models, and deliver changes to your users instanty.",
//     icon: CloudArrowUpIcon,
//   },
//   {
//     name: "Security controls.",
//     description:
//       "Filter and control malicious requests with our security features such as single use tokens and rate limiting.",
//     icon: LockClosedIcon,
//   },
//   {
//     name: "Several models to choose from.",
//     description:
//       "Use multiple models using the same API, models from OpenAI, Meta, Google, Mixtral and Anthropic.",
//     icon: ServerIcon,
//   },
// ];

// async function getGitHubStars(): Promise<string> {
//   try {
//     const response = await fetch(
//       "https://api.github.com/repos/techulus/manage-prompt",
//       {
//         headers: {
//           Accept: "application/vnd.github+json",
//         },
//       },
//     );

//     if (!response?.ok) {
//       return "-";
//     }

//     const json = await response.json();

//     return parseInt(json["stargazers_count"]).toLocaleString();
//   } catch (error) {
//     return "-";
//   }
// }

// export default async function Home() {
//   const stars = await getGitHubStars();

//   return (
//     <div className="h-full">
//       <Header />

//       <div className="relative isolate px-6 pt-14 lg:px-8">
//         <div
//           className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
//           aria-hidden="true"
//         >
//           <div
//             className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#2563eb] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
//             style={{
//               clipPath:
//                 "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
//             }}
//           />
//         </div>
//         <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
//           <div className="text-center">
//             <h1 className="text-4xl text-hero py-4 tracking-tighter text-gray-900 sm:text-6xl hero text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-700">
//               {SITE_METADATA.TAGLINE}
//             </h1>
//             <p className="pt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
//               {SITE_METADATA.DESCRIPTION}
//             </p>
//             <div className="mt-10 flex flex-col space-y-4 md:space-y-0 md:flex-row items-center justify-center gap-x-6">
//               <Link
//                 href="/console/workflows"
//                 className={buttonVariants({ variant: "default" })}
//                 prefetch={false}
//               >
//                 Get started
//               </Link>
//               <Link
//                 href="https://github.com/techulus/manage-prompt"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex"
//                 prefetch={false}
//               >
//                 <div className="flex h-10 w-10 items-center justify-center space-x-2 rounded-md border border-muted bg-muted">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                     className="h-4 w-4 text-foreground"
//                   >
//                     <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
//                   </svg>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="h-4 w-4 border-y-8 border-l-0 border-r-8 border-solid border-muted border-y-transparent"></div>
//                   <div className="flex h-10 items-center rounded-md border border-muted bg-muted px-4 font-medium">
//                     {stars} stars on GitHub
//                   </div>
//                 </div>
//               </Link>
//             </div>
//           </div>
//         </div>
//         <div
//           className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
//           aria-hidden="true"
//         >
//           <div
//             className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#2563eb] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
//             style={{
//               clipPath:
//                 "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
//             }}
//           />
//         </div>
//       </div>

//       <div className="overflow-hidden bg-secondary dark:bg-slate-900 py-24 sm:py-32">
//         <div className="mx-auto max-w-7xl px-6 lg:px-8">
//           <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
//             <div className="lg:pr-8 lg:pt-4">
//               <div className="lg:max-w-lg">
//                 <h2 className="text-base font-semibold leading-7 text-primary">
//                   Build faster
//                 </h2>
//                 <p className="mt-2 text-3xl tracking-tighter text-accent-foreground sm:text-4xl font-bold text-hero">
//                   Building blocks for your next AI project
//                 </p>
//                 <p className="mt-6 text-lg leading-8 text-foreground">
//                   We provide the tools to help you build and deploy your AI
//                   projects faster. We take care of the infrastructure so you can
//                   focus on what you do best.
//                 </p>
//                 <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-accent-foreground lg:max-w-none">
//                   {features.map((feature) => (
//                     <div key={feature.name} className="relative pl-9">
//                       <dt className="inline font-semibold text-foreground">
//                         <feature.icon
//                           className="absolute left-1 top-1 h-5 w-5 text-primary"
//                           aria-hidden="true"
//                         />
//                         {feature.name}
//                       </dt>{" "}
//                       <dd className="inline">{feature.description}</dd>
//                     </div>
//                   ))}
//                 </dl>
//               </div>
//             </div>
//             <Image
//               src={promoImage}
//               alt="Product screenshot"
//               className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-white/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="py-24 sm:py-32">
//         <div className="mx-auto max-w-7xl px-6 lg:px-8">
//           <div className="mx-auto max-w-2xl sm:text-center">
//             <h2 className="text-3xl font-bold tracking-tighter text-primary sm:text-4xl text-hero">
//               Pay as you go
//             </h2>
//             <p className="mt-6 text-lg leading-8 text-foreground-accent">
//               Only pay for what you use. No long-term contracts. No hidden fees.
//             </p>
//           </div>
//           <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
//             <div className="p-8 sm:p-10 lg:flex-auto">
//               <h3 className="text-lg font-bold tracking-tighter text-primary">
//                 Prices are per 1,000 tokens. You can think of tokens as pieces
//                 of words, where 1,000 tokens is about 750 words.
//               </h3>
//               <div className="mt-6 flex items-center gap-x-4">
//                 <h4 className="flex-none text-sm font-semibold leading-6 text-primary">
//                   What&apos;s included
//                 </h4>
//                 <div className="h-px flex-auto bg-primary" />
//               </div>
//               <ul
//                 role="list"
//                 className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-foreground sm:grid-cols-2 sm:gap-4"
//               >
//                 {pricingIncludedFeatures.map((feature) => (
//                   <li key={feature} className="flex gap-x-3">
//                     <CheckIcon
//                       className="h-6 w-5 flex-none text-primary"
//                       aria-hidden="true"
//                     />
//                     {feature}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
//               <div className="rounded-2xl bg-secondary py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
//                 <div className="mx-auto max-w-xs px-8">
//                   <p className="text-md font-semibold text-primary-muted">
//                     Billed Monthly
//                   </p>
//                   <p className="mt-6 flex items-baseline justify-center gap-x-2">
//                     <span className="text-5xl font-bold tracking-tighter text-foreground">
//                       $0.01
//                     </span>
//                     <span className="text-md font-semibold leading-6 tracking-wide text-primary">
//                       /1K tokens
//                     </span>
//                   </p>
//                   <Link
//                     href="/console/workflows"
//                     className={buttonVariants({
//                       variant: "default",
//                       className: "mt-8",
//                     })}
//                     prefetch={false}
//                   >
//                     Get Started
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Footer isHome />
//     </div>
//   );
// }
// import { Footer } from "@/components/layout/footer";
// import { Header } from "@/components/layout/header";
// import { buttonVariants } from "@/components/ui/button";
// import { SITE_METADATA } from "@/data/marketing";
// import promoImage from "@/public/images/promo.png";
// import { CheckIcon, CloudCog, LockIcon, ServerCog } from "lucide-react";

// import Image from "next/image";
// import Link from "next/link";

// export const revalidate = 86400;

// const pricingIncludedFeatures = [
//   "Unlimited workflows",
//   "Unlimited chatbots",
//   "Models by OpenAI, Meta, Google, Mixtral, Anthropic and xAI",
//   "Email support",
// ];

// const features = [
//   {
//     name: "Deploy instantly.",
//     description:
//       "Using our workflows, you can tweak prompts, update models, and deliver changes to your users instanty.",
//     icon: CloudCog,
//   },
//   {
//     name: "Security controls.",
//     description:
//       "Filter and control malicious requests with our security features such as single use tokens and rate limiting.",
//     icon: LockIcon,
//   },
//   {
//     name: "Several models to choose from.",
//     description:
//       "Use multiple models using the same API, models from OpenAI, Meta, Google, Mixtral and Anthropic.",
//     icon: ServerCog,
//   },
// ];

// async function getGitHubStars(): Promise<string> {
//   try {
//     const response = await fetch(
//       "https://api.github.com/repos/techulus/manage-prompt",
//       {
//         headers: {
//           Accept: "application/vnd.github+json",
//         },
//       }
//     );

//     if (!response?.ok) {
//       return "-";
//     }

//     const json = await response.json();

//     return Number.parseInt(json.stargazers_count).toLocaleString();
//   } catch (error) {
//     return "-";
//   }
// }

// export default async function Home() {
//   const stars = await getGitHubStars();

//   return (
//     <div className="h-full">
//       <Header />

//       <div className="relative isolate px-6 pt-14 lg:px-8">
//         <div
//           className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
//           aria-hidden="true"
//         >
//           <div
//             className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#2563eb] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
//             style={{
//               clipPath:
//                 "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
//             }}
//           />
//         </div>
//         <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
//           <div className="text-center">
//             <h1 className="text-4xl text-hero py-4 tracking-tight text-gray-900 sm:text-6xl hero text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-700">
//               {SITE_METADATA.TAGLINE}
//             </h1>
//             <p className="pt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
//               {SITE_METADATA.DESCRIPTION}
//             </p>
//             <div className="mt-10 flex flex-col space-y-4 md:space-y-0 md:flex-row items-center justify-center gap-x-6">
//               <Link
//                 href="/workflows"
//                 className={buttonVariants({ variant: "default" })}
//                 prefetch={false}
//               >
//                 Get started
//               </Link>
//               <Link
//                 href="https://github.com/techulus/manage-prompt"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex"
//                 prefetch={false}
//               >
//                 <div className="flex h-10 w-10 items-center justify-center space-x-2 border border-muted bg-muted">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                     className="h-4 w-4 text-foreground"
//                   >
//                     <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
//                   </svg>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="h-4 w-4 border-y-8 border-l-0 border-r-8 border-solid border-muted border-y-transparent" />
//                   <div className="flex h-10 items-center border border-muted bg-muted px-4 font-medium">
//                     {stars} stars on GitHub
//                   </div>
//                 </div>
//               </Link>
//             </div>
//           </div>
//         </div>
//         <div
//           className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
//           aria-hidden="true"
//         >
//           <div
//             className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#2563eb] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
//             style={{
//               clipPath:
//                 "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
//             }}
//           />
//         </div>
//       </div>

//       <div className="overflow-hidden bg-secondary dark:bg-slate-900 py-24 sm:py-32">
//         <div className="mx-auto max-w-7xl px-6 lg:px-8">
//           <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
//             <div className="lg:pr-8 lg:pt-4">
//               <div className="lg:max-w-lg">
//                 <h2 className="text-base font-semibold leading-7 text-primary">
//                   Build faster
//                 </h2>
//                 <p className="mt-2 text-3xl tracking-tight text-accent-foreground sm:text-4xl font-bold text-hero">
//                   Building blocks for your next AI project
//                 </p>
//                 <p className="mt-6 text-lg leading-8 text-foreground">
//                   We provide the tools to help you build and deploy your AI
//                   projects faster. We take care of the infrastructure so you can
//                   focus on what you do best.
//                 </p>
//                 <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-accent-foreground lg:max-w-none">
//                   {features.map((feature) => (
//                     <div key={feature.name} className="relative pl-9">
//                       <dt className="inline font-semibold text-foreground">
//                         <feature.icon
//                           className="absolute left-1 top-1 h-5 w-5 text-primary"
//                           aria-hidden="true"
//                         />
//                         {feature.name}
//                       </dt>{" "}
//                       <dd className="inline">{feature.description}</dd>
//                     </div>
//                   ))}
//                 </dl>
//               </div>
//             </div>
//             <Image
//               src={promoImage}
//               alt="Product screenshot"
//               className="w-[48rem] max-w-none shadow-xl ring-1 ring-white/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="py-24 sm:py-32">
//         <div className="mx-auto max-w-7xl px-6 lg:px-8">
//           <div className="mx-auto max-w-2xl sm:text-center">
//             <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl text-hero">
//               Pay as you go
//             </h2>
//             <p className="mt-6 text-lg leading-8 text-foreground-accent">
//               Only pay for what you use. No long-term contracts. No hidden fees.
//             </p>
//           </div>
//           <div className="mx-auto mt-16 max-w-2xl ring-1 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
//             <div className="p-8 sm:p-10 lg:flex-auto">
//               <h3 className="text-lg font-bold tracking-tight text-primary">
//                 Prices are per 1,000 tokens. You can think of tokens as pieces
//                 of words, where 1,000 tokens is about 750 words.
//               </h3>
//               <div className="mt-6 flex items-center gap-x-4">
//                 <h4 className="flex-none text-sm font-semibold leading-6 text-primary">
//                   What&apos;s included
//                 </h4>
//                 <div className="h-px flex-auto bg-primary" />
//               </div>
//               <ul className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-foreground sm:grid-cols-2 sm:gap-4">
//                 {pricingIncludedFeatures.map((feature) => (
//                   <li key={feature} className="flex gap-x-3">
//                     <CheckIcon
//                       className="h-6 w-5 flex-none text-primary"
//                       aria-hidden="true"
//                     />
//                     {feature}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
//               <div className="bg-secondary py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
//                 <div className="mx-auto max-w-xs px-8">
//                   <p className="text-md font-semibold text-primary-muted">
//                     Billed Monthly
//                   </p>
//                   <p className="mt-6 flex items-baseline justify-center gap-x-2">
//                     <span className="text-5xl font-bold tracking-tight text-foreground">
//                       $0.01
//                     </span>
//                     <span className="text-md leading-6 tracking-wide text-primary">
//                       /1K tokens
//                     </span>
//                   </p>
//                   <p className="mt-2 flex items-baseline justify-center gap-x-2">
//                     <span className="text-md leading-6 tracking-tight text-green-600 dark:text-green-400">
//                       Get 50% off first year
//                     </span>
//                   </p>
//                   <Link
//                     href="/workflows"
//                     className={buttonVariants({
//                       variant: "default",
//                       className: "mt-8",
//                     })}
//                     prefetch={false}
//                   >
//                     Get Started
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Footer isHome />
//     </div>
//   );
// }
