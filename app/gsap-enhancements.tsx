"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function GsapEnhancements() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const headings = Array.from(document.querySelectorAll<HTMLElement>(".outro-copy h4"));
      const heading = headings.find((node) => /進入第二章|进入第二章|Chapter Two|第2章/.test(node.textContent || ""));
      if (!heading) return;

      const nodes: HTMLElement[] = [];
      let node = heading.nextElementSibling as HTMLElement | null;
      while (node && node.tagName !== "H4") {
        nodes.push(node);
        node = node.nextElementSibling as HTMLElement | null;
      }

      heading.dataset.gsapChapterTwo = "true";
      nodes.forEach((item, index) => {
        item.dataset.gsapChapterTwoLine = String(index + 1);
      });

      gsap.set(heading, { transformOrigin: "left center" });
      gsap.set(nodes, { opacity: 0, y: 34 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heading,
          start: "top 78%",
          end: "+=760",
          scrub: 0.65,
          once: false,
        },
      });

      tl.fromTo(heading, { opacity: 0.25, x: -24, letterSpacing: "0.08em" }, { opacity: 1, x: 0, letterSpacing: "0.015em", duration: 0.8 })
        .to(nodes, { opacity: 1, y: 0, duration: 0.72, stagger: 0.12, ease: "power2.out" }, 0.35);

      const quotes = nodes.filter((item) => item.tagName === "BLOCKQUOTE");
      quotes.forEach((quote) => {
        gsap.fromTo(quote, { scale: 0.965, filter: "blur(3px)" }, {
          scale: 1,
          filter: "blur(0px)",
          ease: "power2.out",
          scrollTrigger: { trigger: quote, start: "top 82%", end: "top 58%", scrub: true },
        });
      });

      const paragraphs = nodes.filter((item) => item.tagName === "P");
      paragraphs.forEach((paragraph, index) => {
        if (index % 2 === 0) {
          gsap.fromTo(paragraph, { x: -10 }, { x: 0, scrollTrigger: { trigger: paragraph, start: "top 90%", end: "top 70%", scrub: true } });
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
