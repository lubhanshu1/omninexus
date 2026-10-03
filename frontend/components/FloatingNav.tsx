"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiUrl, getStoredToken } from "@/lib/api";
import {
  Activity,
  BriefcaseBusiness,
  Database,
  GraduationCap,
  LogOut,
  Network,
  Radar,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const navItems = [
  { name: "Career", path: "/career-simulator", icon: Sparkles },
  { name: "Talent", path: "/recruiter", icon: Users },
  { name: "Observatory", path: "/observatory", icon: Radar },
  { name: "Future Lab", path: "/future-lab", icon: Zap },
  { name: "Database", path: "/database", icon: Database },
];

export default function FloatingNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsAdmin(false);
      return;
    }

    fetch(apiUrl("/api/v1/auth/me"), {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((user) => setIsAdmin(user?.role?.trim().toLowerCase() === "admin"))
      .catch(() => setIsAdmin(false));
  }, [pathname]);

  const handleLogout = async () => {
    const token = getStoredToken();
    try {
      if (token) {
        await fetch(apiUrl("/api/v1/auth/logout"), {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          keepalive: true,
        });
      }
    } catch {
      // Local session cleanup still happens if the API is unavailable.
    } finally {
      window.sessionStorage.removeItem("omninexus_token");
      window.localStorage.removeItem("omninexus_authenticated");
      window.localStorage.removeItem("omninexus_user_email");
      window.localStorage.removeItem("omninexus_login_time");
      router.push("/login");
      router.refresh();
    }
  };

  if (pathname === "/login") return null;

  const visibleItems = navItems.filter((item) => item.path !== "/database" || isAdmin);

  return (
    <>
      <aside className="omni-sidebar fixed left-3 top-3 z-[9999] hidden h-[calc(100vh-24px)] w-[68px] flex-col items-center border border-white/[0.08] bg-[#0a0c0c]/95 py-3 backdrop-blur-2xl lg:flex">
        <Link href="/" title="OmniNexus home" className="omni-side-logo">
          <Network size={19} />
        </Link>

        <div className="my-5 h-px w-8 bg-white/[0.08]" />

        <nav className="flex flex-1 flex-col items-center gap-1.5">
          <Link href="/" title="Command center" className={"omni-side-item " + (pathname === "/" ? "active" : "")}>
            <Activity size={17} />
          </Link>

          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.path}
                href={item.path}
                title={item.name}
                className={"omni-side-item " + (active ? "active" : "")}
              >
                <Icon size={17} />
              </Link>
            );
          })}
        </nav>

        <button onClick={handleLogout} title="Logout" className="omni-side-logout">
          <LogOut size={16} />
        </button>
      </aside>

      <nav className="omni-mobile-nav fixed bottom-3 left-3 right-3 z-[9999] flex items-center gap-1 overflow-x-auto border border-white/[0.08] bg-[#0a0c0c]/95 p-1.5 backdrop-blur-2xl lg:hidden">
        <Link href="/" className={"omni-mobile-item " + (pathname === "/" ? "active" : "")}>
          <Network size={15} />
          <span>Home</span>
        </Link>

        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path || pathname.startsWith(item.path + "/");
          return (
            <Link key={item.path} href={item.path} className={"omni-mobile-item " + (active ? "active" : "")}>
              <Icon size={15} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <button onClick={handleLogout} className="omni-mobile-logout" title="Logout">
          <LogOut size={15} />
        </button>
      </nav>
    </>
  );
}
