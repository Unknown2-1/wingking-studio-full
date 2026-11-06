import React from "react";
import { MessageCircle, Send, X, Music2, MapPin, ArrowUpRight, LoaderCircle, Sparkles } from "lucide-react";
import { config } from "./config.js";
import "./wingking-assistant.css";

const START = {
  role: "assistant",
  text: "Halo! Aku asisten info Wingking. Mau tanya lokasi studio, booking, video, band, atau cara upload karya? Langsung aja!",
  mode: "info",
};
const QUICK_QUESTIONS = [
  "Cara booking studio?",
  "Di mana lokasi Wingking?",
  "Berapa harga studio?",
  "Bagaimana cara upload karya?",
];
const CONTACT = config.whatsappUrl || "https://wa.me/6281215600081";
const MAPS = config.locationUrl || "https://www.google.com/maps?q=Wingking+Hub+Studio+Purwokerto";
const ENDPOINT = config.supabaseUrl
  ? config.supabaseUrl.replace(/\/+$/, "") + "/functions/v1/wingking-studio-assistant"
  : "";

export default function WingkingAssistant() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([START]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);
  const controllerRef = React.useRef(null);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);
  React.useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, messages, busy]);
  React.useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);
  React.useEffect(() => () => controllerRef.current?.abort(), []);

  const ask = async (suggestion) => {
    const question = String(suggestion ?? input).trim().slice(0, 400);
    if (!question || busy) return;
    const history = messages.slice(1).slice(-6).map((m) => ({
      role: m.role, content: m.text.slice(0, 400),
    }));
    setInput("");
    setBusy(true);
    setMessages((items) => [...items, { role: "user", text: question }]);
    const ctrl = new AbortController();
    controllerRef.current = ctrl;
    const timeoutId = setTimeout(() => ctrl.abort(), 15000);
    try {
      if (!ENDPOINT) throw new Error("Koneksi informasi studio belum tersedia.");
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(config.supabaseKey ? { apikey: config.supabaseKey } : {}),
        },
        body: JSON.stringify({ message: question, history }),
        signal: ctrl.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 429) throw new Error("Pertanyaan terlalu banyak. Coba beberapa menit lagi, ya.");
        throw new Error(data.error || "Belum bisa menjawab. Coba lagi sebentar.");
      }
      if (!data.reply || typeof data.reply !== "string") throw new Error("Jawaban belum tersedia.");
      setMessages((items) => [...items, {
        role: "assistant", text: data.reply.slice(0, 1400), mode: data.mode === "ai" ? "ai" : "info",
      }]);
    } catch (error) {
      setMessages((items) => [...items, {
        role: "assistant",
        text: error?.name === "AbortError"
          ? "Koneksi ke asisten terlalu lama. Coba lagi, atau langsung chat tim Wingking."
          : (error?.message || "Asisten belum bisa dihubungi. Silakan chat tim Wingking."),
        mode: "error",
      }]);
    } finally {
      clearTimeout(timeoutId);
      setBusy(false);
      controllerRef.current = null;
    }
  };
  const hasQuestion = messages.some((m) => m.role === "user");
  const lastMode = [...messages].reverse().find((m) => m.role === "assistant")?.mode;

  return (
    <div className="wk-ai-root">
      {open && (
        <aside className="wk-ai-panel" role="dialog" aria-label="Chat dengan asisten Wingking">
          <header className="wk-ai-header">
            <div className="wk-ai-logo" aria-hidden="true"><img src="/assets/watermelon-ai.webp" width="52" height="52" alt="" /></div>
            <div className="wk-ai-heading">
              <span className="wk-ai-kicker">WINGKING STUDIO / HELP DESK</span>
              <strong>ASK WINGKING<span className="wk-ai-header-dot">.</span></strong>
              <span className="wk-ai-status"><span className="wk-ai-online" /> Siap bantu cari info studio</span>
            </div>
            <button type="button" className="wk-ai-close" aria-label="Tutup chatbot" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </header>

          <div ref={listRef} className="wk-ai-chat-scroll" aria-live="polite" aria-relevant="additions text">
            {messages.map((message, i) => (
              <div key={i} className={"wk-ai-message " + (message.role === "user" ? "wk-ai-from-user" : "wk-ai-from-studio")}>
                {message.role === "assistant" && (
                  <span className="wk-ai-message-label">
                    {i === 0 ? "WINGKING" : message.mode === "ai" ? "WINGKING AI" : "INFO WINGKING"}
                  </span>
                )}
                <p>{message.text}</p>
              </div>
            ))}
            {!hasQuestion && (
              <div className="wk-ai-suggestions">
                <span>COBA TANYA INI</span>
                {QUICK_QUESTIONS.map((q) => (
                  <button type="button" key={q} onClick={() => ask(q)} disabled={busy}>{q}<ArrowUpRight size={14} /></button>
                ))}
              </div>
            )}
            {busy && (
              <div className="wk-ai-typing" role="status">
                <LoaderCircle size={17} className="wk-ai-spin" /> Lagi cari jawabannya...
              </div>
            )}
          </div>

          <div className="wk-ai-bottom">
            <div className="wk-ai-actions">
              <a href={CONTACT} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /> Hubungi Tim</a>
              <a href={MAPS} target="_blank" rel="noopener noreferrer"><MapPin size={15} /> Lokasi</a>
            </div>
            <form className="wk-ai-form" onSubmit={(event) => { event.preventDefault(); ask(input); }}>
              <label className="wk-ai-visually-hidden" htmlFor="wk-ai-input">Tulis pertanyaan tentang Wingking Studio</label>
              <input
                ref={inputRef} id="wk-ai-input" type="text" maxLength={400}
                placeholder="Tanya apa aja soal Wingking..."
                value={input} onChange={(event) => setInput(event.target.value)}
                disabled={busy} autoComplete="off"
              />
              <button type="submit" aria-label="Kirim pertanyaan" disabled={busy || !input.trim()}>
                {busy ? <LoaderCircle size={20} className="wk-ai-spin" /> : <Send size={19} />}
              </button>
            </form>
            <small>{lastMode === "ai" ? "Dibantu AI • " : "Asisten informasi • "}Harga dan jadwal final dikonfirmasi tim Wingking.</small>
          </div>
        </aside>
      )}
      <button
        className={"wk-ai-trigger" + (open ? " wk-ai-trigger-open" : "")}
        type="button"
        aria-label={open ? "Tutup asisten Wingking" : "Buka asisten Wingking"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={20} /> : <Sparkles size={19} />}
        <span>{open ? "TUTUP CHAT" : "TANYA WINGKING"}</span>
        {!open && <span className="wk-ai-trigger-dot" />}
      </button>
    </div>
  );
}
