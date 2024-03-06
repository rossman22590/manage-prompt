import { AIModel, AIModelToLabel } from "@/data/workflow";
import { DateTime } from "@/lib/utils/datetime";
import { WorkflowRun } from "@prisma/client";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Button, buttonVariants } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "../ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

type WorkflowRunWithUser = WorkflowRun & {
  user: {
    first_name: string | null;
  };
};

interface Props {
  workflowRun: WorkflowRunWithUser;
}

export async function WorkflowRunItem({ workflowRun }: Props) {
  const { result, user, createdAt, rawResult, rawRequest, totalTokenCount } =
    workflowRun;
  const model = (rawResult as any)?.model as AIModel;

  return (
    <li
      key={workflowRun.id}
      className="relative overflow-x-scroll px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
    >
      <div className="flex justify-between space-x-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900 dark:text-gray-100 space-x-2">
            <span>{user?.first_name ?? "API"}</span>

            {model ? (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="text-gray-600 dark:text-gray-400 font-normal">
                  {AIModelToLabel[model] ?? model}
                </span>
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
        <ReactMarkdown className="prose dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-500">
          {result}
        </ReactMarkdown>
      </div>

      <Drawer>
        <DrawerTrigger
          className={buttonVariants({ variant: "link", className: "pl-0" })}
        >
          View Raw
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader></DrawerHeader>

          <Tabs defaultValue="response">
            <TabsList className="ml-4">
              <TabsTrigger value="response">Response</TabsTrigger>
              <TabsTrigger value="request">Request</TabsTrigger>
            </TabsList>
            <TabsContent value="response">
              <pre className="p-4 bg-secondary overflow-scroll whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </TabsContent>
            <TabsContent value="request">
              <pre className="p-4 bg-secondary overflow-scroll whitespace-pre-wrap">
                {JSON.stringify(rawRequest, null, 2)}
              </pre>
            </TabsContent>
          </Tabs>

          <DrawerFooter>
            <DrawerClose>
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
