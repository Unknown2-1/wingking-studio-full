"use client";

import { useEffect } from "react";

/** Progressive enhancement: content stays visible without JavaScript. */
export default function SiteMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const selectors = [
      "#about h2", "#about .space-y-4", "#about .grid-cols-2 > div",
      "#about img", "#capabilities h2", "#capabilities .grid > div",
      "#spaces h2", "#spaces .grid > div",
      "#booking-console h2", "#booking-console form",
      "main > header h1", "main > section h2", "main > section article",
    ];
    const elements = Array.from(new Set(
      selectors.flatMap((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector))),
    )).filter((element) => element.getClientRects().length > 0);

    if (typeof IntersectionObserver === "undefined") return;

    let observedEntries = 0;
    const observer = new IntersectionObserver((entries) => {
      observedEntries += entries.length;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("motion-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -7% 0px", threshold: 0.08 });

    elements.forEach((element, index) => {
      element.classList.add("motion-reveal");
      element.style.setProperty("--motion-delay", `${(index % 4) * 85}ms`);
      observer.observe(element);
    });
    document.documentElement.classList.add("wingking-motion-ready");
    // Fail-safe: an observer blocked by browser extensions must not hide content forever.
    const rescue = window.setTimeout(() => {
      if (observedEntries === 0) {
        elements.forEach((element) => element.classList.add("motion-visible"));
        observer.disconnect();
      }
    }, 2200);

    let frame = 0;
    const updateProgress = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const progress = Math.max(0, Math.min(1, window.scrollY / max));
        document.documentElement.style.setProperty("--wingking-scroll-progress", String(progress));
        frame = 0;
      });
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    return () => {
      window.clearTimeout(rescue);
      observer.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      if (frame) window.cancelAnimationFrame(frame);
      document.documentElement.classList.remove("wingking-motion-ready");
      elements.forEach((element) => {
        element.classList.remove("motion-reveal", "motion-visible");
        element.style.removeProperty("--motion-delay");
      });
    };
  }, []);
  return null;
}
