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
      className="relative bg-white px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 hover:bg-gray-50"
    >
      <div className="flex justify-between space-x-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 space-x-2">
            <span>{createdBy}</span>
            {model ? (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="text-gray-600 font-normal">{model}</span>
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
      <div className="mt-1">
        {result.includes("```") ? (
          <ReactMarkdown className="text-sm text-gray-600 prose">
            {result}
          </ReactMarkdown>
        ) : (
          <p className="text-sm text-gray-600 whitespace-pre-line">{result}</p>
        )}
      </div>
    </li>
  );
}
