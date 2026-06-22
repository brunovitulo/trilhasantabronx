import { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play } from "lucide-react";
import { Card } from "@/components/ui/card";

function fmt(t: number) {
  if (!isFinite(t) || isNaN(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ModuleAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrent(a.currentTime);
    const onMeta = () => setDuration(a.duration);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  function onSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const a = audioRef.current;
    if (!a) return;
    const v = Number(e.target.value);
    a.currentTime = v;
    setCurrent(v);
  }

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <Card className="mb-5 rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)] p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "rgba(20, 184, 166, 0.18)",
            border: "1px solid rgba(20, 184, 166, 0.45)",
            color: "#5eead4",
          }}
        >
          <Headphones className="h-5 w-5" />
        </div>
        <p className="text-sm text-foreground/90 flex-1">Escute o áudio por completo</p>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pausar" : "Reproduzir"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#0b1416] transition hover:opacity-90"
          style={{ background: "#5eead4" }}
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] tabular-nums text-muted-foreground w-9 text-right">
          {fmt(current)}
        </span>
        <div className="relative flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${pct}%`, background: "#14b8a6" }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={onSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Progresso do áudio"
          />
        </div>
        <span className="text-[11px] tabular-nums text-muted-foreground w-9">
          {fmt(duration)}
        </span>
      </div>
      <audio ref={audioRef} src={src} preload="metadata" />
    </Card>
  );
}
