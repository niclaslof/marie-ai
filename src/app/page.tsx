"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ── Book text (from scanned page) ── */
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
}

const VOICES: Voice[] = [
  { id: "ref", name: "Referens (nuvarande)", file: "reference.m4a", gender: "female", description: "Befintlig l\u00f6sning \u2014 den vi ska g\u00f6ra b\u00e4ttre" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", file: "daniel.mp3", gender: "male", description: "Stadig nyhetsr\u00f6st, brittisk" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", file: "george.mp3", gender: "male", description: "V\u00e4rm ber\u00e4ttare, brittisk" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", file: "alice.mp3", gender: "female", description: "Tydlig, pedagogisk" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", file: "matilda.mp3", gender: "female", description: "Kunnig, professionell" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", file: "lily.mp3", gender: "female", description: "Sammetslen sk\u00e5despelare" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", file: "brian.mp3", gender: "male", description: "Djup, resonant" },
  { id: "pqHfZKP75CvOlQylNhV4", name: "Bill", file: "bill.mp3", gender: "male", description: "Vis, mogen" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", file: "sarah.mp3", gender: "female", description: "Trygg, s\u00e4ker" },
  { id: "8ygtgGe12MJC4rkSz8Fu", name: "H\u00e5kan PVC", file: "hakan-pvc.mp3", gender: "male", description: "Svensk klonad r\u00f6st" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", file: "roger.mp3", gender: "male", description: "Avslappnad, resonant" },
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
    <div className="fixed inset-0 bg-[#FAF8F5] flex items-center justify-center z-50">
      <div className="text-center max-w-sm px-6">
        <div className="text-5xl mb-4 select-none">&#128214;</div>
        <h1 className="font-[family-name:var(--font-serif)] text-2xl font-bold text-gray-900 mb-2">Marie AI</h1>
        <p className="text-gray-500 text-sm mb-6">Ljudboksj&#228;mf&#246;relse &#8212; ange kod f&#246;r att forts&#228;tta</p>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Kod..."
            className={`flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium outline-none transition-all ${
              error ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            }`}
          />
          <button
            onClick={submit}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            &#214;ppna
          </button>
        </div>
        {error && <p className="text-red-500 text-xs mt-2">Fel kod</p>}
      </div>
    </div>
  );
}

/* ── Book page with word highlighting ── */
function BookPage({ paragraphs, activeWordIndex }: { paragraphs: string[]; activeWordIndex: number }) {
  let wordCounter = 0;
  return (
    <div className="bg-[#FFFEF9] rounded-xl border border-gray-200 shadow-sm p-8 md:p-12 max-w-2xl mx-auto">
      <div className="flex justify-end mb-6">
        <span className="text-xs text-gray-400 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 font-medium">21</span>
      </div>

      <h2 className="font-[family-name:var(--font-serif)] text-[1.7rem] md:text-[2rem] font-bold text-gray-900 leading-tight mb-4 tracking-tight">
        {CHAPTER_TITLE}
      </h2>

      <p className="text-xs tracking-[0.15em] text-gray-500 font-medium mb-8 uppercase">{AUTHOR}</p>

      {paragraphs.map((para, pi) => {
        const paraWords = para.split(/\s+/);
        const startIdx = wordCounter;
        wordCounter += paraWords.length;

        return (
          <p
            key={pi}
            className="font-[family-name:var(--font-serif)] text-[1.05rem] md:text-[1.15rem] leading-[1.85] text-gray-800 mb-5"
            style={{ textIndent: pi > 0 ? "2rem" : "0" }}
          >
            {paraWords.map((word, wi) => {
              const globalIdx = startIdx + wi;
              const isActive = globalIdx === activeWordIndex;
              const isPast = globalIdx < activeWordIndex && activeWordIndex >= 0;
              return (
                <span
                  key={wi}
                  className={`transition-colors duration-150 ${
                    isActive
                      ? "bg-amber-200 text-gray-900 rounded px-0.5"
                      : isPast
                      ? "text-gray-400"
                      : "text-gray-800"
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

/* ── Voice selector card ── */
function VoiceCard({
  voice,
  isSelected,
  isPlaying,
  onClick,
}: {
  voice: Voice;
  isSelected: boolean;
  isPlaying: boolean;
  onClick: () => void;
}) {
  const isRef = voice.id === "ref";
  return (
    <button
      onClick={onClick}
      className={`text-left w-full p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? isRef
            ? "border-red-300 bg-red-50 ring-2 ring-red-100"
            : "border-amber-300 bg-amber-50 ring-2 ring-amber-100"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            isRef
              ? "bg-red-100 text-red-600"
              : voice.gender === "female"
              ? "bg-purple-100 text-purple-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {isRef ? "REF" : voice.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-900 truncate">{voice.name}</span>
            {isPlaying && (
              <span className="flex gap-0.5 items-end h-3">
                <span className="w-0.5 bg-amber-500 rounded-full animate-bounce" style={{ height: "8px", animationDelay: "0s" }} />
                <span className="w-0.5 bg-amber-500 rounded-full animate-bounce" style={{ height: "12px", animationDelay: "0.15s" }} />
                <span className="w-0.5 bg-amber-500 rounded-full animate-bounce" style={{ height: "6px", animationDelay: "0.3s" }} />
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{voice.description}</p>
        </div>
        {isRef && (
          <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-red-100 text-red-600 px-1.5 py-0.5 rounded shrink-0">Nuvarande</span>
        )}
      </div>
    </button>
  );
}

/* ── Main app ── */
export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(VOICES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("marie_auth") === "true") {
      setAuthed(true);
    }
  }, []);

  const totalWords = FULL_TEXT.split(/\s+/).length;

  const updateWordTracking = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;

    const pct = audio.currentTime / audio.duration;
    setProgress(pct);
    const wordIdx = Math.floor(pct * totalWords);
    setActiveWordIndex(Math.min(wordIdx, totalWords - 1));
    animFrameRef.current = requestAnimationFrame(updateWordTracking);
  }, [totalWords]);

  function playVoice(voice: Voice) {
    const audio = audioRef.current;
    if (!audio) return;

    if (selectedVoice.id === voice.id && isPlaying) {
      audio.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    setSelectedVoice(voice);
    setActiveWordIndex(-1);
    setProgress(0);
    audio.src = `/audio/${voice.file}`;
    audio.play();
    setIsPlaying(true);
    animFrameRef.current = requestAnimationFrame(updateWordTracking);
  }

  function handleAudioEnded() {
    setIsPlaying(false);
    setActiveWordIndex(-1);
    setProgress(0);
    cancelAnimationFrame(animFrameRef.current);
  }

  function handleAudioPause() {
    setIsPlaying(false);
    cancelAnimationFrame(animFrameRef.current);
  }

  function handleAudioPlay() {
    setIsPlaying(true);
    animFrameRef.current = requestAnimationFrame(updateWordTracking);
  }

  function seekTo(pct: number) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = pct * audio.duration;
    setProgress(pct);
    const wordIdx = Math.floor(pct * totalWords);
    setActiveWordIndex(Math.min(wordIdx, totalWords - 1));
  }

  if (!authed) return <Gate onUnlock={() => setAuthed(true)} />;

  const femaleVoices = VOICES.filter((v) => v.gender === "female" && v.id !== "ref");
  const maleVoices = VOICES.filter((v) => v.gender === "male");
  const refVoice = VOICES.find((v) => v.id === "ref")!;

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      <audio ref={audioRef} onEnded={handleAudioEnded} onPause={handleAudioPause} onPlay={handleAudioPlay} />

      <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none">&#128214;</span>
            <h1 className="font-[family-name:var(--font-serif)] text-lg font-bold text-gray-900">Marie AI</h1>
            <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
              Ljudbok
            </span>
          </div>
          <div className="text-xs text-gray-400">Powered by ElevenLabs Pro</div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="font-[family-name:var(--font-serif)] text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Vilken r&#246;st l&#228;ser b&#228;st?
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            J&#228;mf&#246;r AI-r&#246;ster sida vid sida. V&#228;lj en r&#246;st till h&#246;ger &#8212; texten f&#246;ljer med medan du lyssnar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div>
            <BookPage paragraphs={PARAGRAPHS} activeWordIndex={activeWordIndex} />

            {selectedVoice && (
              <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 max-w-2xl mx-auto">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => playVoice(selectedVoice)}
                    className="w-10 h-10 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  >
                    {isPlaying ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="4" height="12" rx="1"/><rect x="9" y="1" width="4" height="12" rx="1"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M2 1.5v11l10-5.5z"/></svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">{selectedVoice.name}</span>
                      <span className="text-xs text-gray-400">{selectedVoice.id === "ref" ? "Nuvarande l\u00f6sning" : "ElevenLabs Pro"}</span>
                    </div>
                    <div
                      className="w-full h-1.5 bg-gray-100 rounded-full cursor-pointer relative"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        seekTo((e.clientX - rect.left) / rect.width);
                      }}
                    >
                      <div
                        className="h-full bg-amber-500 rounded-full transition-[width] duration-100"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Referens (nuvarande l&#246;sning)
              </h3>
              <VoiceCard
                voice={refVoice}
                isSelected={selectedVoice.id === refVoice.id}
                isPlaying={isPlaying && selectedVoice.id === refVoice.id}
                onClick={() => playVoice(refVoice)}
              />
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                V&#229;ra AI-r&#246;ster (ElevenLabs Pro)
              </h3>

              <p className="text-[0.65rem] text-gray-400 mb-3 uppercase tracking-wider font-medium">Kvinnliga</p>
              <div className="space-y-1.5 mb-4">
                {femaleVoices.map((v) => (
                  <VoiceCard key={v.id} voice={v} isSelected={selectedVoice.id === v.id} isPlaying={isPlaying && selectedVoice.id === v.id} onClick={() => playVoice(v)} />
                ))}
              </div>

              <p className="text-[0.65rem] text-gray-400 mb-3 uppercase tracking-wider font-medium">Manliga</p>
              <div className="space-y-1.5">
                {maleVoices.map((v) => (
                  <VoiceCard key={v.id} voice={v} isSelected={selectedVoice.id === v.id} isPlaying={isPlaying && selectedVoice.id === v.id} onClick={() => playVoice(v)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-200 mt-16 py-6 text-center text-xs text-gray-400">
        Marie AI &#8212; Ljudboksj&#228;mf&#246;relse &#169; 2026 &#183; Powered by ElevenLabs Pro
      </footer>
    </main>
  );
}
