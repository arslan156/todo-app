import React from "react";
import { Link } from "react-router-dom";
import { TbChecklist } from "react-icons/tb";
export { apiErrorMessage } from "../../services/api";

export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20";

export const primaryButtonClass =
  "w-full rounded-xl bg-[#4361ee] py-3 text-sm font-semibold tracking-wide text-white shadow-md shadow-indigo-500/20 transition hover:bg-[#3451d1] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4361ee]/40 disabled:cursor-wait disabled:opacity-70";

export const textLinkClass =
  "font-semibold text-[#4361ee] hover:underline";

/*
  Split-screen layout for the sign-in / sign-up pages:
  a clean modern form panel on the left and a branded productivity artwork panel on the right.
*/
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="flex min-h-screen justify-center bg-slate-50 text-slate-900 lg:items-center lg:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-indigo-950/5 lg:min-h-[620px] lg:grid-cols-2">
        <section className="flex min-h-screen flex-col px-6 py-8 sm:px-12 lg:min-h-0 lg:px-14 lg:py-10">
          <Link
            to="/"
            className="flex w-fit items-center gap-2.5 text-lg font-bold tracking-tight text-slate-950 transition hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4361ee] text-white shadow-sm">
              <TbChecklist size={18} strokeWidth={2.4} />
            </div>
            <span>
              TODO<span className="text-[#4361ee]">.</span>
            </span>
          </Link>

          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8">
            <h1 className="text-center text-3xl font-extrabold tracking-tight text-slate-950">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
                {subtitle}
              </p>
            )}
            {children}
          </div>

          {footer && (
            <p className="text-center text-sm text-slate-500">{footer}</p>
          )}
        </section>

        <AuthArtwork />
      </div>
    </main>
  );
}

const ArtworkTask = ({ className, done = false, width = "w-40" }) => (
  <div
    className={`absolute flex w-64 items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 shadow-2xl backdrop-blur-md ${className}`}
  >
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
        done ? "border-white bg-white text-slate-900" : "border-white/60"
      }`}
    >
      {done && (
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </span>
    <span className="flex flex-col gap-1.5">
      <span className={`h-1.5 rounded-full bg-white/80 ${width}`} />
      <span className="h-1.5 w-20 rounded-full bg-white/40" />
    </span>
  </div>
);

function AuthArtwork() {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white lg:block"
    >
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#4361ee] opacity-40 blur-3xl" />
      <div className="absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-sky-500 opacity-30 blur-3xl" />
      <div className="absolute -bottom-20 left-1/4 h-80 w-80 rounded-full bg-purple-500 opacity-25 blur-3xl" />

      <ArtworkTask className="left-[14%] top-[22%] -rotate-3" done width="w-36" />
      <ArtworkTask className="right-[12%] top-[38%] rotate-2" width="w-40" />
      <ArtworkTask className="left-[18%] top-[54%] -rotate-1" done width="w-28" />

      <div className="absolute bottom-10 left-10 right-10">
        <p className="text-4xl font-extrabold leading-tight">
          Plan seamlessly.
          <br />
          <span className="text-[#8ca2ff]">Deliver reliably.</span>
        </p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-300">
          Tasks, Scrumboard, rich notes, calendar, and chat in one unified workspace.
        </p>
      </div>
    </aside>
  );
}

export const Field = React.forwardRef(function Field(
  { id, label, hint, ...inputProps },
  ref
) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        ref={ref}
        className={inputClass}
        {...inputProps}
      />
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

export function FormMessage({ type = "error", children }) {
  if (!children) return null;
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`rounded-xl border px-3.5 py-2.5 text-xs font-medium ${
        type === "error"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {children}
    </div>
  );
}
