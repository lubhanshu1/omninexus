"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiUrl, getStoredToken } from "@/lib/api";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(pathname === "/login");

  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "OmniNexus OS — Command Center",
      "/login": "OmniNexus OS — Sign In",
      "/career-simulator": "OmniNexus OS — Career Simulator",
      "/recruiter": "OmniNexus OS — Talent Matcher",
      "/observatory": "OmniNexus OS — Workforce Observatory",
      "/database": "OmniNexus OS — System Database",
      "/future-lab": "OmniNexus OS — Future Lab",
    };
    document.title = titles[pathname] || "OmniNexus OS";

    if (pathname === "/login") {
      setReady(true);
      return;
    }

    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const controller = new AbortController();

    fetch(apiUrl("/api/v1/auth/me"), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Auth validation failed: ${response.status}`);
        }
        setReady(true);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.warn("OmniNexus session validation failed:", error);
        window.sessionStorage.removeItem("omninexus_token");
        window.localStorage.removeItem("omninexus_authenticated");
        window.localStorage.removeItem("omninexus_user_email");
        window.localStorage.removeItem("omninexus_login_time");
        router.replace("/login");
      });

    return () => controller.abort();
  }, [pathname, router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050b14] text-white">
        <div className="text-xs font-semibold tracking-[0.2em] text-cyan-400">
          AUTHENTICATING OMNINEXUS...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
