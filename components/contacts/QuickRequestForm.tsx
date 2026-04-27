"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send } from "lucide-react";
import { getPageAnalyticsContext, trackEvent } from "@/lib/analytics";
import { buildCompanyWhatsAppUrl } from "@/lib/company";
const FIRST_TOUCH_STORAGE_KEY = "mansvalve:first-touch-attribution";
const FIRST_TOUCH_STORAGE_VERSION = 1;
const FIRST_TOUCH_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/* ── Types ────────────────────────────────────────────────────────── */

interface FormState {
  name: string;
  phone: string;
  comment: string;
}

interface ProductContext {
  productName?: string;
  productSlug?: string;
  productCategory?: string;
  productSubcategory?: string;
}

interface AttributionContext {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  yclid?: string;
  fbclid?: string;
  referrer?: string;
  landing_path?: string;
  first_touch_at?: string;
}

interface StoredFirstTouchAttribution {
  version: number;
  stored_at: string;
  expires_at: string;
  attribution: AttributionContext;
}

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "yclid",
  "fbclid",
  "referrer",
] as const;

const FIRST_TOUCH_META_KEYS = ["landing_path", "first_touch_at"] as const;
const PERSISTED_ATTRIBUTION_KEYS = [
  ...ATTRIBUTION_KEYS,
  ...FIRST_TOUCH_META_KEYS,
] as const;

type Errors = Partial<Record<keyof FormState, string>>;
type SubmitState = "idle" | "submitting" | "success" | "error";

export interface QuickRequestFormProps {
  /** "light" = white card (contacts page), "dark" = dark blue gradient (homepage) */
  variant?: "light" | "dark";
  source?: string;
  productContext?: ProductContext;
}

/* ── Per-variant style tokens ─────────────────────────────────────── */

const STYLES = {
  light: {
    idPrefix: "contact",
    label: "text-slate-700",
    labelOptional: "text-slate-400",
    inputBase:
      "text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500",
    inputNormal:
      "border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500",
    inputError: "border-red-400 bg-red-50 focus:ring-red-400",
    textarea:
      "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
    errorText: "text-red-600",
    submitBtn: "bg-blue-700 text-white hover:bg-blue-600",
    footer: "text-slate-400",
    policyLink: "text-slate-500 underline decoration-slate-400 underline-offset-2 hover:text-slate-800",
    successTitle: "text-slate-900",
    successBody: "text-slate-500",
    resetBtn: "text-slate-400 hover:text-slate-700",
    errorBox: "border-red-200 bg-red-50 text-red-700",
    errorLink: "text-red-700",
  },
  dark: {
    idPrefix: "request",
    label: "text-blue-200",
    labelOptional: "text-blue-300/70",
    inputBase:
      "text-white outline-none transition focus:ring-2 focus:ring-white/30",
    inputNormal:
      "border-blue-400/30 bg-white/10 placeholder:text-blue-300 hover:border-blue-300/50 focus:border-white focus:bg-white/15",
    inputError:
      "border-red-400/70 bg-red-500/10 placeholder:text-blue-300",
    textarea:
      "border-blue-400/30 bg-white/10 text-white placeholder:text-blue-300 hover:border-blue-300/50 focus:border-white focus:bg-white/15 focus:ring-2 focus:ring-white/30",
    errorText: "text-red-300",
    submitBtn: "bg-white text-blue-800 hover:bg-blue-50",
    footer: "text-blue-300",
    policyLink: "text-blue-200/90 underline decoration-blue-300/50 underline-offset-2 hover:text-white",
    successTitle: "text-white",
    successBody: "text-blue-200",
    resetBtn: "text-blue-300 hover:text-white",
    errorBox: "border-red-300/40 bg-red-500/10 text-red-100",
    errorLink: "text-red-100",
  },
} as const;

/* ── Helpers ──────────────────────────────────────────────────────── */

function maskPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  let out = "+7";
  if (digits.length > 1) out += " (" + digits.slice(1, 4);
  if (digits.length > 4) out += ") " + digits.slice(4, 7);
  if (digits.length > 7) out += "-" + digits.slice(7, 9);
  if (digits.length > 9) out += "-" + digits.slice(9, 11);
  return out;
}

function buildWhatsAppUrl(values: FormState, productContext?: ProductContext): string {
  const parts = [
    "Здравствуйте!",
    productContext?.productName ? `Товар: ${productContext.productName}.` : null,
    productContext?.productSlug ? `Slug: ${productContext.productSlug}.` : null,
    productContext?.productCategory ? `Категория: ${productContext.productCategory}.` : null,
    productContext?.productSubcategory
      ? `Подкатегория: ${productContext.productSubcategory}.`
      : null,
    `Меня зовут ${values.name.trim()}.`,
    `Мой номер: ${values.phone}.`,
    values.comment.trim()
      ? `Вопрос/комментарий: ${values.comment.trim()}`
      : "Хочу уточнить детали по поставке промышленной арматуры.",
  ]
    .filter(Boolean)
    .join(" ");
  return buildCompanyWhatsAppUrl(parts);
}

function validate(values: FormState): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Введите ваше имя";
  const digits = values.phone.replace(/\D/g, "");
  if (digits.length < 11)
    errors.phone = "Введите корректный номер +7 (XXX) XXX-XX-XX";
  return errors;
}

function getAttributionContext(): AttributionContext {
  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get("utm_source")?.trim() || undefined,
    utm_medium: params.get("utm_medium")?.trim() || undefined,
    utm_campaign: params.get("utm_campaign")?.trim() || undefined,
    utm_term: params.get("utm_term")?.trim() || undefined,
    utm_content: params.get("utm_content")?.trim() || undefined,
    gclid: params.get("gclid")?.trim() || undefined,
    yclid: params.get("yclid")?.trim() || undefined,
    fbclid: params.get("fbclid")?.trim() || undefined,
    referrer: document.referrer?.trim() || undefined,
  };
}

function getStoredFirstTouchAttribution(): AttributionContext {
  try {
    const raw = window.localStorage.getItem(FIRST_TOUCH_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as StoredFirstTouchAttribution | null;
    if (!parsed || typeof parsed !== "object") {
      window.localStorage.removeItem(FIRST_TOUCH_STORAGE_KEY);
      return {};
    }

    if (parsed.version !== FIRST_TOUCH_STORAGE_VERSION) {
      window.localStorage.removeItem(FIRST_TOUCH_STORAGE_KEY);
      return {};
    }

    if (typeof parsed.stored_at !== "string" || typeof parsed.expires_at !== "string") {
      window.localStorage.removeItem(FIRST_TOUCH_STORAGE_KEY);
      return {};
    }

    const storedAtMs = Date.parse(parsed.stored_at);
    const expiresAtMs = Date.parse(parsed.expires_at);

    if (
      Number.isNaN(storedAtMs) ||
      Number.isNaN(expiresAtMs) ||
      expiresAtMs <= Date.now() ||
      expiresAtMs <= storedAtMs
    ) {
      window.localStorage.removeItem(FIRST_TOUCH_STORAGE_KEY);
      return {};
    }

    if (!parsed.attribution || typeof parsed.attribution !== "object") {
      window.localStorage.removeItem(FIRST_TOUCH_STORAGE_KEY);
      return {};
    }

    const normalized: AttributionContext = {};
    for (const key of PERSISTED_ATTRIBUTION_KEYS) {
      const value = parsed.attribution[key];
      if (typeof value === "string" && value.trim()) {
        normalized[key] = value.trim();
      }
    }
    return normalized;
  } catch {
    try {
      window.localStorage.removeItem(FIRST_TOUCH_STORAGE_KEY);
    } catch {
      // Ignore storage access errors.
    }
    return {};
  }
}

function persistFirstTouchAttribution(attribution: AttributionContext) {
  const now = new Date();
  const payload: StoredFirstTouchAttribution = {
    version: FIRST_TOUCH_STORAGE_VERSION,
    stored_at: now.toISOString(),
    expires_at: new Date(now.getTime() + FIRST_TOUCH_TTL_MS).toISOString(),
    attribution,
  };

  try {
    window.localStorage.setItem(FIRST_TOUCH_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage write errors and continue with in-memory values.
  }
}

function getFirstTouchAttribution(currentTouch: AttributionContext): AttributionContext {
  const existing = getStoredFirstTouchAttribution();
  const next: AttributionContext = { ...existing };
  let changed = false;
  const hasFirstTouch =
    Boolean(existing.first_touch_at) ||
    Boolean(existing.landing_path) ||
    ATTRIBUTION_KEYS.some((key) => Boolean(existing[key]));

  if (!hasFirstTouch) {
    next.landing_path = `${window.location.pathname}${window.location.search}`;
    next.first_touch_at = new Date().toISOString();
    changed = true;
  }

  for (const key of ATTRIBUTION_KEYS) {
    if (next[key]) continue;
    const currentValue = currentTouch[key];
    if (!currentValue) continue;
    next[key] = currentValue;
    changed = true;
  }

  if (changed) {
    persistFirstTouchAttribution(next);
  }

  return next;
}

/* ── Component ────────────────────────────────────────────────────── */

export function QuickRequestForm({
  variant = "light",
  source = "quick-request-form",
  productContext,
}: QuickRequestFormProps) {
  const s = STYLES[variant];
  const formRef = useRef<HTMLFormElement | null>(null);
  const hasTrackedFormViewRef = useRef(false);
  const [values, setValues] = useState<FormState>({ name: "", phone: "", comment: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");

  function handlePhoneChange(raw: string) {
    setValues((v) => ({ ...v, phone: maskPhone(raw) }));
    if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }));
  }

  function resetForm() {
    setValues({ name: "", phone: "", comment: "" });
    setErrors({});
    setSubmitError(null);
    setSubmitState("idle");
    setWebsite("");
  }

  useEffect(() => {
    const currentTouch = getAttributionContext();
    getFirstTouchAttribution(currentTouch);
  }, []);

  useEffect(() => {
    if (submitState === "success") return;
    if (hasTrackedFormViewRef.current) return;

    const emitFormView = () => {
      if (hasTrackedFormViewRef.current) return;
      hasTrackedFormViewRef.current = true;

      const pathname = window.location.pathname;
      const search = window.location.search;
      const page = `${pathname}${search}`;
      const pageContext = getPageAnalyticsContext(pathname);

      trackEvent("request_form_view", {
        source,
        page,
        pathname,
        search,
        product_slug: productContext?.productSlug ?? pageContext.product_slug,
        product_name: productContext?.productName,
        category: productContext?.productCategory ?? pageContext.category,
      });
    };

    const formElement = formRef.current;
    if (!formElement) return;

    if (typeof window.IntersectionObserver !== "function") {
      emitFormView();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (!firstEntry?.isIntersecting) return;
        emitFormView();
        observer.disconnect();
      },
      { threshold: 0.25 },
    );

    observer.observe(formElement);
    return () => observer.disconnect();
  }, [productContext, source, submitState]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitState("submitting");
    setSubmitError(null);

    try {
      const page = `${window.location.pathname}${window.location.search}`;
      const pageContext = getPageAnalyticsContext(window.location.pathname);
      const currentTouch = getAttributionContext();
      const firstTouch = getFirstTouchAttribution(currentTouch);

      const response = await fetch("/api/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          source,
          page: `${window.location.pathname}${window.location.search}`,
          website,
          productName: productContext?.productName,
          productSlug: productContext?.productSlug,
          productCategory: productContext?.productCategory,
          productSubcategory: productContext?.productSubcategory,
          ...currentTouch,
          first_utm_source: firstTouch.utm_source,
          first_utm_medium: firstTouch.utm_medium,
          first_utm_campaign: firstTouch.utm_campaign,
          first_utm_term: firstTouch.utm_term,
          first_utm_content: firstTouch.utm_content,
          first_gclid: firstTouch.gclid,
          first_yclid: firstTouch.yclid,
          first_fbclid: firstTouch.fbclid,
          first_referrer: firstTouch.referrer,
          first_landing_path: firstTouch.landing_path,
          first_touch_at: firstTouch.first_touch_at,
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || result?.ok !== true) {
        throw new Error(
          result?.error ?? "Не удалось отправить заявку через сайт. Попробуйте WhatsApp.",
        );
      }

      trackEvent("request_form_submit_success", {
        source,
        page,
        product_slug: productContext?.productSlug ?? pageContext.product_slug,
        product_name: productContext?.productName,
        category: productContext?.productCategory ?? pageContext.category,
      });
      setSubmitState("success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ошибка отправки. Попробуйте написать нам в WhatsApp.";
      const page = `${window.location.pathname}${window.location.search}`;
      const pageContext = getPageAnalyticsContext(window.location.pathname);
      trackEvent("request_form_submit_error", {
        source,
        page,
        error_message: message,
        product_slug: productContext?.productSlug ?? pageContext.product_slug,
        product_name: productContext?.productName,
        category: productContext?.productCategory ?? pageContext.category,
      });
      setSubmitState("error");
      setSubmitError(message);

      trackEvent("whatsapp_click", {
        source: `${source}-fallback`,
        page,
        product_slug: productContext?.productSlug ?? pageContext.product_slug,
        product_name: productContext?.productName,
        category: productContext?.productCategory ?? pageContext.category,
      });
      window.open(
        buildWhatsAppUrl(values, productContext),
        "_blank",
        "noopener,noreferrer",
      );
    }
  }

  if (submitState === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <MessageCircle className="h-7 w-7 text-green-600" />
        </div>
        <div>
          <p className={`text-lg font-semibold ${s.successTitle}`}>
            Заявка отправлена!
          </p>
          <p className={`mt-1 text-sm ${s.successBody}`}>
            Мы получили запрос и передали его менеджеру. В рабочее время обычно направим КП в течение 15 минут.
          </p>
        </div>
        <button
          onClick={resetForm}
          className={`text-sm underline underline-offset-2 transition-colors ${s.resetBtn}`}
        >
          Отправить ещё одну заявку
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {submitState === "error" && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${s.errorBox}`} role="alert">
          <p>{submitError ?? "Не удалось отправить заявку через сайт."}</p>
          <a
            href={buildWhatsAppUrl(values, productContext)}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-1.5 inline-flex font-semibold underline underline-offset-2 hover:no-underline ${s.errorLink}`}
          >
            Открыть WhatsApp
          </a>
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor={`${s.idPrefix}-name`}
          className={`mb-1.5 block text-sm font-medium ${s.label}`}
        >
          Ваше имя / организация{" "}
          <span className="text-red-400">*</span>
        </label>
        <input
          id={`${s.idPrefix}-name`}
          type="text"
          autoComplete="name"
          value={values.name}
          disabled={submitState === "submitting"}
          onChange={(e) => {
            setValues((v) => ({ ...v, name: e.target.value }));
            if (errors.name) setErrors((err) => ({ ...err, name: undefined }));
          }}
          placeholder="Иван Петров / ТОО «Строй-КЗ»"
          className={`w-full rounded-xl border px-4 py-3.5 text-sm ${s.inputBase} ${
            errors.name ? s.inputError : s.inputNormal
          }`}
        />
        {errors.name && (
          <p className={`mt-1.5 text-xs ${s.errorText}`}>{errors.name}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor={`${s.idPrefix}-phone`}
          className={`mb-1.5 block text-sm font-medium ${s.label}`}
        >
          Телефон <span className="text-red-400">*</span>
        </label>
        <input
          id={`${s.idPrefix}-phone`}
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={values.phone}
          disabled={submitState === "submitting"}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="+7 (700) 000-00-00"
          className={`w-full rounded-xl border px-4 py-3.5 text-sm ${s.inputBase} ${
            errors.phone ? s.inputError : s.inputNormal
          }`}
        />
        {errors.phone && (
          <p className={`mt-1.5 text-xs ${s.errorText}`}>{errors.phone}</p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label
          htmlFor={`${s.idPrefix}-comment`}
          className={`mb-1.5 block text-sm font-medium ${s.label}`}
        >
          Комментарий{" "}
          <span className={`ml-1 text-xs font-normal ${s.labelOptional}`}>
            (необязательно)
          </span>
        </label>
        <textarea
          id={`${s.idPrefix}-comment`}
          rows={3}
          value={values.comment}
          disabled={submitState === "submitting"}
          onChange={(e) => setValues((v) => ({ ...v, comment: e.target.value }))}
          placeholder="Что нужно? (DN, PN, количество, тип арматуры — по возможности)"
          className={`w-full resize-none rounded-xl border px-4 py-3.5 text-sm outline-none transition ${s.textarea}`}
        />
      </div>

      {/* Honeypot field for basic anti-spam */}
      <div
        className="pointer-events-none absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <label htmlFor={`${s.idPrefix}-website`}>Ваш сайт</label>
        <input
          id={`${s.idPrefix}-website`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={submitState === "submitting"}
        className={`w-full rounded-xl py-4 text-base font-bold ${s.submitBtn}`}
      >
        <Send className="mr-2 h-4 w-4" />
        {submitState === "submitting" ? "Отправляем КП..." : "Получить КП"}
      </Button>

      <p className={`text-center text-xs ${s.footer}`}>
        Заявка отправляется напрямую менеджеру. Если доставка не сработает,
        автоматически предложим WhatsApp.
      </p>
      <p className={`text-center text-xs ${s.footer}`}>
        Отправляя форму, вы соглашаетесь с обработкой персональных данных
        в соответствии с{" "}
        <Link href="/privacy" className={s.policyLink}>
          политикой конфиденциальности
        </Link>
        .
      </p>
    </form>
  );
}
