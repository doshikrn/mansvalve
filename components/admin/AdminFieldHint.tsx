import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function AdminFieldHint({ children, className }: Props) {
  return (
    <p className={cn("text-xs leading-5 text-muted-foreground", className)}>
      {children}
    </p>
  );
}
