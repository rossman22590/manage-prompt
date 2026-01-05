"use client";

import MarkdownView from "@/components/markdown/markdown-view";
import type { WorkflowRun } from "@/generated/prisma-client/client";
import { DateTime } from "@/lib/utils/datetime";
import { CheckIcon, CopyIcon, GitBranchIcon, LinkIcon } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "../../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "../../ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

export type WorkflowRunWithUser = WorkflowRun & {
  user: {
    name: string | null;
  };
  branchId: string | null;
};

interface Props {
  workflowRun: WorkflowRunWithUser;
}

export function WorkflowRunItem({ workflowRun }: Props) {
  const { result, user, createdAt, rawRequest, totalTokenCount, branchId, rawResult } =
    workflowRun;
  
  const [copyingResponse, setCopyingResponse] = useState(false);
  const [copyingRequest, setCopyingRequest] = useState(false);

  // Extract citations from rawResult
  const citations = typeof rawResult === 'object' && rawResult !== null
    ? (rawResult as any).citations || []
    : [];

  const copyToClipboard = async (text: string, type: 'response' | 'request') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'response') {
        setCopyingResponse(true);
        setTimeout(() => setCopyingResponse(false), 2000);
      } else {
        setCopyingRequest(true);
        setTimeout(() => setCopyingRequest(false), 2000);
      }
      // No toast notification - just using the UI feedback
    } catch (err) {
      console.error("Failed to copy to clipboard", err);
    }
  };

  return (
    <li
      key={workflowRun.id}
      className="relative overflow-x-scroll px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary"
    >
      <div className="flex justify-between items-center space-x-3 mb-8">
        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
            {user?.name ?? "API"}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            <GitBranchIcon className="w-3 h-3 mr-1.5" />
            {branchId ?? "main"}
          </span>
          {totalTokenCount ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {totalTokenCount} tokens
            </span>
          ) : null}
        </div>
        <time
          dateTime={createdAt.toISOString()}
          className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500"
        >
          {DateTime.fromJSDate(createdAt).toNiceFormat()}
        </time>
      </div>
      <div className="mt-6 text-gray-600 dark:text-gray-200">
        <MarkdownView content={result} />
      </div>

      {citations.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Citations:</h4>
          <ul className="mt-2 space-y-1">
            {citations.map((citation: string, index: number) => (
              <li key={index} className="text-xs text-blue-500 hover:text-blue-700 flex items-center">
                <LinkIcon className="w-3 h-3 mr-1" />
                <a href={citation} target="_blank" rel="noopener noreferrer" className="truncate">
                  {citation}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Drawer>
        <DrawerTrigger
          className={buttonVariants({ variant: "link", className: "pl-0" })}
        >
          View Raw
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader />

          <Tabs defaultValue="response">
            <TabsList className="ml-4">
              <TabsTrigger value="response">Response</TabsTrigger>
              <TabsTrigger value="request">Request</TabsTrigger>
            </TabsList>
            <TabsContent value="response">
              <div className="relative">
                <pre className="p-4 bg-secondary overflow-scroll whitespace-pre-wrap max-h-[320px]">
                  {JSON.stringify(rawResult, null, 2)}
                </pre>
                <Button 
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(JSON.stringify(rawResult, null, 2), 'response')}
                >
                  {copyingResponse ? (
                    <CheckIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <CopyIcon className="h-4 w-4 mr-1" />
                  )}
                  {copyingResponse ? "Copied!" : "Copy"}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="request">
              <div className="relative">
                <pre className="p-4 bg-secondary overflow-scroll whitespace-pre-wrap max-h-[320px]">
                  {JSON.stringify(rawRequest, null, 2)}
                </pre>
                <Button 
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(JSON.stringify(rawRequest, null, 2), 'request')}
                >
                  {copyingRequest ? (
                    <CheckIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <CopyIcon className="h-4 w-4 mr-1" />
                  )}
                  {copyingRequest ? "Copied!" : "Copy"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="mb-6">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </li>
  );
}

// "use client";

// import MarkdownView from "@/components/markdown/markdown-view";
// import { DateTime } from "@/lib/utils/datetime";
// import type { WorkflowRun } from "@/generated/prisma-client/client";
// import { GitBranchIcon, LinkIcon } from "lucide-react";
// import { Button, buttonVariants } from "../../ui/button";
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTrigger,
// } from "../../ui/drawer";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

// export type WorkflowRunWithUser = WorkflowRun & {
//   user: {
//     name: string | null;
//   };
//   branchId: string | null;
// };

// interface Props {
//   workflowRun: WorkflowRunWithUser;
// }

// export function WorkflowRunItem({ workflowRun }: Props) {
//   const { result, user, createdAt, rawRequest, totalTokenCount, branchId, rawResult } =
//     workflowRun;

//   // Extract citations from rawResult
//   const citations = typeof rawResult === 'object' && rawResult !== null
//     ? (rawResult as any).citations || []
//     : [];

//   return (
//     <li
//       key={workflowRun.id}
//       className="relative overflow-x-scroll px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary"
//     >
//       <div className="flex justify-between space-x-3">
//         <div className="min-w-0 flex-1">
//           <p className="truncate font-semibold text-gray-900 dark:text-gray-100 space-x-2">
//             <span>{user?.name ?? "API"}</span>

//             <span aria-hidden="true">&middot;</span>
//             <span className="text-gray-600 dark:text-gray-400 font-normal">
//               <GitBranchIcon className="w-4 h-4 mr-1 inline" />{" "}
//               {branchId ?? "main"}
//             </span>

//             {totalTokenCount ? (
//               <>
//                 <span aria-hidden="true">&middot;</span>
//                 <span className="text-gray-600 dark:text-gray-400 font-normal">
//                   {totalTokenCount} tokens
//                 </span>
//               </>
//             ) : null}
//           </p>
//         </div>
//         <time
//           dateTime={createdAt.toISOString()}
//           className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500"
//         >
//           {DateTime.fromJSDate(createdAt).toNiceFormat()}
//         </time>
//       </div>
//       <div className="mt-1 text-gray-600 dark:text-gray-200">
//         <MarkdownView content={result} />
//       </div>

//       {citations.length > 0 && (
//         <div className="mt-4">
//           <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Citations:</h4>
//           <ul className="mt-2 space-y-1">
//             {citations.map((citation: string, index: number) => (
//               <li key={index} className="text-xs text-blue-500 hover:text-blue-700 flex items-center">
//                 <LinkIcon className="w-3 h-3 mr-1" />
//                 <a href={citation} target="_blank" rel="noopener noreferrer" className="truncate">
//                   {citation}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       <Drawer>
//         <DrawerTrigger
//           className={buttonVariants({ variant: "link", className: "pl-0" })}
//         >
//           View Raw
//         </DrawerTrigger>
//         <DrawerContent>
//           <DrawerHeader />

//           <Tabs defaultValue="response">
//             <TabsList className="ml-4">
//               <TabsTrigger value="response">Response</TabsTrigger>
//               <TabsTrigger value="request">Request</TabsTrigger>
//             </TabsList>
//             <TabsContent value="response">
//               <pre className="p-4 bg-secondary overflow-scroll whitespace-pre-wrap max-h-[320px]">
//                 {JSON.stringify(rawResult, null, 2)}
//               </pre>
//             </TabsContent>
//             <TabsContent value="request">
//               <pre className="p-4 bg-secondary overflow-scroll whitespace-pre-wrap max-h-[320px]">
//                 {JSON.stringify(rawRequest, null, 2)}
//               </pre>
//             </TabsContent>
//           </Tabs>

//           <DrawerFooter>
//             <DrawerClose asChild>
//               <Button variant="outline" className="mb-6">
//                 Close
//               </Button>
//             </DrawerClose>
//           </DrawerFooter>
//         </DrawerContent>
//       </Drawer>
//     </li>
//   );
// }

// "use client";

// import MarkdownView from "@/components/markdown/markdown-view";
// import { DateTime } from "@/lib/utils/datetime";
// import type { WorkflowRun } from "@/generated/prisma-client/client";
// import { GitBranchIcon } from "lucide-react";
// import { Button, buttonVariants } from "../../ui/button";
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTrigger,
// } from "../../ui/drawer";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

// export type WorkflowRunWithUser = WorkflowRun & {
//   user: {
//     name: string | null;
//   };
// };

// interface Props {
//   workflowRun: WorkflowRunWithUser;
// }

// export function WorkflowRunItem({ workflowRun }: Props) {
//   const { result, user, createdAt, rawRequest, totalTokenCount, branchId } =
//     workflowRun;

//   return (
//     <li
//       key={workflowRun.id}
//       className="relative overflow-x-scroll px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary"
//     >
//       <div className="flex justify-between space-x-3">
//         <div className="min-w-0 flex-1">
//           <p className="truncate font-semibold text-gray-900 dark:text-gray-100 space-x-2">
//             <span>{user?.name ?? "API"}</span>

//             <span aria-hidden="true">&middot;</span>
//             <span className="text-gray-600 dark:text-gray-400 font-normal">
//               <GitBranchIcon className="w-4 h-4 mr-1 inline" />{" "}
//               {branchId ?? "main"}
//             </span>

//             {totalTokenCount ? (
//               <>
//                 <span aria-hidden="true">&middot;</span>
//                 <span className="text-gray-600 dark:text-gray-400 font-normal">
//                   {totalTokenCount} tokens
//                 </span>
//               </>
//             ) : null}
//           </p>
//         </div>
//         <time
//           dateTime={createdAt.toISOString()}
//           className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500"
//         >
//           {DateTime.fromJSDate(createdAt).toNiceFormat()}
//         </time>
//       </div>
//       <div className="mt-1 text-gray-600 dark:text-gray-200">
//         <MarkdownView content={result} />
//       </div>

//       <Drawer>
//         <DrawerTrigger
//           className={buttonVariants({ variant: "link", className: "pl-0" })}
//         >
//           View Raw
//         </DrawerTrigger>
//         <DrawerContent>
//           <DrawerHeader />

//           <Tabs defaultValue="response">
//             <TabsList className="ml-4">
//               <TabsTrigger value="response">Response</TabsTrigger>
//               <TabsTrigger value="request">Request</TabsTrigger>
//             </TabsList>
//             <TabsContent value="response">
//               <pre className="p-4 bg-secondary overflow-scroll whitespace-pre-wrap max-h-[320px]">
//                 {JSON.stringify(result, null, 2)}
//               </pre>
//             </TabsContent>
//             <TabsContent value="request">
//               <pre className="p-4 bg-secondary overflow-scroll whitespace-pre-wrap max-h-[320px]">
//                 {JSON.stringify(rawRequest, null, 2)}
//               </pre>
//             </TabsContent>
//           </Tabs>

//           <DrawerFooter>
//             <DrawerClose asChild>
//               <Button variant="outline" className="mb-6">
//                 Close
//               </Button>
//             </DrawerClose>
//           </DrawerFooter>
//         </DrawerContent>
//       </Drawer>
//     </li>
//   );
// }


