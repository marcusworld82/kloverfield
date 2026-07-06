import { Construction } from "lucide-react";

export function TabPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-red-muted text-accent-red">
        <Construction size={24} />
      </div>
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
        {description}
      </p>
      <p className="mt-4 rounded-full border border-border-default px-4 py-1.5 text-xs text-text-muted">
        Coming in build phase 2
      </p>
    </div>
  );
}
