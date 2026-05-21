"use client";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  title?: string;
  details?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function DestructiveConfirmForm({
  action,
  confirmMessage,
  title = "Опасное действие",
  details,
  children,
  className,
}: Props) {
  return (
    <form
      className={className}
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <div className="space-y-3">
        {details ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-950">
            <p className="font-semibold">{title}</p>
            <div className="mt-1 leading-relaxed">{details}</div>
          </div>
        ) : null}
        {children}
      </div>
    </form>
  );
}
