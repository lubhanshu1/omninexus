"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(pathname === "/login");

  useEffect(() => {
    if (pathname === "/login") {
      setReady(true);
      return;
    }

    const token = window.sessionStorage.getItem("omninexus_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setReady(true);
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
