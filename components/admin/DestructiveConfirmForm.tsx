"use client";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
};

export function DestructiveConfirmForm({
  action,
  confirmMessage,
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
      {children}
    </form>
  );
}
