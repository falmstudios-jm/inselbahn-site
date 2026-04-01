"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 bg-white ${
        scrolled ? "shadow-md py-3" : "py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 flex items-center">
        <a href="#" className="flex-shrink-0">
          <Image
            src="/images/inselbahn-logo.svg"
            alt="Inselbahn Helgoland"
            width={180}
            height={44}
            priority
          />
        </a>
      </div>
    </header>
  );
}
