"use client";

import Image from "next/image";

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
      className="group fixed bottom-4 right-3 z-[70] flex flex-col items-center gap-2 outline-none sm:bottom-6 sm:right-6"
    >
      <span className="luxe-button relative flex h-14 w-14 items-center justify-center rounded-full border border-green-400/30 bg-gradient-to-br from-green-400 via-emerald-500 to-green-700 text-black shadow-[0_0_32px_rgba(34,197,94,0.34)] group-focus-visible:ring-4 group-focus-visible:ring-green-400/30 sm:h-[72px] sm:w-[72px] sm:shadow-[0_0_45px_rgba(34,197,94,0.38)]">
        <span className="absolute inset-0 rounded-full bg-green-400/30 blur-xl transition duration-300 group-hover:bg-green-300/45" />
        <span className="absolute inset-0 animate-ping rounded-full border border-green-300/30" />
        <span className="relative z-10 grid h-full w-full place-items-center overflow-hidden rounded-full">
          <Image
            src="/images/motu.png"
            alt="Ask Motu"
            width={72}
            height={72}
            className="h-full w-full rounded-full object-cover"
            priority
          />
        </span>
      </span>

      <span className="hidden rounded-full border border-white/10 bg-black/80 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-300 shadow-2xl backdrop-blur-md transition duration-300 group-hover:border-green-400/40 group-hover:text-green-200 sm:block">
        Ask Motu
      </span>
    </button>
  );
}
