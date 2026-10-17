"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bot, LoaderCircle, MessageCircle, Send, Sparkles, RotateCcw } from "lucide-react";
import { apiUrl, authHeaders, getStoredToken } from "@/lib/api";

type Message = { role: "user" | "assistant"; content: string; failed?: boolean };

const suggestions = [
  "Build me a 30-day plan to learn Python",
  "Help me prepare for a data analyst interview",
  "Review the skills I need for a career switch",
];
const STORAGE_KEY = "omninexus_ai_chat";

async function readResponse(response: Response): Promise<Record<string, unknown>> {
  const raw = await response.text();
  let data: Record<string, unknown> = {};
  if (raw) {
    try { data = JSON.parse(raw) as Record<string, unknown>; }
    catch { throw new Error("The server returned an unexpected response. Please try again."); }
  }
  if (!response.ok) {
    if (response.status === 401) throw new Error("Your session has expired. Please sign in again.");
    if (response.status === 429) throw new Error("You're sending messages too quickly. Please wait a moment.");
    const detail = typeof data.detail === "string" ? data.detail : "";
    throw new Error(detail || `The AI service returned an error (${response.status}). Please try again.`);
  }
  return data;
}

export default function AIAssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((item): item is Message =>
            item && (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string" && !item.failed
          ).slice(-40);
          messagesRef.current = valid;
          setMessages(valid);
        }
      }
    } catch { sessionStorage.removeItem(STORAGE_KEY); }
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.filter(m => !m.failed).slice(-40))); }
    catch { /* Conversation remains usable if browser storage is unavailable. */ }
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, [messages, loading]);

  async function sendMessage(event?: FormEvent, prompt?: string, retryIndex?: number) {
    event?.preventDefault();
    const message = (prompt ?? (retryIndex !== undefined ? messagesRef.current[retryIndex]?.content : input)).trim();
    if (!message || loading) return;
    if (!getStoredToken()) {
      setError("Please sign in to use OmniNexus AI.");
      router.push("/login");
      return;
    }

    const before = messagesRef.current;
    const history = before.filter(m => !m.failed).slice(-20).map(({ role, content }) => ({ role, content }));
    const pending = retryIndex === undefined
      ? [...before, { role: "user" as const, content: message }]
      : before.filter((_, index) => index !== retryIndex);
    setMessages(pending);
    if (retryIndex === undefined) setInput("");
    setError("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 35_000);
    try {
      const response = await fetch(apiUrl("/api/v1/ai/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ message, history }),
        signal: controller.signal,
      });
      const data = await readResponse(response);
      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("The AI returned an empty response. Please retry.");
      }
      setMessages([...pending, { role: "assistant", content: data.reply.trim() }]);
    } catch (err) {
      const messageText = controller.signal.aborted
        ? "The request took too long. Please retry."
        : err instanceof TypeError
          ? "Unable to reach the API. Check your connection and try again."
          : err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setMessages([...pending, { role: "user", content: message, failed: true }]);
      setError(messageText);
      if (messageText.includes("session has expired")) {
        sessionStorage.removeItem("omninexus_token");
        router.push("/login");
      }
    } finally {
      window.clearTimeout(timeout);
      if (abortRef.current === controller) abortRef.current = null;
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
                <div className="mt-6 flex max-w-2xl flex-wrap justify-center gap-2">{suggestions.map(suggestion => <button key={suggestion} type="button" onClick={() => void sendMessage(undefined, suggestion)} className="rounded-xl border border-slate-700 px-4 py-3 text-left text-sm text-slate-300 transition hover:border-cyan-300/50 hover:bg-cyan-300/5" disabled={loading}>{suggestion}</button>)}</div>
              </div>
            ) : messages.map((item, index) => (
              <div key={`${index}-${item.role}`} className={item.role === "user" ? "ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-cyan-300/10 px-4 py-3 text-sm leading-6 text-slate-100" : "mr-auto max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm leading-6 text-slate-200"}>
                <div className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{item.failed ? "Not sent" : item.role === "user" ? "You" : "OmniNexus AI"}</div>
                {item.content}
                {item.failed && <button type="button" onClick={() => void sendMessage(undefined, undefined, index)} disabled={loading} className="mt-2 flex items-center gap-1 text-xs font-bold text-cyan-300 disabled:opacity-50"><RotateCcw size={12}/> Retry message</button>}
              </div>
            ))}
            {loading && <div className="flex items-center gap-2 text-sm text-cyan-200"><LoaderCircle size={16} className="animate-spin"/> Thinking…</div>}
          </div>
          {error && <p role="alert" className="mx-4 mb-3 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-200 sm:mx-6">{error}</p>}
          <form onSubmit={event => void sendMessage(event)} className="border-t border-slate-800 p-3 sm:p-5">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-700 bg-[#030910] p-2 focus-within:border-cyan-300/50">
              <textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={2} maxLength={8000} placeholder="Message OmniNexus AI…" className="max-h-40 min-h-[48px] flex-1 resize-y bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600" />
              <button type="submit" disabled={loading || !input.trim()} aria-label="Send message" className="mb-1 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300 text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"><Send size={17}/></button>
            </div>
            <p className="mt-2 px-1 text-[11px] text-slate-600">AI can make mistakes. Avoid sharing passwords or sensitive personal information.</p>
          </form>
        </section>
      </div>
    </main>
  );
}
