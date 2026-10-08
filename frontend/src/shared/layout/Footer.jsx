import React from "react";
import { Link } from "react-router-dom";
import { TbChecklist } from "react-icons/tb";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 py-12 px-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4361ee] text-white">
              <TbChecklist size={20} strokeWidth={2.4} />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              TODO<span className="text-[#4361ee]">.</span>
            </span>
            <span className="ml-2 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
              v2.0
            </span>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <Link to="/" className="transition hover:text-white">
              Home
            </Link>
            <Link to="/about" className="transition hover:text-white">
              About
            </Link>
            <Link to="/todo" className="transition hover:text-white">
              Workspace
            </Link>
            <Link to="/signin" className="transition hover:text-white">
              Sign In
            </Link>
            <Link to="/signup" className="transition hover:text-white">
              Sign Up
            </Link>
          </div>

          {/* System status */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All Systems Normal</span>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Todo Workspace. Designed for calm, high-impact productivity.</p>
        </div>
      </div>
    </footer>
  );
}
