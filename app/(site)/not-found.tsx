import { NotFoundContent } from "@/components/layout/NotFoundContent";

/** 404 внутри публичного `(site)` layout — chrome уже в layout, без дубля Header/Footer. */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
