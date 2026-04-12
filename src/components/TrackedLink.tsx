"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/plausible";

interface TrackedLinkProps {
  href: string;
  event: string;
  props?: Record<string, string>;
  className?: string;
  children: React.ReactNode;
}

export default function TrackedLink({ href, event, props, className, children }: TrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackEvent(event, props)}
    >
      {children}
    </Link>
  );
}
