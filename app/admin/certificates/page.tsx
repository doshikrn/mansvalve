import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listAdminCertificates } from "@/lib/services/certificates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRemoteMedia(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
}

export default async function AdminCertificatesPage() {
  await requireAdmin("/admin/certificates");

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        База данных не настроена.
      </p>
    );
  }

  const certificates = await listAdminCertificates();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-xl font-semibold tracking-tight">Сертификаты</h1>
          <p className="text-sm text-muted-foreground">
            Управление документами и сертификатами компании. Всего: {certificates.length}
          </p>
        </header>
        <Button asChild size="sm">
          <Link href="/admin/certificates/new">+ Новый сертификат</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 font-medium">Превью</th>
                <th className="px-4 py-2 font-medium">Название</th>
                <th className="px-4 py-2 font-medium">Дата</th>
                <th className="px-4 py-2 font-medium">Порядок</th>
                <th className="px-4 py-2 font-medium">Статус</th>
                <th className="px-4 py-2 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody>
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Сертификаты пока не добавлены.
                  </td>
                </tr>
              ) : (
                certificates.map((certificate) => (
                  <tr key={certificate.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2">
                      <div className="relative h-12 w-12 overflow-hidden rounded border border-border bg-muted/30">
                        <Image
                          src={certificate.mediaUrl}
                          alt={certificate.mediaAlt || certificate.title}
                          fill
                          sizes="48px"
                          unoptimized={isRemoteMedia(certificate.mediaUrl)}
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-medium">{certificate.title}</p>
                      <p className="text-xs text-muted-foreground">ID {certificate.id}</p>
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {certificate.issuedAt
                        ? new Date(certificate.issuedAt).toLocaleDateString("ru-RU")
                        : "—"}
                    </td>
                    <td className="px-4 py-2 tabular-nums">{certificate.sortOrder}</td>
                    <td className="px-4 py-2">
                      {certificate.isActive ? (
                        <Badge variant="secondary">активен</Badge>
                      ) : (
                        <Badge variant="outline">скрыт</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button asChild size="xs" variant="outline">
                        <Link href={`/admin/certificates/${certificate.id}`}>Изменить</Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
