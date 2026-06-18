"use client";

import {
  FormEvent,
  Fragment,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
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
  "Colleges under ₹2L fees",
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
          className={`absolute bottom-0 right-0 top-0 flex w-full max-w-[440px] flex-col border-l border-white/10 bg-[#080808] shadow-[0_0_80px_rgba(0,0,0,0.75)] transition duration-300 ease-out sm:right-4 sm:top-4 sm:bottom-4 sm:rounded-[28px] sm:border lg:pointer-events-auto lg:right-6 lg:top-6 lg:bottom-6 lg:max-w-[420px] ${
            isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <header className="relative overflow-hidden border-b border-white/10 px-5 py-5">
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-green-500/15 blur-3xl" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 text-black shadow-[0_0_30px_rgba(34,197,94,0.35)]">
                  <Bot className="h-7 w-7" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Ask Motu</h2>
                  <p className="text-sm font-medium text-zinc-400">
                    Your AI College Counselor
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Ask Motu"
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition hover:border-green-400/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[84%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm leading-6 shadow-xl ${
                      message.role === "user"
                        ? "rounded-br-md bg-gradient-to-r from-green-500 to-emerald-500 font-semibold text-black"
                        : "rounded-bl-md border border-white/10 bg-[#171717] text-zinc-100"
                    }`}
                  >
                    <MessageContent content={message.content} />
                  </div>
                </div>
              ))}

              {messages.length === 1 && (
                <div className="rounded-3xl border border-green-500/15 bg-green-500/5 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-bold text-green-300">
                    <Sparkles className="h-4 w-4" />
                    Try a quick question
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => void sendMessage(action)}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-green-400/40 hover:bg-green-500/10 hover:text-green-200"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-3xl rounded-bl-md border border-white/10 bg-[#171717] px-4 py-3 text-sm text-zinc-300">
                    <Loader2 className="h-4 w-4 animate-spin text-green-400" />
                    Motu is thinking
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 p-4">
            <div className="flex items-end gap-3 rounded-3xl border border-white/10 bg-[#121212] p-2 shadow-inner focus-within:border-green-400/40">
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
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-green-500 text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-45"
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
