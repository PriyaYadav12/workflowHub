"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";

export type Automation = {
  slug: string;
  name: string;
  description: string;
  href?: string; // optional external/internal link target
  icon?: ReactNode;
};

export default function AutomationCard({ automation }: { automation: Automation }) {
  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-indigo-500/20 to-transparent p-5 sm:p-6 hover:border-white/20 transition-colors">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(1000px_400px_at_-20%_-20%,rgba(99,102,241,0.25),transparent_60%)]" />
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-indigo-500/30 ring-1 ring-inset ring-white/15 flex items-center justify-center text-indigo-200">
          <Image src="/next.svg" alt="icon" width={18} height={18} className="opacity-90 invert dark:invert-0" />
        </div>
        <h3 className="text-base font-semibold tracking-[-0.01em] text-white/90">
          {automation.name}
        </h3>
      </div>
      <p className="mt-3 text-sm text-white/60 leading-6">
        {automation.description}
      </p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-300 group-hover:text-indigo-200">
        Open
        <span aria-hidden>→</span>
      </div>
    </div>
  );

  if (automation.href) {
    const isExternal = automation.href.startsWith("http");
    if (isExternal) {
      return (
        <a href={automation.href} target="_blank" rel="noreferrer" className="block">
          {content}
        </a>
      );
    }
    return (
      <Link href={automation.href} className="block">
        {content}
      </Link>
    );
  }

  return <div className="block cursor-default">{content}</div>;
}
