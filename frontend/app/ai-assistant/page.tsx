"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, LoaderCircle, MessageCircle, Send, Sparkles } from "lucide-react";
import { apiUrl } from "@/lib/api";

type Message = { role: "user" | "assistant"; content: string };

const suggestions = [
  "Build me a 30-day plan to learn Python",
  "Help me prepare for a data analyst interview",
  "Review the skills I need for a career switch",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  async function sendMessage(event?: FormEvent, prompt?: string) {
    event?.preventDefault();
    const message = (prompt ?? input).trim();
    if (!message || loading) return;
    const previous = messages;
    const next = [...previous, { role: "user" as const, content: message }];
    setMessages(next);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/v1/ai/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: previous.slice(-20) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "AI request failed.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));
    } catch (err) {
      setMessages(next);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#02070d] px-4 pb-32 pt-7 text-white sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col">
        <header className="rounded-[28px] border border-cyan-400/15 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.13),transparent_38%),#07111d] p-6 sm:p-9">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"><ArrowLeft size={14}/> OmniNexus Home</Link>
          <div className="mt-6 flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-200"><Bot size={25}/></div>
            <div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-300"><Sparkles size={14}/> OmniNexus AI</div><p className="mt-1 text-sm text-slate-400">Career guidance, learning plans, interview prep and more.</p></div>
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">Your AI workspace.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Ask a question and work through the next step with an AI assistant powered by OpenAI.</p>
        </header>

        <section className="mt-5 flex min-h-[420px] flex-col rounded-[26px] border border-slate-800 bg-[#07111d]">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
            {messages.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <div className="rounded-full border border-slate-700 bg-slate-900 p-4 text-cyan-200"><MessageCircle size={24}/></div>
                <h2 className="mt-4 text-lg font-bold">What would you like to work on?</h2>
                <p className="mt-2 max-w-md text-sm text-slate-400">Choose a starter prompt or type your own question below.</p>
                <div className="mt-6 flex max-w-2xl flex-wrap justify-center gap-2">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => void sendMessage(undefined, suggestion)} className="rounded-xl border border-slate-700 px-4 py-3 text-left text-sm text-slate-300 transition hover:border-cyan-300/50 hover:bg-cyan-300/5" disabled={loading}>{suggestion}</button>)}</div>
              </div>
            ) : messages.map((item, index) => (
              <div key={index} className={item.role === "user" ? "ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-cyan-300/10 px-4 py-3 text-sm leading-6 text-slate-100" : "mr-auto max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm leading-6 text-slate-200"}><div className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{item.role === "user" ? "You" : "OmniNexus AI"}</div>{item.content}</div>
            ))}
            {loading && <div className="flex items-center gap-2 text-sm text-cyan-200"><LoaderCircle size={16} className="animate-spin"/> Thinking…</div>}
          </div>
          {error && <p role="alert" className="mx-4 mb-3 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-200 sm:mx-6">{error}</p>}
          <form onSubmit={(event) => void sendMessage(event)} className="border-t border-slate-800 p-3 sm:p-5">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-700 bg-[#030910] p-2 focus-within:border-cyan-300/50">
              <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={2} maxLength={8000} placeholder="Message OmniNexus AI…" className="max-h-40 min-h-[48px] flex-1 resize-y bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600" />
              <button type="submit" disabled={loading || !input.trim()} aria-label="Send message" className="mb-1 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300 text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"><Send size={17}/></button>
            </div>
            <p className="mt-2 px-1 text-[11px] text-slate-600">AI can make mistakes. Avoid sharing passwords or sensitive personal information.</p>
          </form>
        </section>
      </div>
    </main>
  );
}
