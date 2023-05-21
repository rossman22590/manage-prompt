import { WorkflowRun } from "@prisma/client";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

interface Props {
  workflowRun: WorkflowRun;
}

export async function WorkflowRunItem({ workflowRun }: Props) {
  const { result, createdBy, createdAt, rawResult } = workflowRun;
  const model = (rawResult as any)?.model as string;

  return (
    <li
      key={workflowRun.id}
      className="relative px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 hover:bg-gray-50 dark:hover:bg-gray-900"
    >
      <div className="flex justify-between space-x-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100 space-x-2">
            <span>{createdBy}</span>
            {model ? (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="text-gray-600 dark:text-gray-400 font-normal">
                  {model}
                </span>
              </>
            ) : null}
          </p>
        </div>
        <time
          dateTime={new Date(createdAt).toISOString()}
          className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500"
        >
          {new Date(createdAt).toLocaleTimeString()}
        </time>
      </div>
      <div className="mt-1 text-gray-600 dark:text-gray-200">
        {result.includes("```") ? (
          <ReactMarkdown className="text-sm prose dark:prose-invert">
            {result}
          </ReactMarkdown>
        ) : (
          <p className="text-sm whitespace-pre-line">{result}</p>
        )}
      </div>
    </li>
  );
}
