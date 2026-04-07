"use client";

import { signOut, useSession } from "next-auth/react";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-gray-900">
          Payment Processing Pricing
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-medium">
              {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <span className="max-w-[140px] truncate font-medium">
              {session?.user?.name ?? session?.user?.email ?? "User"}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {open && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <div className="border-b border-gray-100 px-3 py-2">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="truncate text-sm font-medium text-gray-900">
                    {session?.user?.email}
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
