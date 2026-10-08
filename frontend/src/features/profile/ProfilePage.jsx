import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMail, FiUser } from "react-icons/fi";

const readUser = () => {
  try {
    const savedUser = localStorage.getItem("loggedInUser");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = readUser();
  const displayName = user?.username || user?.name || "Todo User";
  const initial = displayName.trim().charAt(0).toUpperCase() || "A";

  const details = [
    {
      label: "Username",
      value: user?.username || user?.name || "Not provided",
      icon: FiUser,
    },
    {
      label: "Email address",
      value: user?.email || "Not provided",
      icon: FiMail,
    },
  ];

  return (
    <div className="modern-scrollbar h-full min-h-0 flex-1 overflow-y-auto bg-[#f7f8fa] p-3 text-[#3b3f5c] sm:p-6">
      <div className="flex min-h-full w-full flex-col">
        <button
          type="button"
          onClick={() => navigate("/todo")}
          className="mb-3 inline-flex items-center gap-2 rounded-lg px-2 py-2 sm:mb-6 sm:px-3 text-sm font-medium text-[#64748b] transition hover:bg-white hover:text-[#4361ee]"
        >
          <FiArrowLeft size={16} />
          Back to Todo List
        </button>

        <section className="flex flex-1 flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_8px_30px_rgba(20,35,70,0.06)]">
          <div className="bg-gradient-to-r from-[#4361ee] to-[#6f7ff0] px-5 py-6 text-white sm:px-9 sm:py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              Account
            </p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
              Profile
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/80">
              Your account information and details.
            </p>
          </div>

          <div className="px-4 py-5 sm:px-9 sm:py-9">
            <div className="flex items-center gap-4 border-b border-[#eef0f3] pb-5 sm:gap-5 sm:pb-7">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-2xl sm:h-20 sm:w-20 sm:text-3xl font-semibold text-[#4361ee] ring-4 ring-white shadow-sm">
                {initial}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#1b2438]">
                  {displayName}
                </h2>
                <p className="mt-1 text-sm text-[#8791a5]">
                  {user?.email || "No email address provided"}
                </p>
              </div>
            </div>

            <div className="pt-5 sm:pt-6">
              <h3 className="mb-4 text-sm font-semibold text-[#1b2438]">
                Account details
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {details.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex min-w-0 items-start gap-3 rounded-xl border border-[#e8ebf2] bg-[#fbfcfe] p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef2ff] text-[#4361ee]">
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-medium text-[#8791a5]">
                        {label}
                      </span>
                      <span className="mt-1 block break-all text-sm font-medium text-[#263247]">
                        {value}
                      </span>
                    </span>
                  </div>
                ))}
                {user?.id && (
                  <div className="rounded-xl border border-[#e8ebf2] bg-[#fbfcfe] p-4 sm:col-span-2">
                    <p className="text-xs font-medium text-[#8791a5]">
                      Account ID
                    </p>
                    <p className="mt-1 break-all font-mono text-xs text-[#263247]">
                      {user.id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {!user && (
              <div className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Account details are unavailable. Please sign in again.
              </div>
            )}

            <div className="mt-7 flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/todo")}
                className="rounded-lg bg-[#4361ee] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#3451d1]"
              >
                Return to tasks
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
