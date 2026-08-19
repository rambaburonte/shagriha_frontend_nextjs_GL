import type { ReactNode } from "react";

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
  className?: string;
}

const EmptyState = ({ message, action, className = "" }: EmptyStateProps) => (
  <div
    className={"flex min-h-[50vh] flex-col items-center justify-center px-4 text-center " + className}
  >
    <p className="text-lg font-medium text-gray-700">{message}</p>
    {action}
  </div>
);

export default EmptyState;
