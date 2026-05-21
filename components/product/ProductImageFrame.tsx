import Image, { type ImageProps } from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ProductImageFrameProps = Pick<
  ImageProps,
  "src" | "alt" | "sizes" | "quality" | "priority" | "placeholder" | "blurDataURL" | "unoptimized"
> & {
  className?: string;
  imageClassName?: string;
  safeAreaClassName?: string;
  tone?: "light" | "dark";
  children?: ReactNode;
};

export function ProductImageFrame({
  src,
  alt,
  sizes,
  quality = 90,
  priority,
  placeholder,
  blurDataURL,
  unoptimized,
  className,
  imageClassName,
  safeAreaClassName,
  tone = "light",
  children,
}: ProductImageFrameProps) {
  const isDark = tone === "dark";

  return (
    <div
      className={cn(
        "relative isolate aspect-[4/3] w-full overflow-hidden",
        isDark ? "bg-[#0B1728]" : "bg-[#F3F6FA]",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          isDark
            ? "bg-[radial-gradient(circle_at_50%_28%,rgba(47,107,255,0.16),transparent_42%)]"
            : "bg-[radial-gradient(circle_at_50%_24%,rgba(47,107,255,0.10),transparent_44%)]",
        )}
      />
      <div className={cn("absolute inset-0 p-4 sm:p-5", safeAreaClassName)}>
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={alt}
            fill
            quality={quality}
            priority={priority}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            unoptimized={unoptimized}
            sizes={sizes}
            className={cn(
              "object-contain object-center transition-transform duration-300 ease-out group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
              imageClassName,
            )}
          />
        </div>
      </div>
      {children ? <div className="pointer-events-none absolute inset-0 z-10">{children}</div> : null}
    </div>
  );
}
