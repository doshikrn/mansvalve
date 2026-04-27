import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { getPublicCatalogCategories } from "@/lib/public-catalog";
import { COMPANY, COMPANY_PHONE_HREF, COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";

export async function Footer() {
  const categories = await getPublicCatalogCategories();

  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="block" aria-label={`Главная — ${COMPANY.name}`}>
              <div className="relative h-14 w-[300px]">
                <Image
                  src="/images/logo-mansvalve-light.png"
                  alt={`${COMPANY.name} logo`}
                  fill
                  sizes="300px"
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="mt-2 text-sm text-slate-500">
              Промышленная арматура в Казахстане. Прямые поставки,
              сертификаты, доставка по РК.
            </p>
          </div>

          {/* Catalog links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Каталог</h4>
            <ul className="space-y-1.5 text-sm text-slate-500">
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/catalog/category/${cat.slug}`}
                    className="hover:text-blue-700 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Компания</h4>
            <ul className="space-y-1.5 text-sm text-slate-500">
              <li>
                <Link href="/about" className="hover:text-blue-700 transition-colors">
                  О компании
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="hover:text-blue-700 transition-colors">
                  Контакты
                </Link>
              </li>
              <li>
                <Link href="/certificates" className="hover:text-blue-700 transition-colors">
                  Сертификаты
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-blue-700 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-700 transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Связаться</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <a
                  href={COMPANY_PHONE_HREF}
                  className="hover:text-blue-700 transition-colors"
                >
                  {COMPANY.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <WhatsappIcon className="h-4 w-4 text-green-500" />
                <a
                  href={COMPANY_WHATSAPP_BASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-700 transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} {COMPANY.name}. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
