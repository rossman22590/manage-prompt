"use client";

import MarkdownView from "@/components/markdown/markdown-view";
import { DateTime } from "@/lib/utils/datetime";
import type { WorkflowRun } from "@prisma/client";
import { GitBranchIcon, LinkIcon } from "lucide-react";
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

  // Extract citations from rawResult
  const citations = typeof rawResult === 'object' && rawResult !== null
    ? (rawResult as any).citations || []
    : [];

  return (
    <li
      key={workflowRun.id}
      className="relative overflow-x-scroll px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary"
    >
      <div className="flex justify-between space-x-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900 dark:text-gray-100 space-x-2">
            <span>{user?.name ?? "API"}</span>

            <span aria-hidden="true">&middot;</span>
            <span className="text-gray-600 dark:text-gray-400 font-normal">
              <GitBranchIcon className="w-4 h-4 mr-1 inline" />{" "}
              {branchId ?? "main"}
            </span>

            {totalTokenCount ? (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="text-gray-600 dark:text-gray-400 font-normal">
                  {totalTokenCount} tokens
                </span>
              </>
            ) : null}
          </p>
        </div>
        <time
          dateTime={createdAt.toISOString()}
          className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500"
        >
          {DateTime.fromJSDate(createdAt).toNiceFormat()}
        </time>
      </div>
      <div className="mt-1 text-gray-600 dark:text-gray-200">
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
              <pre className="p-4 bg-secondary overflow-scroll whitespace-pre-wrap max-h-[320px]">
                {JSON.stringify(rawResult, null, 2)}
              </pre>
            </TabsContent>
            <TabsContent value="request">
              <pre className="p-4 bg-secondary overflow-scroll whitespace-pre-wrap max-h-[320px]">
                {JSON.stringify(rawRequest, null, 2)}
              </pre>
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
// import type { WorkflowRun } from "@prisma/client";
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
