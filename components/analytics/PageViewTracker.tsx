"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { getPageAnalyticsContext, trackEvent } from "@/lib/analytics";

const SCROLL_THRESHOLDS = [25, 50, 75, 100] as const;

interface PageVisitContext {
  page: string;
  pathname: string;
  search: string;
  product_slug?: string;
  category?: string;
  startedAtMs: number;
  engagementSent: boolean;
  emittedScrollThresholds: Set<number>;
  emittedFunnelSteps: Set<string>;
}

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const search = searchString ? `?${searchString}` : "";
  const lastTrackedPageRef = useRef<string | null>(null);
  const pageVisitRef = useRef<PageVisitContext | null>(null);
  const scrollRafRef = useRef<number | null>(null);

  const emitScrollDepthForCurrentVisit = useCallback(() => {
    const visit = pageVisitRef.current;
    if (!visit) return;

    const doc = document.documentElement;
    const body = document.body;
    const scrollTop = Math.max(window.scrollY, doc.scrollTop, body.scrollTop);
    const scrollHeight = Math.max(doc.scrollHeight, body.scrollHeight);
    const viewportHeight = Math.max(window.innerHeight, doc.clientHeight);
    const maxScrollable = Math.max(scrollHeight - viewportHeight, 0);
    const progressPercent =
      maxScrollable === 0 ? 100 : Math.min(100, Math.max(0, (scrollTop / maxScrollable) * 100));

    for (const threshold of SCROLL_THRESHOLDS) {
      if (progressPercent < threshold || visit.emittedScrollThresholds.has(threshold)) continue;
      visit.emittedScrollThresholds.add(threshold);
      trackEvent("scroll_depth", {
        source: "app-router",
        page: visit.page,
        pathname: visit.pathname,
        search: visit.search,
        scroll_percent: threshold,
        product_slug: visit.product_slug,
        category: visit.category,
      });
    }
  }, []);

  const scheduleScrollDepthCheck = useCallback(() => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      emitScrollDepthForCurrentVisit();
    });
  }, [emitScrollDepthForCurrentVisit]);

  const emitEngagement = useCallback((trigger: "hidden" | "route_change" | "unmount") => {
    const visit = pageVisitRef.current;
    if (!visit || visit.engagementSent) return;

    const engagementTimeMs = Math.max(0, Date.now() - visit.startedAtMs);
    trackEvent("page_engagement", {
      source: "app-router",
      trigger,
      page: visit.page,
      pathname: visit.pathname,
      search: visit.search,
      engagement_time_ms: engagementTimeMs,
      product_slug: visit.product_slug,
      category: visit.category,
    });

    visit.engagementSent = true;
  }, []);

  useEffect(() => {
    const onScrollOrResize = () => {
      scheduleScrollDepthCheck();
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    scheduleScrollDepthCheck();

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);

      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, [scheduleScrollDepthCheck]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        emitEngagement("hidden");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      emitEngagement("unmount");
    };
  }, [emitEngagement]);

  useEffect(() => {
    const context = getPageAnalyticsContext(pathname);
    const page = `${pathname}${search}`;

    const currentVisit = pageVisitRef.current;
    if (currentVisit && currentVisit.page !== page) {
      emitEngagement("route_change");
    }

    pageVisitRef.current = {
      page,
      pathname,
      search,
      product_slug: context.product_slug,
      category: context.category,
      startedAtMs: Date.now(),
      engagementSent: false,
      emittedScrollThresholds: new Set<number>(),
      emittedFunnelSteps: new Set<string>(),
    };
    scheduleScrollDepthCheck();

    if (lastTrackedPageRef.current === page) return;
    lastTrackedPageRef.current = page;

    trackEvent("page_view", {
      source: "app-router",
      page,
      pathname,
      search,
      title: document.title || undefined,
      product_slug: context.product_slug,
      category: context.category,
    });

    const visit = pageVisitRef.current;
    if (!visit) return;

    if (pathname === "/catalog" || pathname.startsWith("/catalog/category/")) {
      const step = "catalog_view";
      if (!visit.emittedFunnelSteps.has(step)) {
        visit.emittedFunnelSteps.add(step);
        trackEvent(step, {
          source: "app-router",
          page,
          pathname,
          search,
          category: context.category,
        });
      }
    }

    if (context.product_slug) {
      const step = "product_view";
      if (!visit.emittedFunnelSteps.has(step)) {
        visit.emittedFunnelSteps.add(step);
        trackEvent(step, {
          source: "app-router",
          page,
          pathname,
          search,
          product_slug: context.product_slug,
          category: context.category,
        });
      }
    }
  }, [emitEngagement, pathname, scheduleScrollDepthCheck, search]);

  return null;
}
