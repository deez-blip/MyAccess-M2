"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { auditApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function AuditPageTracker() {
  const pathname = usePathname();
  const { session, isLoading } = useAuth();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading || !pathname || lastTrackedPathRef.current === pathname) {
      return;
    }

    lastTrackedPathRef.current = pathname;
    const search = window.location.search || "";
    const path = `${pathname}${search}`;

    auditApi
      .trackPageView(
        {
          path,
          title: document.title,
          referrer: document.referrer,
        },
        session?.accessToken
      )
      .catch((error) => {
        console.error("Erreur audit page_view:", error);
      });
  }, [isLoading, pathname, session?.accessToken]);

  return null;
}
