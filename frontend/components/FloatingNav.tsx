"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiUrl, getStoredToken } from "@/lib/api";
import {
  Activity,
  BrainCircuit,
  BriefcaseBusiness,
  Database,
  LogOut,
  Network,
  Sparkles,
} from "lucide-react";

const navItems = [
  {
    name: "Career Simulator",
    shortName: "Career",
    path: "/career-simulator",
    icon: Sparkles,
  },
  {
    name: "Intelligence",
    shortName: "Intel",
    path: "/intelligence",
    icon: BrainCircuit,
  },
  {
    name: "Talent Matcher",
    shortName: "Talent",
    path: "/recruiter",
    icon: Network,
  },
  {
    name: "Workforce",
    shortName: "Observatory",
    path: "/observatory",
    icon: Activity,
  },
  {
    name: "Database",
    shortName: "System DB",
    path: "/database",
    icon: Database,
  },
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
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((user) => {
        setIsAdmin(user?.role?.trim().toLowerCase() === "admin");
      })
      .catch(() => setIsAdmin(false));
  }, [pathname]);

  const handleLogout = async () => {
    const token = getStoredToken();
    try {
      if (token) {
        await fetch(apiUrl("/api/v1/auth/logout"), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
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

  // Hide global navigation on authentication page
  if (pathname === "/login") {
    return null;
  }

  return (
    <nav
      aria-label="OmniNexus global navigation"
      className="
        fixed
        bottom-5
        left-1/2
        -translate-x-1/2
        z-[9999]

        w-[calc(100%-20px)]
        sm:w-[calc(100%-32px)]

        max-w-[1280px]

        rounded-[22px]
        border
        border-slate-700/70

        bg-[#07111f]/95
        backdrop-blur-2xl

        shadow-[0_20px_60px_rgba(0,0,0,0.45)]

        px-2
        sm:px-3
        py-2

        transition-all
        duration-300
      "
    >
      <div className="flex items-center gap-2 sm:gap-3">

        {/* =========================================================
            OMNINEXUS HOME / SYSTEM BUTTON
        ========================================================= */}
        <Link
          href="/career-simulator"
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center

            rounded-xl

            border
            border-cyan-500/20

            bg-cyan-500/[0.06]

            text-cyan-400

            transition-all
            duration-200

            hover:border-cyan-400/40
            hover:bg-cyan-400/[0.10]
            hover:text-cyan-300
            hover:shadow-[0_0_25px_rgba(34,211,238,0.15)]

            active:scale-95
          "
          title="OmniNexus Home"
          aria-label="Go to OmniNexus Home"
        >
          <BriefcaseBusiness
            size={19}
            strokeWidth={2}
          />
        </Link>

        {/* =========================================================
            MAIN NAVIGATION
        ========================================================= */}
        <div
          className="
            flex
            min-w-0
            flex-1
            overflow-x-auto
            scrollbar-none
            items-center
            justify-center
            gap-1
            sm:gap-2
          "
        >
          {navItems.filter((item) => item.path !== "/database" || isAdmin).map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.path ||
              pathname.startsWith(`${item.path}/`);

            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`
                  group
                  relative

                  flex
                  h-11
                  min-w-0
                  flex-1
                  sm:flex-none

                  items-center
                  justify-center
                  gap-1.5
                  sm:gap-2

                  rounded-xl

                  px-2
                  md:px-4
                  lg:px-5
                  shrink-0

                  text-[11px]
                  sm:text-xs

                  font-semibold

                  whitespace-nowrap

                  transition-all
                  duration-200

                  active:scale-[0.98]

                  ${isActive
                    ? `
                        bg-cyan-400
                        text-[#03111c]

                        shadow-[0_0_25px_rgba(34,211,238,0.25)]

                        hover:bg-cyan-300
                      `
                    : `
                        text-slate-400

                        hover:bg-slate-800/80
                        hover:text-white
                      `
                  }
                `}
              >
                {/* Icon */}
                <Icon
                  size={16}
                  strokeWidth={2}
                  className="
                    shrink-0
                    transition-transform
                    duration-200
                    group-hover:scale-110
                  "
                />

                {/* =================================================
                    DESKTOP / TABLET LABEL
                ================================================= */}
                <span className="hidden md:inline">
                  {item.name}
                </span>

                {/* =================================================
                    ACTIVE INDICATOR
                ================================================= */}
                {isActive && (
                  <span
                    className="
                      absolute
                      -bottom-1

                      left-1/2
                      -translate-x-1/2

                      h-0.5
                      w-8

                      rounded-full

                      bg-cyan-300

                      shadow-[0_0_8px_rgba(103,232,249,0.8)]
                    "
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* =========================================================
            SYSTEM STATUS
        ========================================================= */}
        <div
          className="
            hidden
            lg:flex

            h-11
            shrink-0

            items-center
            gap-2

            rounded-xl

            border
            border-emerald-500/20

            bg-emerald-500/[0.05]

            px-4

            text-xs
            font-semibold

            text-emerald-400
          "
          title="OmniNexus system status"
        >
          <span
            className="
              h-2
              w-2
              shrink-0

              rounded-full

              bg-emerald-400

              shadow-[0_0_10px_rgba(52,211,153,0.8)]

              animate-pulse
            "
          />

          <span>API ONLINE</span>
        </div>

        {/* =========================================================
            LOGOUT
        ========================================================= */}
        <button
          type="button"
          onClick={handleLogout}
          className="
            flex
            h-11
            shrink-0

            items-center
            justify-center
            gap-2

            rounded-xl

            border
            border-rose-500/20

            bg-rose-500/[0.04]

            px-3
            sm:px-4

            text-xs
            font-semibold

            text-rose-400

            transition-all
            duration-200

            hover:border-rose-400/40
            hover:bg-rose-500/[0.10]
            hover:text-rose-300
            hover:shadow-[0_0_20px_rgba(244,63,94,0.10)]

            active:scale-95
          "
          title="Logout"
          aria-label="Logout"
        >
          <LogOut
            size={16}
            strokeWidth={2}
          />

          <span className="hidden md:inline">
            Logout
          </span>
        </button>
      </div>
    </nav>
  );
}