"use client";

import { Bot } from "lucide-react";

type MotuButtonProps = {
  onClick: () => void;
  isOpen: boolean;
};

export default function MotuButton({ onClick, isOpen }: MotuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Close Ask Motu" : "Open Ask Motu"}
      className="group fixed bottom-6 right-6 z-[70] flex flex-col items-center gap-2 outline-none"
    >
      <span className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border border-green-400/30 bg-gradient-to-br from-green-400 via-emerald-500 to-green-700 text-black shadow-[0_0_45px_rgba(34,197,94,0.38)] transition duration-300 group-hover:-translate-y-1 group-hover:scale-105 group-focus-visible:ring-4 group-focus-visible:ring-green-400/30">
        <span className="absolute inset-0 rounded-full bg-green-400/30 blur-xl transition duration-300 group-hover:bg-green-300/45" />
        <span className="absolute inset-0 animate-ping rounded-full border border-green-300/30" />
        <span className="relative grid h-[52px] w-[52px] place-items-center rounded-full bg-black/10 backdrop-blur">
          <Bot className="h-8 w-8" strokeWidth={2.5} />
        </span>
      </span>

      <span className="rounded-full border border-white/10 bg-black/80 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-300 shadow-2xl backdrop-blur-md transition duration-300 group-hover:border-green-400/40 group-hover:text-green-200">
        Ask Motu
      </span>
    </button>
  );
}
