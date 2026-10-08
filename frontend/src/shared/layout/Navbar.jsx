import React, { useState } from "react";
import useAuth from "../../features/auth/useAuth";
import {
  NavLink,
  Link,
  useNavigate,
} from "react-router-dom";
import { TbChecklist } from "react-icons/tb";
import { FiArrowRight, FiMenu, FiX, FiLogOut } from "react-icons/fi";

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
      isActive
        ? "text-[#4361ee] bg-indigo-50/70"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* LOGO */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-950 transition hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4361ee] text-white shadow-md shadow-indigo-500/20">
            <TbChecklist size={20} strokeWidth={2.4} />
          </div>
          <span>
            TODO<span className="text-[#4361ee]">.</span>
          </span>
        </Link>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden transition"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>

        {/* NAVIGATION LINKS */}
        <div
          className={`${
            menuOpen ? "block" : "hidden"
          } absolute left-0 right-0 top-[65px] border-b border-slate-200 bg-white p-4 shadow-lg lg:static lg:block lg:w-auto lg:border-0 lg:p-0 lg:shadow-none lg:bg-transparent`}
        >
          <ul className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:gap-1">
            <li>
              <NavLink to="/" onClick={closeMenu} className={linkClass}>
                Home
              </NavLink>
            </li>

            <li>
              <NavLink to="/about" onClick={closeMenu} className={linkClass}>
                About
              </NavLink>
            </li>

            {isLoggedIn && (
              <li>
                <NavLink to="/todo" onClick={closeMenu} className={linkClass}>
                  Workspace
                </NavLink>
              </li>
            )}

            {!isLoggedIn ? (
              <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-slate-100 lg:mt-0 lg:flex-row lg:items-center lg:border-0 lg:pt-0 lg:ml-3">
                <li>
                  <Link
                    to="/signin"
                    onClick={closeMenu}
                    className="block rounded-lg px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Sign In
                  </Link>
                </li>

                <li>
                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#4361ee] px-5 py-2 text-center text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-[#3451d1] active:scale-95 lg:w-auto"
                  >
                    <span>Sign Up Free</span>
                    <FiArrowRight size={15} />
                  </Link>
                </li>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-slate-100 lg:mt-0 lg:flex-row lg:items-center lg:border-0 lg:pt-0 lg:ml-4">
                <li>
                  <Link
                    to="/todo"
                    onClick={closeMenu}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#4361ee] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-[#3451d1]"
                  >
                    <span>Launch App</span>
                    <FiArrowRight size={14} />
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                  >
                    <FiLogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </li>
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
