"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ── Book text (from scanned page image) ── */
const CHAPTER_TITLE = "1. M\u00c4NS V\u00c5LD MOT KVINNOR I ETT GLOBALT PERSPEKTIV";
const AUTHOR = "GERD JOHNSSON-LATHAM";

const PARAGRAPHS = [
  "V\u00e4rlden \u00f6ver f\u00f6rekommer ett omfattande v\u00e5ld mot kvinnor. M\u00f6rkertalen \u00e4r h\u00f6ga och os\u00e4kerheten stor n\u00e4r det g\u00e4ller offer f\u00f6r m\u00e4ns v\u00e5ld mot kvinnor, inte minst i ett globalt perspektiv d\u00e4r definitionerna av vad som utg\u00f6r en v\u00e5ldshandling varierar avsev\u00e4rt mellan l\u00e4nder. Men kunskapen \u00f6kar fortl\u00f6pande, fr\u00e4mst genom att V\u00e4rldsh\u00e4lsoorganisationen (WHO), V\u00e4rldsbanken och UN Women tar fram och publicerar globala data bland annat om v\u00e5ldets omfattning och \u00e5tg\u00e4rder som vidtagits f\u00f6r att begr\u00e4nsa v\u00e5ldet och st\u00e4lla f\u00f6r\u00f6vare inf\u00f6r r\u00e4tta. \u00c4ven civilsamh\u00e4llet och forskarv\u00e4rlden bidrar till \u00f6kad kunskap p\u00e5 omr\u00e5det genom att lyfta fram orsaker till v\u00e5ldet.",
  "WHO presenterade 2013 en f\u00f6rsta global, systematisk kartl\u00e4ggning med vetenskapliga data om tv\u00e5 dominerande aspekter av globalt v\u00e5ld mot kvinnor: partnerv\u00e5ld och sexuellt v\u00e5ld av annan \u00e4n partnern.",
];

const FULL_TEXT = PARAGRAPHS.join(" ");

/* ── Voice data ── */
interface Voice {
  id: string;
  name: string;
  file: string;
  gender: string;
  description: string;
  category: "ref" | "swedish" | "premade";
}

const VOICES: Voice[] = [
  { id: "ref", name: "Referens (nuvarande)", file: "reference.m4a", gender: "female", description: "Befintlig l\u00f6sning \u2014 den vi ska sl\u00e5", category: "ref" },
  // Swedish native voices (community top picks)
  { id: "aSLKtNoVBZlxQEMsnGL2", name: "Sanna Hartfield", file: "sanna.mp3", gender: "female", description: "#1 svensk r\u00f6st \u2014 professionell ber\u00e4ttare", category: "swedish" },
  { id: "x0u3EW21dbrORJzOq1m9", name: "Adam Composer", file: "adam.mp3", gender: "male", description: "Djup resonant Stockholm-r\u00f6st", category: "swedish" },
  { id: "4Ct5uMEndw4cJ7q0Jx0l", name: "Elin", file: "elin.mp3", gender: "female", description: "M\u00e5ngsidig, tydlig", category: "swedish" },
  { id: "kkwvaJeTPw4KK0sBdyvD", name: "Bengt", file: "bengt.mp3", gender: "male", description: "Lugn audiobook-ber\u00e4ttare", category: "swedish" },
  { id: "a2RZfOPKpyNO38vDv3DD", name: "Annie", file: "annie.mp3", gender: "female", description: "Djup, seri\u00f6s \u2014 akademisk ton", category: "swedish" },
  { id: "e6OiUVixGLmvtdn2GJYE", name: "Jonas", file: "jonas.mp3", gender: "male", description: "Lugn, informativ", category: "swedish" },
  { id: "6eknYWL7D5Z4nRkDy15t", name: "Tommy Thunstr\u00f6m", file: "tommy.mp3", gender: "male", description: "V\u00e4rm Stockholms-ber\u00e4ttare", category: "swedish" },
  // ElevenLabs premade
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", file: "daniel.mp3", gender: "male", description: "Stadig nyhetsr\u00f6st", category: "premade" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", file: "george.mp3", gender: "male", description: "V\u00e4rm ber\u00e4ttare", category: "premade" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", file: "alice.mp3", gender: "female", description: "Tydlig, pedagogisk", category: "premade" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", file: "matilda.mp3", gender: "female", description: "Kunnig, professionell", category: "premade" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", file: "lily.mp3", gender: "female", description: "Sammetslen sk\u00e5despelare", category: "premade" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", file: "brian.mp3", gender: "male", description: "Djup, resonant", category: "premade" },
  { id: "pqHfZKP75CvOlQylNhV4", name: "Bill", file: "bill.mp3", gender: "male", description: "Vis, mogen", category: "premade" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", file: "sarah.mp3", gender: "female", description: "Trygg, s\u00e4ker", category: "premade" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", file: "roger.mp3", gender: "male", description: "Avslappnad, resonant", category: "premade" },
];

/* ── Fun suggestion prompts (tongue twisters etc) ── */
const TTS_SUGGESTIONS = [
  { label: "Tomten p\u00e5 tomten", text: "Tomten vandrade \u00f6ver tomten med en stor s\u00e4ck p\u00e5 ryggen. Det var inte vilken tomte som helst, utan tomten som bodde p\u00e5 tomten vid torpet." },
  { label: "Sju sjuka sk\u00f6terskor", text: "Sju sjuka sk\u00f6terskor sk\u00f6tte sju sjuka sj\u00f6m\u00e4n p\u00e5 det sjunkande skeppet Shanghai." },
  { label: "Kvansen i kvansen", text: "Barbro bodde i en bod bakom en bar. I baren bakom Barbros bod bodde en barbar. Barbaren i baren bakom Barbros bod barberade sig med Barbros borste." },
  { label: "F\u00e5r f\u00e5r f\u00e5r?", text: "F\u00e5r f\u00e5r f\u00e5r? Nej, f\u00e5r f\u00e5r inte f\u00e5r, f\u00e5r f\u00e5r lamm." },
  { label: "Nyhetsankaret", text: "God kv\u00e4ll och v\u00e4lkommen till nyheterna. Ikv\u00e4ll rapporterar vi om den senaste utvecklingen inom artificiell intelligens och dess p\u00e5verkan p\u00e5 det svenska samh\u00e4llet." },
  { label: "Akademisk text", text: "Den hermeneutiska fenomenologin erbjuder ett epistemologiskt ramverk f\u00f6r att f\u00f6rst\u00e5 subjektiva upplevelser i relation till sociokulturella strukturer och maktdynamiker." },
];

/* ── Password gate ── */
function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function submit() {
    if (code.trim().toLowerCase() === "marie2026") {
      localStorage.setItem("marie_auth", "true");
      onUnlock();
    } else {
      setError(true);
      setCode("");
      inputRef.current?.focus();
      setTimeout(() => setError(false), 1500);
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-[#FAF8F5] to-orange-50 flex items-center justify-center z-50">
      <div className="text-center max-w-sm px-6">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
          <span className="text-4xl select-none">&#128214;</span>
        </div>
        <h1 className="font-[family-name:var(--font-serif)] text-3xl font-bold text-gray-900 mb-1">Marie AI</h1>
        <p className="text-gray-400 text-sm mb-8">Ljudboksj\u00e4mf\u00f6relse</p>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ange kod..."
            className={`flex-1 px-4 py-3 border-2 rounded-xl text-sm font-medium outline-none transition-all bg-white ${
              error ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            }`}
          />
          <button onClick={submit} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-amber-200/50 cursor-pointer">
            \u00d6ppna
          </button>
        </div>
        {error && <p className="text-red-500 text-xs mt-3 font-medium">Fel kod \u2014 f\u00f6rs\u00f6k igen</p>}
      </div>
    </div>
  );
}

/* ── Book page with word highlighting ── */
function BookPage({ paragraphs, activeWordIndex }: { paragraphs: string[]; activeWordIndex: number }) {
  let wordCounter = 0;
  const activeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeWordIndex]);

  return (
    <div className="bg-[#FFFEF9] rounded-2xl border border-gray-200/80 shadow-sm p-8 md:p-12 max-w-2xl mx-auto relative overflow-hidden">
      {/* Decorative book spine */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300" />

      <div className="flex justify-end mb-6">
        <span className="text-[0.65rem] text-amber-600/70 bg-amber-50 border border-amber-200/60 rounded-full px-2.5 py-0.5 font-semibold">sid. 21</span>
      </div>

      <h2 className="font-[family-name:var(--font-serif)] text-[1.6rem] md:text-[1.9rem] font-bold text-gray-900 leading-tight mb-3 tracking-tight">
        {CHAPTER_TITLE}
      </h2>

      <p className="text-[0.7rem] tracking-[0.18em] text-gray-400 font-semibold mb-8 uppercase">{AUTHOR}</p>

      {paragraphs.map((para, pi) => {
        const paraWords = para.split(/\s+/);
        const startIdx = wordCounter;
        wordCounter += paraWords.length;

        return (
          <p key={pi} className="font-[family-name:var(--font-serif)] text-[1.05rem] md:text-[1.12rem] leading-[1.9] text-gray-800 mb-5" style={{ textIndent: pi > 0 ? "2rem" : "0" }}>
            {paraWords.map((word, wi) => {
              const globalIdx = startIdx + wi;
              const isActive = globalIdx === activeWordIndex;
              const isPast = globalIdx < activeWordIndex && activeWordIndex >= 0;
              return (
                <span
                  key={wi}
                  ref={isActive ? activeRef : undefined}
                  className={`transition-all duration-200 ${
                    isActive ? "bg-amber-300/60 text-gray-900 rounded-sm px-0.5 py-0.5 font-semibold" : isPast ? "text-gray-400" : "text-gray-800"
                  }`}
                >
                  {word}{" "}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

/* ── Voice card ── */
function VoiceCard({ voice, isSelected, isPlaying, onClick }: { voice: Voice; isSelected: boolean; isPlaying: boolean; onClick: () => void }) {
  const colorMap = {
    ref: { bg: "bg-red-100", text: "text-red-600", ring: "ring-red-100", border: "border-red-300", bgActive: "bg-red-50" },
    swedish: { bg: "bg-emerald-100", text: "text-emerald-600", ring: "ring-emerald-100", border: "border-emerald-300", bgActive: "bg-emerald-50" },
    premade: { bg: "bg-blue-100", text: "text-blue-600", ring: "ring-amber-100", border: "border-amber-300", bgActive: "bg-amber-50" },
  };
  const c = colorMap[voice.category];

  return (
    <button onClick={onClick} className={`text-left w-full p-2.5 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? `${c.border} ${c.bgActive} ring-2 ${c.ring}` : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"}`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${voice.category === "ref" ? c.bg + " " + c.text : voice.gender === "female" ? "bg-purple-100 text-purple-600" : "bg-sky-100 text-sky-600"}`}>
          {voice.category === "ref" ? "\u2022" : voice.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[0.8rem] font-semibold text-gray-900 truncate">{voice.name}</span>
            {isPlaying && <span className="flex gap-[2px] items-end h-3"><span className="w-[3px] bg-amber-500 rounded-full animate-bounce" style={{ height: 7, animationDelay: "0s" }}/><span className="w-[3px] bg-amber-500 rounded-full animate-bounce" style={{ height: 11, animationDelay: ".15s" }}/><span className="w-[3px] bg-amber-500 rounded-full animate-bounce" style={{ height: 5, animationDelay: ".3s" }}/></span>}
          </div>
          <p className="text-[0.65rem] text-gray-400 truncate">{voice.description}</p>
        </div>
        {voice.category === "ref" && <span className="text-[0.55rem] font-bold uppercase tracking-wider bg-red-100 text-red-500 px-1.5 py-0.5 rounded-md shrink-0">REF</span>}
        {voice.category === "swedish" && <span className="text-[0.55rem] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-md shrink-0">SV</span>}
      </div>
    </button>
  );
}

/* ── Playback bar ── */
function PlayBar({ voice, isPlaying, progress, onToggle, onSeek }: { voice: Voice; isPlaying: boolean; progress: number; onToggle: () => void; onSeek: (pct: number) => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={onToggle} className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-md shadow-amber-200/30">
          {isPlaying ? <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="4" height="12" rx="1"/><rect x="9" y="1" width="4" height="12" rx="1"/></svg> : <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1v12l9-6z"/></svg>}
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-gray-900">{voice.name}</span>
            <span className="text-[0.65rem] text-gray-400 font-medium">{voice.category === "ref" ? "Nuvarande l\u00f6sning" : voice.category === "swedish" ? "Svensk AI-r\u00f6st" : "ElevenLabs Pro"}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full cursor-pointer relative group" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); onSeek((e.clientX - r.left) / r.width); }}>
            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-[width] duration-100 relative" style={{ width: `${progress * 100}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-amber-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main app ── */
export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(VOICES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [ttsText, setTtsText] = useState("");
  const [ttsVoice, setTtsVoice] = useState<Voice>(VOICES[1]); // Default to Sanna
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsAudioSrc, setTtsAudioSrc] = useState<string | null>(null);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [ttsWordIndex, setTtsWordIndex] = useState(-1);
  const [ttsProgress, setTtsProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ttsAudioRef = useRef<HTMLAudioElement>(null);
  const animFrameRef = useRef<number>(0);
  const ttsAnimRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("marie_auth") === "true") setAuthed(true);
  }, []);

  const totalWords = FULL_TEXT.split(/\s+/).length;

  const updateWordTracking = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;
    const pct = audio.currentTime / audio.duration;
    setProgress(pct);
    setActiveWordIndex(Math.min(Math.floor(pct * totalWords), totalWords - 1));
    animFrameRef.current = requestAnimationFrame(updateWordTracking);
  }, [totalWords]);

  const updateTtsTracking = useCallback(() => {
    const audio = ttsAudioRef.current;
    if (!audio || audio.paused) return;
    const pct = audio.currentTime / audio.duration;
    setTtsProgress(pct);
    const words = ttsText.split(/\s+/).length;
    setTtsWordIndex(Math.min(Math.floor(pct * words), words - 1));
    ttsAnimRef.current = requestAnimationFrame(updateTtsTracking);
  }, [ttsText]);

  function playVoice(voice: Voice) {
    const audio = audioRef.current;
    if (!audio) return;
    if (selectedVoice.id === voice.id && isPlaying) {
      audio.pause(); setIsPlaying(false); cancelAnimationFrame(animFrameRef.current); return;
    }
    setSelectedVoice(voice); setActiveWordIndex(-1); setProgress(0);
    audio.src = `/audio/${voice.file}`;
    audio.play(); setIsPlaying(true);
    animFrameRef.current = requestAnimationFrame(updateWordTracking);
  }

  function seekTo(pct: number) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = pct * audio.duration; setProgress(pct);
    setActiveWordIndex(Math.min(Math.floor(pct * totalWords), totalWords - 1));
  }

  async function generateTts() {
    if (!ttsText.trim() || ttsLoading) return;
    setTtsLoading(true); setTtsAudioSrc(null); setTtsWordIndex(-1); setTtsProgress(0);
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ttsVoice.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "xi-api-key": "sk_2abc8abfb1ff9b11e2cc1d94ea74ab54e12946bd4c807988" },
        body: JSON.stringify({ text: ttsText, model_id: "eleven_v3", voice_settings: { stability: 0.7, similarity_boost: 0.8, style: 0.3 } }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setTtsAudioSrc(url);
      setTimeout(() => {
        const audio = ttsAudioRef.current;
        if (audio) { audio.src = url; audio.play(); setTtsPlaying(true); ttsAnimRef.current = requestAnimationFrame(updateTtsTracking); }
      }, 100);
    } catch { alert("Kunde inte generera ljud. F\u00f6rs\u00f6k igen."); }
    setTtsLoading(false);
  }

  if (!authed) return <Gate onUnlock={() => setAuthed(true)} />;

  const swedishVoices = VOICES.filter((v) => v.category === "swedish");
  const premadeVoices = VOICES.filter((v) => v.category === "premade");
  const refVoice = VOICES.find((v) => v.category === "ref")!;
  const ttsVoiceOptions = VOICES.filter((v) => v.category !== "ref");

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      <audio ref={audioRef} onEnded={() => { setIsPlaying(false); setActiveWordIndex(-1); setProgress(0); cancelAnimationFrame(animFrameRef.current); }} onPause={() => { setIsPlaying(false); cancelAnimationFrame(animFrameRef.current); }} onPlay={() => { setIsPlaying(true); animFrameRef.current = requestAnimationFrame(updateWordTracking); }} />
      <audio ref={ttsAudioRef} onEnded={() => { setTtsPlaying(false); setTtsWordIndex(-1); setTtsProgress(0); cancelAnimationFrame(ttsAnimRef.current); }} onPause={() => { setTtsPlaying(false); cancelAnimationFrame(ttsAnimRef.current); }} onPlay={() => { setTtsPlaying(true); ttsAnimRef.current = requestAnimationFrame(updateTtsTracking); }} />

      {/* Gradient top bar */}
      <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-400" />

      {/* Sticky header */}
      <header className="border-b border-gray-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <span className="text-lg select-none">&#128214;</span>
            </div>
            <h1 className="font-[family-name:var(--font-serif)] text-lg font-bold text-gray-900">Marie AI</h1>
            <span className="text-[0.55rem] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200/60">Ljudbok Demo</span>
          </div>
          <div className="flex items-center gap-2 text-[0.65rem] text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ElevenLabs Pro
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Vilken r\u00f6st l\u00e4ser b\u00e4st?
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-[0.95rem] leading-relaxed">
            V\u00e4lj bland {VOICES.length - 1} AI-r\u00f6ster och j\u00e4mf\u00f6r mot nuvarande l\u00f6sning. Texten markeras ord f\u00f6r ord.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 mb-16">
          {/* Left column: book + controls */}
          <div>
            <BookPage paragraphs={PARAGRAPHS} activeWordIndex={activeWordIndex} />
            <div className="mt-4">
              <PlayBar voice={selectedVoice} isPlaying={isPlaying} progress={progress} onToggle={() => playVoice(selectedVoice)} onSeek={seekTo} />
            </div>
          </div>

          {/* Right column: voice selector */}
          <div className="space-y-5">
            {/* Reference */}
            <div>
              <h3 className="text-[0.65rem] font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Nuvarande l\u00f6sning
              </h3>
              <VoiceCard voice={refVoice} isSelected={selectedVoice.id === refVoice.id} isPlaying={isPlaying && selectedVoice.id === refVoice.id} onClick={() => playVoice(refVoice)} />
            </div>

            {/* Swedish voices */}
            <div>
              <h3 className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Svenska AI-r\u00f6ster
              </h3>
              <div className="space-y-1">
                {swedishVoices.map((v) => (
                  <VoiceCard key={v.id} voice={v} isSelected={selectedVoice.id === v.id} isPlaying={isPlaying && selectedVoice.id === v.id} onClick={() => playVoice(v)} />
                ))}
              </div>
            </div>

            {/* Premade voices */}
            <div>
              <h3 className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> \u00d6vriga r\u00f6ster
              </h3>
              <div className="space-y-1">
                {premadeVoices.map((v) => (
                  <VoiceCard key={v.id} voice={v} isSelected={selectedVoice.id === v.id} isPlaying={isPlaying && selectedVoice.id === v.id} onClick={() => playVoice(v)} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── LIVE TTS Section ── */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Testa sj\u00e4lv
            </h2>
            <p className="text-gray-500 text-sm">
              Skriv valfri text och v\u00e4lj r\u00f6st \u2014 AI:n l\u00e4ser upp direkt.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            {/* Voice picker */}
            <div className="flex items-center gap-3 mb-4">
              <label className="text-[0.7rem] font-bold uppercase tracking-wider text-gray-400 shrink-0">R\u00f6st:</label>
              <select
                value={ttsVoice.id}
                onChange={(e) => { const v = ttsVoiceOptions.find((x) => x.id === e.target.value); if (v) setTtsVoice(v); }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
              >
                <optgroup label="Svenska r\u00f6ster">
                  {swedishVoices.map((v) => <option key={v.id} value={v.id}>{v.name} \u2014 {v.description}</option>)}
                </optgroup>
                <optgroup label="\u00d6vriga">
                  {premadeVoices.map((v) => <option key={v.id} value={v.id}>{v.name} \u2014 {v.description}</option>)}
                </optgroup>
              </select>
            </div>

            {/* Text input */}
            <textarea
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              placeholder="Skriv n\u00e5got att l\u00e4sa upp..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[0.95rem] leading-relaxed resize-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none mb-3 font-[family-name:var(--font-serif)]"
            />

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="text-[0.6rem] text-gray-400 uppercase tracking-wider font-bold self-center mr-1">F\u00f6rslag:</span>
              {TTS_SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setTtsText(s.text)}
                  className="px-2.5 py-1 text-[0.7rem] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Generate button */}
            <button
              onClick={generateTts}
              disabled={!ttsText.trim() || ttsLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md shadow-amber-200/30 disabled:shadow-none"
            >
              {ttsLoading ? "Genererar..." : "\u25b6 L\u00e4s upp"}
            </button>

            {/* TTS playback with word highlighting */}
            {ttsAudioSrc && ttsText && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                {/* Word highlighting for TTS */}
                <div className="font-[family-name:var(--font-serif)] text-[1rem] leading-[1.9] text-gray-800 mb-4 p-4 bg-gray-50 rounded-xl">
                  {ttsText.split(/\s+/).map((word, i) => (
                    <span key={i} className={`transition-all duration-150 ${i === ttsWordIndex ? "bg-amber-300/60 text-gray-900 rounded-sm px-0.5 py-0.5 font-semibold" : i < ttsWordIndex && ttsWordIndex >= 0 ? "text-gray-400" : "text-gray-800"}`}>
                      {word}{" "}
                    </span>
                  ))}
                </div>

                {/* TTS progress bar */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { const a = ttsAudioRef.current; if (!a) return; if (ttsPlaying) { a.pause(); } else { a.play(); } }}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
                  >
                    {ttsPlaying ? <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="4" height="12" rx="1"/><rect x="9" y="1" width="4" height="12" rx="1"/></svg> : <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1v12l9-6z"/></svg>}
                  </button>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full cursor-pointer" onClick={(e) => { const a = ttsAudioRef.current; if (!a || !a.duration) return; const r = e.currentTarget.getBoundingClientRect(); const pct = (e.clientX - r.left) / r.width; a.currentTime = pct * a.duration; }}>
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-[width] duration-100" style={{ width: `${ttsProgress * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 font-medium shrink-0">{ttsVoice.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 mt-16 py-8 text-center">
        <p className="text-[0.7rem] text-gray-400">Marie AI \u2014 Ljudboksj\u00e4mf\u00f6relse \u00a9 2026</p>
        <p className="text-[0.6rem] text-gray-300 mt-1">Powered by ElevenLabs Pro \u00b7 Next.js \u00b7 Vercel</p>
      </footer>
    </main>
  );
}
