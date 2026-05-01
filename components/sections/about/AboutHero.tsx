import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type AboutHeroProps = {
  breadcrumbCurrent: string;
  title: string;
  subtitle: string;
  description: string;
  heroImages?: string[];
};

function isRemoteMedia(url: string) {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
}

export function AboutHero({
  breadcrumbCurrent,
  title,
  subtitle,
  description,
  heroImages = [],
}: AboutHeroProps) {
  const [primaryImage, ...thumbs] = heroImages.filter(Boolean).slice(0, 5);
  return (
    <section className="relative overflow-hidden border-b border-site-border bg-gradient-to-br from-[#061738] via-[#0B2453] to-[#123A74]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(59,130,246,0.22),transparent_44%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <nav aria-label="Хлебные крошки" className="mb-7">
          <ol className="flex items-center gap-1.5 text-sm">
            <li>
              <Link href="/" className="text-slate-300 transition-colors hover:text-white">
                Главная
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} className="text-slate-400" />
            </li>
            <li>
              <span className="font-medium text-white" aria-current="page">
                {breadcrumbCurrent}
              </span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              О компании
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
            <h2 className="mt-3 text-lg font-semibold text-blue-100 sm:text-xl">{subtitle}</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-200">{description}</p>
          </div>

          <div className="grid gap-3">
            <div className="overflow-hidden rounded-2xl border border-white/20 bg-slate-900/35 backdrop-blur-sm">
              {primaryImage ? (
                <Image
                  src={primaryImage}
                  alt={title}
                  width={1200}
                  height={720}
                  className="h-full min-h-[260px] w-full object-cover lg:min-h-[360px]"
                  unoptimized={isRemoteMedia(primaryImage)}
                />
              ) : (
                <div className="flex h-full min-h-[260px] items-center justify-center text-sm text-slate-300 lg:min-h-[360px]">
                  Изображение компании
                </div>
              )}
            </div>
            {thumbs.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {thumbs.map((imageSrc, index) => (
                  <div
                    key={`${imageSrc}-${index}`}
                    className="overflow-hidden rounded-xl border border-white/20 bg-slate-900/25"
                  >
                    <Image
                      src={imageSrc}
                      alt={`${title} ${index + 2}`}
                      width={360}
                      height={220}
                      className="h-20 w-full object-cover sm:h-24"
                      unoptimized={isRemoteMedia(imageSrc)}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
