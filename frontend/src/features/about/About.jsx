import React from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiDatabase,
  FiLock,
  FiServer,
  FiSmartphone,
  FiZap,
  FiArrowRight,
} from "react-icons/fi";
import { GiWhiteBook } from "react-icons/gi";

export default function About() {
  const principles = [
    {
      title: "Speed Over Friction",
      description:
        "Every interaction is debounced, instantaneous, and responsive. Quick shortcuts and accessible forms minimize friction between having an idea and tracking it.",
      icon: FiZap,
      color: "text-amber-500 bg-amber-50 border-amber-200",
    },
    {
      title: "Unified Workspace",
      description:
        "No more tab juggling between five disjointed SaaS tools. Tasks, Scrumboard, rich notes, calendar agendas, mailbox, and team chat live harmoniously under one roof.",
      icon: FiCheckCircle,
      color: "text-[#4361ee] bg-indigo-50 border-indigo-200",
    },
    {
      title: "Security & Privacy First",
      description:
        "Your data is protected by HttpOnly token encryption, salted bcrypt password hashes, and a proactive 15-minute inactivity session lock to safeguard shared workstations.",
      icon: FiLock,
      color: "text-emerald-500 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Multi-Device Responsiveness",
      description:
        "Engineered with dynamic viewport height and responsive drawers to provide a flawless native app feel on desktop, tablet, and mobile devices.",
      icon: FiSmartphone,
      color: "text-purple-500 bg-purple-50 border-purple-200",
    },
  ];

  const techStack = [
    {
      layer: "Frontend Client",
      details: "React 18, React Router v6, Redux Toolkit, Tailwind CSS, Lucide & Feather Icons, React Quill New.",
      icon: FiSmartphone,
    },
    {
      layer: "Backend Engine",
      details: "Node.js, Express.js REST API, JSON Web Token (JWT) with HttpOnly Cookies, Bcrypt hashing.",
      icon: FiServer,
    },
    {
      layer: "Data Store",
      details: "MongoDB Compass / Atlas with Mongoose ODM schemas, indexing, and bulk operations.",
      icon: FiDatabase,
    },
  ];

  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8 text-slate-900 selection:bg-[#4361ee] selection:text-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/70 px-4 py-1.5 text-xs font-semibold text-[#4361ee]">
            <GiWhiteBook className="text-sm" />
            <span>About The Todo Project</span>
          </div>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl text-slate-950">
            Crafting the calmest, most focused
            <br />
            <span className="bg-gradient-to-r from-[#4361ee] to-indigo-600 bg-clip-text text-transparent">
              productivity experience.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
            We built this platform to bring simplicity and order back into daily
            workflows. By blending tasks, Kanban pipelines, notes, and direct
            collaboration, you spend less time configuring and more time doing.
          </p>
        </div>

        {/* Mission Card */}
        <div className="mt-14 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-8 sm:p-12 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Our Mission &amp; Philosophy
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
            Most productivity software today suffers from feature bloat,
            cluttered navigation, and overwhelming dashboards. We believe that
            true efficiency begins with cognitive ease. Our interface uses
            intentional whitespace, harmonic color tokens, and distraction-free
            views so you can maintain unbroken flow throughout your day.
          </p>
        </div>

        {/* 4 Core Principles */}
        <div className="mt-16">
          <h2 className="text-center text-xs font-bold uppercase tracking-widest text-[#4361ee]">
            Guiding Principles
          </h2>
          <p className="mt-2 text-center text-2xl font-bold text-slate-950">
            How we approach every feature
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <div
                  key={principle.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border ${principle.color}`}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {principle.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Architecture & Tech Stack */}
        <div className="mt-16 rounded-3xl border border-slate-200 bg-slate-50/80 p-8 sm:p-10">
          <h2 className="text-xl font-bold text-slate-900">
            Architecture &amp; Technologies
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Built with modern, production-tested open-source standards.
          </p>

          <div className="mt-6 space-y-4">
            {techStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <div
                  key={tech.layer}
                  className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#4361ee]">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {tech.layer}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {tech.details}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Bar */}
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl bg-[#4361ee] p-8 text-center text-white shadow-xl shadow-indigo-500/20 sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Experience the difference for yourself.
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-indigo-100">
            Jump right into the workspace and take full control of your daily workflow.
          </p>
          <Link
            to="/todo"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#4361ee] shadow-sm transition hover:bg-indigo-50 active:scale-95"
          >
            <span>Launch Workspace</span>
            <FiArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
