"use client";

import Image from "next/image";
import {
  FormEvent,
  Fragment,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Bot, GraduationCap, Loader2, Send, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import MotuButton from "@/components/MotuButton";

type ChatRole = "assistant" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type ChatResponse = {
  reply?: string;
  error?: string;
  activeCollegeContext?: string[];
};

const quickActions = [
  "Best CSE colleges",
  "IIT vs NIT",
  "Colleges under Rs. 2L fees",
  "Highest placement colleges",
  "JEE rank guidance",
];

const initialMessage: ChatMessage = {
  id: "motu-welcome",
  role: "assistant",
  content:
    "Hi, I am Motu. Ask me about colleges, placements, fees, rankings, exams, admissions, or career paths.",
};

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
  };
}

function renderInlineMarkdown(value: string): ReactNode[] {
  return value.split(/(\*\*.*?\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${part}-${index}`} className="font-bold text-white">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={`${part}-${index}`}>{part}</Fragment>
    ),
  );
}

function parseTableRow(line: string): string[] {
  return line
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const isTable =
      lines[index]?.trim().startsWith("|") &&
      /^\|(?:\s*:?-+:?\s*\|)+$/.test(lines[index + 1]?.trim() ?? "");

    if (isTable) {
      const headers = parseTableRow(lines[index].trim());
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(parseTableRow(lines[index].trim()));
        index += 1;
      }
      blocks.push(
        <div key={`table-${index}`} className="my-2 max-w-full overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[620px] border-collapse text-left text-xs">
            <thead className="bg-white/[0.06] text-zinc-200">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="border-b border-white/10 px-3 py-2 font-bold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${row[0]}-${rowIndex}`} className="border-b border-white/[0.06] last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td key={`${cell}-${cellIndex}`} className="whitespace-nowrap px-3 py-2 text-zinc-300">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const textLines: string[] = [];
    while (
      index < lines.length &&
      !(
        lines[index]?.trim().startsWith("|") &&
        /^\|(?:\s*:?-+:?\s*\|)+$/.test(lines[index + 1]?.trim() ?? "")
      )
    ) {
      textLines.push(lines[index]);
      index += 1;
    }
    blocks.push(
      <p key={`text-${index}`} className="whitespace-pre-wrap">
        {renderInlineMarkdown(textLines.join("\n"))}
      </p>,
    );
  }

  return <>{blocks}</>;
}

export default function MotuChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [activeCollegeContext, setActiveCollegeContext] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  async function sendMessage(messageText: string) {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    const userMessage = createMessage("user", trimmedMessage);
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          history: messages
            .filter((message) => message.id !== initialMessage.id)
            .slice(-10)
            .map(({ role, content }) => ({ role, content })),
          activeCollegeContext,
        }),
      });

      const data = (await response.json()) as ChatResponse;

      if (!response.ok || !data.reply) {
        throw new Error(data.error ?? "Motu could not answer right now.");
      }

      const assistantReply = data.reply;

      if (Array.isArray(data.activeCollegeContext)) {
        setActiveCollegeContext(data.activeCollegeContext);
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", assistantReply),
      ]);
    } catch (error) {
      const fallback =
        error instanceof Error
          ? error.message
          : "Motu is having trouble answering right now. Please try again.";

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", fallback),
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  return (
    <>
      <MotuButton onClick={() => setIsOpen((value) => !value)} isOpen={isOpen} />

      <div
        className={`fixed inset-0 z-[80] transition duration-300 ${
          isOpen ? "pointer-events-auto lg:pointer-events-none" : "pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        <div
          className={`absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />

        <section
          role="dialog"
          aria-modal="true"
          aria-label="Ask Motu chat"
          className={`absolute bottom-0 right-0 top-0 flex w-full max-w-[452px] flex-col overflow-hidden border-l border-white/10 bg-[#050609]/95 shadow-[0_28px_120px_rgba(0,0,0,0.82),0_0_80px_rgba(37,99,235,0.14)] backdrop-blur-2xl transition duration-300 ease-out sm:right-4 sm:top-4 sm:bottom-4 sm:rounded-[30px] sm:border lg:pointer-events-auto lg:right-6 lg:top-6 lg:bottom-6 lg:max-w-[430px] ${
            isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="absolute -left-28 top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06)_0,transparent_34%,rgba(255,255,255,0.025)_52%,transparent_70%)]" />
          </div>

          <header className="relative overflow-hidden border-b border-white/10 px-5 py-5">
            <div className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-cover bg-center shadow-[0_0_34px_rgba(34,197,94,0.34)] ring-1 ring-emerald-300/30"
                  style={{ backgroundImage: "url('/images/motu.png')" }}
                >
                  <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/20 via-transparent to-black/25" />
                  <Image
                    src="/images/motu.png"
                    alt="Motu AI Counselor"
                    fill
                    sizes="48px"
                    className="rounded-full object-cover object-center"
                    priority
                    unoptimized
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">Ask Motu</h2>
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">
                      Live
                    </span>
                  </div>
                  <p className="text-sm font-medium text-zinc-400">AI college guidance assistant</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Ask Motu"
                className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-zinc-300 shadow-lg transition hover:border-emerald-300/40 hover:bg-white/[0.1] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mt-5 grid grid-cols-3 gap-2">
              {[
                { icon: GraduationCap, label: "Colleges" },
                { icon: Zap, label: "Ranks" },
                { icon: ShieldCheck, label: "Compare" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.045] px-2 py-2 text-[11px] font-bold text-zinc-300 shadow-inner"
                >
                  <Icon className="h-3.5 w-3.5 text-emerald-300" />
                  {label}
                </div>
              ))}
            </div>
          </header>

          <div className="motu-chat-scroll relative flex-1 overflow-y-auto px-5 py-5">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="mb-1 grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.12)]">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[84%] whitespace-pre-wrap px-4 py-3 text-sm leading-6 shadow-xl ${
                      message.role === "user"
                        ? "rounded-[24px] rounded-br-md bg-gradient-to-r from-emerald-400 to-green-500 font-semibold text-black shadow-[0_14px_35px_rgba(16,185,129,0.22)]"
                        : "rounded-[24px] rounded-bl-md border border-white/10 bg-white/[0.075] text-zinc-100 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                    }`}
                  >
                    <MessageContent content={message.content} />
                  </div>
                </div>
              ))}

              {messages.length === 1 && (
                <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_55px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                  <div className="absolute -right-14 -top-16 h-32 w-32 rounded-full bg-emerald-400/15 blur-3xl" />
                  <div className="relative mb-3 flex items-center gap-2 text-sm font-bold text-emerald-200">
                    <span className="grid h-7 w-7 place-items-center rounded-xl bg-emerald-400/10">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    Starter prompts
                  </div>
                  <div className="relative flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => void sendMessage(action)}
                        className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:-translate-y-0.5 hover:border-emerald-300/40 hover:bg-emerald-400/10 hover:text-emerald-100 hover:shadow-[0_10px_25px_rgba(16,185,129,0.12)]"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-[24px] rounded-bl-md border border-white/10 bg-white/[0.075] px-4 py-3 text-sm text-zinc-300 shadow-xl backdrop-blur-xl">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
                    Motu is thinking
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative border-t border-white/10 bg-black/20 p-4">
            <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/30 to-transparent" />
            <div className="flex items-end gap-3 rounded-[26px] border border-white/10 bg-white/[0.07] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition focus-within:border-emerald-300/45 focus-within:shadow-[0_0_0_1px_rgba(16,185,129,0.14),0_18px_50px_rgba(0,0,0,0.35)]">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Ask about colleges, ranks, fees..."
                rows={1}
                className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-300 to-green-500 text-black shadow-[0_12px_30px_rgba(16,185,129,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(16,185,129,0.38)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
