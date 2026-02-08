import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Navigation,
  ExternalLink,
  Search,
  MessageSquare,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Moon,
  SunMedium,
  Image as ImageIcon,
  Volume2,
  Newspaper,
  Languages,
  X,
  MapPin,
  Key,
  CloudLightning,
  CloudDrizzle,
  CloudSnow,
  CloudFog,
  Droplets,
  Snowflake,
  FileAudio,
  Volume1,
  Radio,
  PlayCircle,
  ShieldCheck,
  Trash2,
  Calendar,
  Mail,
  Globe,
  ArrowLeftRight,
  Send,
  PenLine,
  Settings2,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- CONFIG ---
const CITIES = [
  "札幌",
  "仙台",
  "新潟",
  "金沢",
  "東京",
  "横浜",
  "名古屋",
  "大阪",
  "京都",
  "広島",
  "高知",
  "福岡",
  "沖縄",
];
const CITIES_GEO = {
  札幌: { lat: 43.06, lon: 141.35 },
  仙台: { lat: 38.27, lon: 140.87 },
  新潟: { lat: 37.92, lon: 139.04 },
  金沢: { lat: 36.56, lon: 136.66 },
  東京: { lat: 35.69, lon: 139.69 },
  横浜: { lat: 35.44, lon: 139.64 },
  名古屋: { lat: 35.18, lon: 136.91 },
  大阪: { lat: 34.69, lon: 135.5 },
  京都: { lat: 35.01, lon: 135.77 },
  広島: { lat: 34.39, lon: 132.46 },
  高知: { lat: 33.56, lon: 133.53 },
  福岡: { lat: 33.59, lon: 130.4 },
  沖縄: { lat: 26.21, lon: 127.68 },
};

const getWeatherMeta = (code) => {
  const map = {
    0: { icon: <Sun className="text-amber-400" />, label: "快晴" },
    1: { icon: <SunMedium className="text-amber-300" />, label: "晴れ" },
    2: { icon: <Cloud className="text-slate-300" />, label: "薄曇り" },
    3: { icon: <Cloud className="text-slate-500" />, label: "曇り" },
    45: { icon: <CloudFog className="text-slate-400" />, label: "霧" },
    51: { icon: <CloudDrizzle className="text-cyan-300" />, label: "霧雨" },
    61: { icon: <CloudRain className="text-blue-400" />, label: "小雨" },
    63: { icon: <CloudRain className="text-blue-600" />, label: "雨" },
    65: { icon: <Droplets className="text-blue-800" />, label: "豪雨" },
    71: { icon: <CloudSnow className="text-indigo-200" />, label: "小雪" },
    73: { icon: <CloudSnow className="text-white" />, label: "雪" },
    75: { icon: <Snowflake className="text-white" />, label: "大雪" },
    95: { icon: <CloudLightning className="text-yellow-400" />, label: "雷雨" },
  };
  return (
    map[code] || { icon: <Cloud className="text-slate-400" />, label: "曇り" }
  );
};

const pcmToWav = (pcmBase64, sampleRate) => {
  const binaryString = atob(pcmBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++)
    bytes[i] = binaryString.charCodeAt(i);
  const buffer = new ArrayBuffer(44 + bytes.length);
  const view = new DataView(buffer);
  const writeString = (o, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 32 + bytes.length, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, bytes.length, true);
  new Uint8Array(buffer, 44).set(bytes);
  return new Blob([buffer], { type: "audio/wav" });
};

const ProgressIndicator = ({ progress, isReady, small = false }) => {
  if (isReady)
    return (
      <div
        className={`${
          small ? "w-1.5 h-1.5" : "w-2.5 h-2.5"
        } rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse`}
      />
    );
  const dash = (progress / 100) * 50.2;
  return (
    <div
      className={`relative ${
        small ? "w-4 h-4" : "w-5 h-5"
      } flex items-center justify-center`}
    >
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-10"
        />
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-amber-500 transition-all duration-300"
          strokeDasharray="50.2"
          strokeDashoffset={50.2 - dash}
        />
      </svg>
    </div>
  );
};

export default function App() {
  const [time, setTime] = useState(new Date());
  const [city, setCity] = useState("東京");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [news, setNews] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [bgImage, setBgImage] = useState(null);
  const [memo, setMemo] = useState(
    localStorage.getItem("my_dashboard_memo_v22") || ""
  );
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isLandscape, setIsLandscape] = useState(
    window.innerWidth > window.innerHeight
  );

  // API Key Management
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("gemini_api_key_v22") || ""
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const PRESETS = [1, 3, 5, 10, 15, 20, 25, 30, 45, 60];
  const [timeLeft, setTimeLeft] = useState(1500);
  const [duration, setDuration] = useState(1500);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [ambientAudioUrl, setAmbientAudioUrl] = useState(null);

  const wallpaperInputRef = useRef(null);

  const [segments, setSegments] = useState({
    greet: { label: "挨拶", ready: false, progress: 0, audio: null },
    weather: { label: "天気解説", ready: false, progress: 0, audio: null },
    n1: { label: "ニュース1", ready: false, progress: 0, audio: null },
    n2: { label: "ニュース2", ready: false, progress: 0, audio: null },
    n3: { label: "ニュース3", ready: false, progress: 0, audio: null },
    n4: { label: "ニュース4", ready: false, progress: 0, audio: null },
    n5: { label: "ニュース5", ready: false, progress: 0, audio: null },
  });
  const segmentsRef = useRef(segments);
  const [currentPlayId, setCurrentPlayId] = useState(null);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleResize = () =>
      setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener("resize", handleResize);
    const ticker = setInterval(() => setTime(new Date()), 1000);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(ticker);
    };
  }, []);

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);
  useEffect(() => {
    localStorage.setItem("my_dashboard_memo_v22", memo);
  }, [memo]);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("gemini_api_key_v22", apiKey);
    } else {
      localStorage.removeItem("gemini_api_key_v22");
    }
  }, [apiKey]);

  useEffect(() => {
    loadAllData();
  }, [city]);

  const loadAllData = async () => {
    try {
      const { lat, lon } = CITIES_GEO[city];
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode,winddirection_10m&timezone=Asia%2FTokyo`
      );
      const wData = await res.json();
      setWeather(wData.current_weather);

      const nowIdx = new Date().getHours();
      setForecast(
        wData.hourly.time.slice(nowIdx, nowIdx + 12).map((t, i) => ({
          hour: new Date(t).getHours(),
          temp: wData.hourly.temperature_2m[nowIdx + i],
          code: wData.hourly.weathercode[nowIdx + i],
        }))
      );

      const newsRes = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=https://www3.nhk.or.jp/rss/news/cat0.xml`
      );
      const nData = await newsRes.json();
      const items = nData.items.slice(0, 5);
      setNews(items.map((it) => ({ ...it, summary: "要約作成中..." })));

      if (apiKey) startVoicePipeline(wData.current_weather, items);
    } catch (e) {
      console.error("Data fetch error", e);
    }
  };

  const handleCustomWallpaper = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBgImage(url);
    }
  };

  const callAI = async (prompt, system = "", onProg) => {
    if (!apiKey) return "APIキーが設定されていません。";
    if (onProg) onProg(20);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: system }] },
          }),
        }
      );
      if (onProg) onProg(80);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (onProg) onProg(100);
      return text;
    } catch (e) {
      return `Error: ${e.message}`;
    }
  };

  const translateMemo = async () => {
    if (!memo || isTranslating || !apiKey) return;
    setIsTranslating(true);
    const result = await callAI(
      `Translate the following text. If Japanese, to English. Otherwise, to Japanese. Return ONLY the translated text, no preamble.\n\n${memo}`,
      "Professional Translator. No conversational filler."
    );
    if (result && !result.startsWith("Error")) setMemo(result.trim());
    setIsTranslating(false);
  };

  const getVoice = async (text) => {
    try {
      const phoneticText = await callAI(
        `${text}\n\n上記をアナウンサー風に。ひらがなのみ、漢字なし。`,
        "Phonetic Editor"
      );
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: phoneticText }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
              },
            },
          }),
        }
      );
      const d = await res.json();
      const pcm = d.candidates[0].content.parts[0].inlineData.data;
      const rate = parseInt(
        d.candidates[0].content.parts[0].inlineData.mimeType.match(
          /rate=(\d+)/
        )?.[1] || "24000"
      );
      return URL.createObjectURL(pcmToWav(pcm, rate));
    } catch (e) {
      return null;
    }
  };

  const startVoicePipeline = async (currW, newsList) => {
    const setSeg = (id, fields) =>
      setSegments((v) => ({ ...v, [id]: { ...v[id], ...fields } }));
    Object.keys(segments).forEach((id) =>
      setSeg(id, { ready: false, progress: 0, audio: null })
    );

    const greetStr = `${city}の現在の天気は${
      getWeatherMeta(currW.weathercode).label
    }、気温は${currW.temperature}度です。`;
    getVoice(greetStr).then((url) =>
      setSeg("greet", { audio: url, ready: true, progress: 100 })
    );

    callAI(`${city}の現在の天気と予報を120文字で。`, "気象キャスター", (p) =>
      setSeg("weather", { progress: p * 0.4 })
    ).then(async (txt) => {
      const url = await getVoice(txt);
      setSeg("weather", { audio: url, ready: true, progress: 100 });
    });

    newsList.forEach((it, i) => {
      const id = `n${i + 1}`;
      callAI(`${it.title}について130文字要約。`, "NHK Desk", (p) =>
        setSeg(id, { progress: p * 0.4 })
      ).then(async (sum) => {
        setNews((prev) => {
          const n = [...prev];
          if (n[i]) n[i].summary = sum;
          return n;
        });
        const url = await getVoice(
          i === 0
            ? `続いて、ニュースです。${it.title}。${sum}`
            : `次のニュースです。${it.title}。${sum}`
        );
        setSeg(id, { audio: url, ready: true, progress: 100 });
      });
    });
  };

  const playAll = async () => {
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }
    setShowStatus(true);
    const order = ["greet", "weather", "n1", "n2", "n3", "n4", "n5"];
    for (const id of order) {
      setCurrentPlayId(id);
      while (!segmentsRef.current[id].ready) {
        await new Promise((r) => setTimeout(r, 500));
        if (!showStatus) break;
      }
      const audioUrl = segmentsRef.current[id].audio;
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        await new Promise((res) => {
          audio.onended = res;
          audio.play().catch(res);
        });
      }
    }
    setCurrentPlayId(null);
  };

  useEffect(() => {
    let t;
    if (isTimerRunning && timeLeft > 0)
      t = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [isTimerRunning, timeLeft]);

  const isNorthWind =
    (weather?.winddirection >= 0 && weather?.winddirection <= 45) ||
    weather?.winddirection >= 315;
  const isSouthWind =
    weather?.winddirection >= 135 && weather?.winddirection <= 225;

  return (
    <div
      className={`fixed inset-0 flex ${isLandscape ? "flex-row" : "flex-col"} ${
        isDarkMode ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"
      } font-sans overflow-hidden`}
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {bgImage && (
            <motion.img
              key={bgImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              src={bgImage}
              className="w-full h-full object-cover blur-[2px]"
            />
          )}
        </AnimatePresence>
        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-gradient-to-b from-black/60 to-black/30"
              : "bg-gradient-to-b from-white/60 to-white/30"
          }`}
        />
      </div>

      {/* NAVIGATION (30%) */}
      <aside
        className={`${
          isLandscape ? "w-[30%] h-full border-r" : "w-full h-[30%] border-b"
        } border-white/5 bg-black/80 backdrop-blur-3xl z-50 p-6 flex flex-col justify-between overflow-hidden`}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[8px] font-black tracking-[0.5em] opacity-40 uppercase">
                Zen Dashboard v22
              </span>
              <span className="text-4xl md:text-5xl font-extralight tracking-tighter tabular-nums leading-none mt-2">
                {time.toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={playAll}
                className={`w-10 h-10 relative flex items-center justify-center rounded-full border border-white/10 ${
                  currentPlayId ? "bg-amber-500 text-black" : "bg-white/5"
                }`}
              >
                {currentPlayId ? (
                  <Volume2 size={16} className="animate-pulse" />
                ) : (
                  <Volume1 size={16} />
                )}
                {!apiKey && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black" />
                )}
              </button>
              <button
                onClick={() => setIsMemoOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
              >
                <PenLine size={16} />
              </button>
            </div>
          </div>
          <form
            action="https://www.google.com/search"
            method="get"
            target="_blank"
            className="relative"
          >
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20"
              size={12}
            />
            <input
              name="q"
              placeholder="Explore..."
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-2 pl-10 text-[11px] outline-none"
            />
          </form>
          <div className="flex gap-2">
            <a
              href="https://gemini.google.com"
              target="_blank"
              className="flex-1 flex justify-center py-2.5 bg-white/5 rounded-xl"
            >
              <Send size={14} />
            </a>
            <a
              href="https://calendar.google.com"
              target="_blank"
              className="flex-1 flex justify-center py-2.5 bg-white/5 rounded-xl"
            >
              <Calendar size={14} />
            </a>
            <a
              href="https://mail.google.com"
              target="_blank"
              className="flex-1 flex justify-center py-2.5 bg-white/5 rounded-xl"
            >
              <Mail size={14} />
            </a>
          </div>
        </div>
        <div className="flex justify-between opacity-30 pt-4 border-t border-white/5">
          <div className="flex gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle DarkMode"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={() => wallpaperInputRef.current?.click()}
              title="Change Wallpaper"
            >
              <ImageIcon size={14} />
            </button>
            <input
              type="file"
              ref={wallpaperInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleCustomWallpaper}
            />
            <button onClick={() => setIsSettingsOpen(true)} title="Settings">
              <Settings2 size={14} />
            </button>
            <button onClick={loadAllData} title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>
          <span className="text-[7px] font-black uppercase tracking-widest">
            v22.stable
          </span>
        </div>
      </aside>

      {/* MAIN CONTENT (70%) */}
      <main className="flex-grow overflow-y-auto custom-scrollbar z-10 p-6 md:p-14 space-y-12">
        {/* WEATHER SECTION */}
        <section className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="space-y-4 shrink-0">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 w-fit">
                <MapPin size={10} className="text-amber-500" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-transparent text-[10px] font-black outline-none tracking-widest uppercase cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c} className="bg-zinc-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-8xl md:text-9xl font-thin tracking-tighter tabular-nums leading-none">
                  {weather?.temperature ?? "--"}°
                </span>
                <div className="flex flex-col">
                  <span className="text-2xl font-black uppercase tracking-widest">
                    {weather
                      ? getWeatherMeta(weather.weathercode).label
                      : "読み込み中..."}
                  </span>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-xs font-bold">
                      {(weather?.windspeed / 3.6).toFixed(1)} m/s
                    </span>
                    <motion.div
                      animate={{ rotate: (weather?.winddirection ?? 0) + 180 }}
                      className={
                        isNorthWind
                          ? "text-blue-400"
                          : isSouthWind
                          ? "text-red-500"
                          : "text-slate-400"
                      }
                    >
                      <Navigation size={20} fill="currentColor" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar touch-pan-x">
              {forecast.map((f, i) => (
                <div
                  key={i}
                  className="min-w-[90px] p-5 rounded-[2.5rem] bg-black/40 border border-white/5 flex flex-col items-center gap-3 backdrop-blur-xl"
                >
                  <span className="text-[9px] font-bold opacity-30">
                    {f.hour}:00
                  </span>
                  {getWeatherMeta(f.code).icon}
                  <span className="text-base font-bold">{f.temp}°</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TIMER SECTION */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-black/50 rounded-[3rem] p-8 md:p-12 border border-white/5 backdrop-blur-3xl">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
              <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0">
                <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="opacity-10"
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="100 100"
                    strokeDashoffset={100 - (100 * timeLeft) / duration}
                    className="text-amber-500"
                    strokeLinecap="round"
                    pathLength="100"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl md:text-5xl font-thin tracking-widest tabular-nums">
                    {Math.floor(timeLeft / 60)}:
                    {(timeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div className="flex-1 w-full space-y-8">
                <div className="grid grid-cols-5 gap-2">
                  {PRESETS.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setDuration(m * 60);
                        setTimeLeft(m * 60);
                        setIsTimerRunning(false);
                      }}
                      className={`py-2.5 text-[8px] font-black rounded-xl border transition-all ${
                        duration === m * 60
                          ? "bg-amber-500 text-black border-amber-400 shadow-lg"
                          : "bg-white/5 border-white/5 opacity-40 hover:opacity-100"
                      }`}
                    >
                      {m}M
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-xl transition-transform active:scale-95"
                  >
                    {isTimerRunning ? (
                      <Pause size={24} fill="currentColor" />
                    ) : (
                      <Play size={24} fill="currentColor" className="ml-1" />
                    )}
                  </button>
                  <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group">
                    <FileAudio
                      size={18}
                      className={
                        ambientAudioUrl ? "text-amber-500" : "opacity-20"
                      }
                    />
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-30 truncate">
                      BGM Select
                    </span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) =>
                        e.target.files[0] &&
                        setAmbientAudioUrl(
                          URL.createObjectURL(e.target.files[0])
                        )
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={() => setTimeLeft(duration)}
                    className="opacity-20 hover:opacity-100 transition-opacity"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
                {ambientAudioUrl && (
                  <audio
                    src={ambientAudioUrl}
                    loop
                    autoPlay={isTimerRunning}
                    className="hidden"
                    ref={(el) => {
                      if (el)
                        isTimerRunning ? el.play().catch(() => {}) : el.pause();
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* NEWS FEED SECTION */}
        <section className="max-w-5xl mx-auto space-y-16 pb-40">
          <div className="flex items-center gap-4 opacity-20 border-b border-white/5 pb-4">
            <Newspaper size={16} />
            <span className="text-[9px] font-black uppercase tracking-[0.5em]">
              NHK News Hub
            </span>
          </div>
          <div className="grid grid-cols-1 gap-16">
            {news.map((n, i) => (
              <article key={i} className="flex gap-8 group">
                <div className="flex flex-col items-center gap-6 pt-2 shrink-0">
                  <div
                    className={`p-3 rounded-full border border-white/10 ${
                      currentPlayId === `n${i + 1}`
                        ? "bg-amber-500/20 text-amber-500"
                        : "opacity-10"
                    }`}
                  >
                    <PlayCircle size={32} />
                  </div>
                  <ProgressIndicator
                    progress={segments[`n${i + 1}`].progress}
                    isReady={segments[`n${i + 1}`].ready}
                    small
                  />
                </div>
                <div className="space-y-4 flex-1">
                  <h3
                    onClick={() => window.open(n.link, "_blank")}
                    className="text-xl md:text-2xl font-bold leading-tight cursor-pointer hover:text-amber-500 transition-colors"
                  >
                    {n.title}
                  </h3>
                  <p className="text-sm opacity-40 font-light leading-relaxed pl-6 border-l border-white/10 italic">
                    {n.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* OVERLAY: SETTINGS (API KEY) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[3rem] p-10 space-y-8 relative shadow-2xl">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="absolute top-8 right-8 opacity-40 hover:opacity-100 transition-opacity"
              >
                <X size={24} />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-amber-500">
                  <Key size={20} />
                  <h2 className="text-xl font-black uppercase tracking-widest">
                    Settings
                  </h2>
                </div>

                {/* Security Badge */}
                <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                  <ShieldCheck
                    className="text-emerald-500 shrink-0"
                    size={16}
                  />
                  <p className="text-[9px] text-emerald-200/60 leading-relaxed uppercase tracking-tight">
                    <strong className="text-emerald-400 block mb-1">
                      Local Security Active
                    </strong>
                    入力されたキーはブラウザのLocalStorageにのみ保存されます。外部サーバーへの送信、保存、ログ収集は一切行われません。
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter Gemini API Key..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pr-14 text-sm outline-none focus:border-amber-500/50 transition-colors"
                  />
                  {apiKey && (
                    <button
                      onClick={() => setApiKey("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                      title="Delete Key from LocalStorage"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    loadAllData();
                  }}
                  className="w-full bg-white text-black font-black uppercase tracking-widest py-5 rounded-2xl active:scale-95 transition-transform"
                >
                  Save & Initialize
                </button>
                <p className="text-center text-[8px] opacity-20 uppercase tracking-widest">
                  Your privacy is prioritized.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* OVERLAY: ZEN MEMO */}
        {isMemoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-zinc-950/98 p-8 md:p-24 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12 shrink-0">
              <span className="text-[10px] font-black tracking-[1em] opacity-30 uppercase">
                Zen Memo
              </span>
              <div className="flex gap-4">
                <button
                  onClick={translateMemo}
                  disabled={isTranslating}
                  className={`p-4 bg-white/5 rounded-full relative transition-all ${
                    isTranslating
                      ? "animate-spin"
                      : "opacity-40 hover:opacity-100"
                  }`}
                >
                  <ArrowLeftRight size={24} />
                  {!apiKey && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black" />
                  )}
                </button>
                <button
                  onClick={() => setIsMemoOpen(false)}
                  className="p-4 bg-white/5 rounded-full opacity-40 hover:opacity-100 transition-opacity"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="grow bg-transparent border-none text-4xl md:text-7xl font-thin focus:ring-0 resize-none leading-tight outline-none"
              placeholder="Start writing..."
              autoFocus
            />
          </motion.div>
        )}

        {/* STATUS PANEL */}
        {showStatus && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="fixed bottom-8 right-8 z-[200] w-64 bg-zinc-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4 opacity-30 text-[8px] font-black uppercase tracking-widest">
              <span>Voice Pipeline</span>
              <button onClick={() => setShowStatus(false)}>
                <X size={12} />
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(segments).map(([id, s]) => (
                <div
                  key={id}
                  className={`flex items-center justify-between transition-opacity duration-500 ${
                    currentPlayId === id
                      ? "opacity-100 scale-105 origin-left"
                      : "opacity-20"
                  }`}
                >
                  <span className="text-[9px] font-bold">{s.label}</span>
                  <ProgressIndicator
                    progress={s.progress}
                    isReady={s.ready}
                    small
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        body { font-family: 'Noto Sans JP', sans-serif; overflow: hidden; background: #000; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        select option { background: #09090b; }
      `}</style>
    </div>
  );
}
