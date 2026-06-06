import Image from "next/image";

import { mediaImageNeedsUnoptimized } from "@/lib/media-image";

type TrustProofImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function TrustProofImage({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
}: TrustProofImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      loading={priority ? undefined : "lazy"}
      unoptimized={mediaImageNeedsUnoptimized(src)}
      quality={85}
    />
  );
}
