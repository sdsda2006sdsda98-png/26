import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  CalendarHeart,
  Gift,
  Heart,
  Mail,
  Moon,
  Sparkles,
  Star,
  Sun,
  Wand2,
  X
} from "lucide-react";

const MOSCOW_TIME_ZONE = "Europe/Moscow";
// 26 мая 2026, 00:00 МСК. В UTC это 25 мая 2026, 21:00.
const BIRTHDAY = new Date("2026-05-25T21:00:00.000Z");
const BIRTHDAY_LABEL = "26 мая 2026, 00:00 МСК";

function getMoscowDateLabel(date = new Date()) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: MOSCOW_TIME_ZONE
  }).format(date);
}

// Здесь можно менять фото и подписи. Файлы положите в /public/photos/photo1.jpg ... photo6.jpg.
const photoMemories = [
  { src: "/photos/photo1.jpg", caption: "наш момент" },
  { src: "/photos/photo2.jpg", caption: "тепло" },
  { src: "/photos/photo3.jpg", caption: "улыбка" },
  { src: "/photos/photo4.jpg", caption: "маленькая история" },
  { src: "/photos/photo5.jpg", caption: "то, что хочется помнить" },
  { src: "/photos/photo6.jpg", caption: "просто мы" }
];

// Здесь можно менять события timeline.
const timelineItems = [
  "момент, когда стало тепло",
  "день, который хочется помнить",
  "смех без причины",
  "тишина, в которой было спокойно"
];

const wishCards = [
  {
    icon: Sparkles,
    title: "мягкости",
    text: "пусть рядом будет достаточно тишины, заботы и людей, с которыми можно быть собой"
  },
  {
    icon: Star,
    title: "света",
    text: "пусть каждый новый день оставляет хотя бы одну маленькую причину улыбнуться"
  },
  {
    icon: Gift,
    title: "чуда",
    text: "пусть случается больше красивых совпадений, тёплых встреч и простого счастья"
  }
];

const futureNotes = [
  "беречь себя без чувства вины",
  "выбирать спокойствие, когда мир спешит",
  "помнить, что ты уже достаточно хороша",
  "оставлять место для мечты"
];

const quietReasons = [
  "за твою улыбку, которая делает день мягче",
  "за то, как рядом с тобой становится спокойно",
  "за маленькие разговоры, которые потом долго греют",
  "за свет, который ты даже не всегда замечаешь в себе"
];

const openWhenLetters = [
  {
    title: "когда грустно",
    text: "я рядом. даже если просто молча. ты не одна, слышишь?"
  },
  {
    title: "когда устала",
    text: "можно выдохнуть. сегодня не надо быть сильной каждую минуту."
  },
  {
    title: "когда хочется улыбнуться",
    text: "вспомни что-нибудь наше. самое маленькое. оно всё равно тёплое."
  },
  {
    title: "когда нужен знак",
    text: "вот он: у тебя получится. спокойно, своим темпом, без гонки."
  }
];

const favoriteThings = [
  "как ты смеёшься",
  "как умеешь быть рядом",
  "как замечаешь маленькое",
  "как делаешь обычный день теплее",
  "как в тебе живёт столько света"
];

const extraWishes = [
  "пусть всё хорошее приходит к тебе без тревоги",
  "пусть рядом будут люди, с которыми легко дышать",
  "пусть день будет добрым к тебе",
  "пусть сердце чаще чувствует спокойствие",
  "пусть мечты не пугают, а зовут"
];

const jarNotes = [
  "я бы оставил здесь самый спокойный вечер",
  "и тот самый смех, который хочется помнить",
  "и немного тишины, где всё понятно без слов",
  "и свет, который у тебя получается дарить случайно",
  "и маленькое пожалуйста: береги себя"
];

const constellationNotes = [
  { title: "свет", text: "ты умеешь делать обычное теплее" },
  { title: "смех", text: "он правда остается в памяти" },
  { title: "рядом", text: "с тобой как-то тише внутри" },
  { title: "мягкость", text: "в тебе много бережного" },
  { title: "май", text: "пусть он будет к тебе добрым" }
];

const smoothEase = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: smoothEase }
  }
};

const softPop = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.52, ease: smoothEase }
  }
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(max-width: 640px)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const handleChange = () => setIsMobile(query.matches);

    handleChange();
    query.addEventListener?.("change", handleChange);
    return () => query.removeEventListener?.("change", handleChange);
  }, []);

  return isMobile;
}

function useCalmMotion() {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  return {
    reduceMotion,
    isMobile,
    shouldLoop: !reduceMotion && !isMobile
  };
}

function useCountdown(targetDate) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return useMemo(() => {
    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      return { isToday: true, days: "00", hours: "00", minutes: "00", seconds: "00" };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return {
      isToday: false,
      days: String(days).padStart(2, "0"),
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0")
    };
  }, [now, targetDate]);
}

function BackgroundDecor({ nightMode }) {
  const { shouldLoop } = useCalmMotion();
  const particles = useMemo(
    () =>
      Array.from({ length: shouldLoop ? 22 : 0 }, (_, index) => ({
        id: index,
        left: `${(index * 37) % 100}%`,
        delay: (index % 8) * 0.55,
        duration: 16 + (index % 7) * 1.8,
        size: 8 + (index % 4) * 5,
        symbol: ["♡", "✦", "✧", "⋆"][index % 4],
        drift: index % 2 ? 34 : -34
      })),
    [shouldLoop]
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className={`absolute inset-0 transition-colors duration-700 ${nightMode
            ? "bg-[radial-gradient(circle_at_18%_12%,rgba(244,114,182,0.22),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(251,191,36,0.16),transparent_28%),linear-gradient(135deg,#1c1718_0%,#2b2022_45%,#40302a_100%)]"
            : "bg-[radial-gradient(circle_at_18%_12%,rgba(255,214,221,0.72),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(244,208,170,0.5),transparent_28%),linear-gradient(135deg,#fffdf8_0%,#fff4f1_42%,#f7eadf_100%)]"
          }`}
      />
      <div className="noise-layer" />
      <motion.div
        animate={shouldLoop ? { scale: [1, 1.04, 1], opacity: [0.38, 0.52, 0.38] } : { opacity: 0.38 }}
        transition={shouldLoop ? { duration: 12, repeat: Infinity, ease: "easeInOut" } : undefined}
        className="mobile-soft-orb absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-rose-200/30 blur-3xl"
      />
      <motion.div
        animate={shouldLoop ? { scale: [1.03, 1, 1.03], opacity: [0.32, 0.48, 0.32] } : { opacity: 0.32 }}
        transition={shouldLoop ? { duration: 14, repeat: Infinity, ease: "easeInOut" } : undefined}
        className="mobile-soft-orb absolute bottom-[10%] right-[5%] h-80 w-80 rounded-full bg-amber-100/60 blur-3xl"
      />
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="mobile-floating-particle absolute bottom-[-12vh] text-rose-300/45 will-change-transform"
          style={{ left: particle.left, fontSize: particle.size }}
          animate={{
            y: ["0vh", "-118vh"],
            x: [0, particle.drift, particle.drift * -0.45, 0],
            rotate: [0, particle.id % 2 ? 18 : -18, 0],
            opacity: [0, 0.75, 0]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {particle.symbol}
        </motion.span>
      ))}
    </div>
  );
}

function NightToggle({ nightMode, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="fixed left-4 top-5 z-40 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 shadow-[0_14px_44px_rgba(132,93,76,0.14)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/75 sm:left-7"
      aria-label={nightMode ? "Включить светлую тему" : "Включить ночную тему"}
    >
      {nightMode ? <Sun size={15} /> : <Moon size={15} />}
      {nightMode ? "утро" : "ночь"}
    </button>
  );
}

function FloatingHeart() {
  const { reduceMotion, isMobile } = useCalmMotion();
  const [beat, setBeat] = useState(() => ({
    duration: 2.4,
    scale: 1.1,
    lift: -5,
    rotate: 0
  }));

  useEffect(() => {
    if (reduceMotion) return undefined;

    const timer = window.setInterval(() => {
      setBeat({
        duration: isMobile ? 2.8 + Math.random() * 1.2 : 2 + Math.random() * 1.2,
        scale: isMobile ? 1.025 + Math.random() * 0.035 : 1.06 + Math.random() * 0.08,
        lift: isMobile ? 0 : -3 - Math.random() * 6,
        rotate: isMobile ? 0 : -2.5 + Math.random() * 5
      });
    }, 2400);

    return () => window.clearInterval(timer);
  }, [isMobile, reduceMotion]);

  return (
    <motion.div
      className="floating-heart pointer-events-none fixed bottom-4 right-4 z-30 grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-white/50 text-rose-400 shadow-[0_18px_54px_rgba(126,91,73,0.16)] backdrop-blur-xl sm:bottom-7 sm:right-6 sm:h-16 sm:w-16"
      animate={
        reduceMotion
          ? { scale: 1 }
          : { scale: [1, beat.scale, 1], y: [0, beat.lift, 0], rotate: [0, beat.rotate, 0] }
      }
      transition={reduceMotion ? undefined : { duration: beat.duration, repeat: Infinity, ease: "easeInOut" }}
    >
      <Heart className="h-5 w-5 sm:h-7 sm:w-7" fill="currentColor" strokeWidth={1.4} />
    </motion.div>
  );
}

function ClickSparkles() {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (event.pointerType === "touch") return;

      const id = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      setBursts((current) => [...current.slice(-5), { id, x: event.clientX, y: event.clientY }]);
      window.setTimeout(() => {
        setBursts((current) => current.filter((burst) => burst.id !== id));
      }, 900);
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      <AnimatePresence>
        {bursts.map((burst) => (
          <motion.div
            key={burst.id}
            className="absolute"
            style={{ left: burst.x, top: burst.y }}
            initial={{ opacity: 1, scale: 0.4 }}
            animate={{ opacity: 0, scale: 1.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <motion.span
                key={item}
                className="absolute text-rose-300"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((item / 6) * Math.PI * 2) * 34,
                  y: Math.sin((item / 6) * Math.PI * 2) * 34,
                  opacity: 0
                }}
                transition={{ duration: 0.85, ease: "easeOut" }}
              >
                {item % 2 ? "✦" : "♡"}
              </motion.span>
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function sendAnalyticsEvent(type, payload = {}) {
  const body = JSON.stringify({
    type,
    payload,
    page: window.location.pathname,
    title: document.title,
    time: new Date().toISOString()
  });

  if (type === "exit" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
    return;
  }

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => { });
}

const CONSENT_COOKIE = "masha_cookie_consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

function getCookieValue(name) {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${encodeURIComponent(name)}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
}

function setCookieValue(name, value) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax`;
}

function useConsentAnalytics(consent) {
  useEffect(() => {
    if (consent !== "yes") return undefined;

    const sessionId =
      sessionStorage.getItem("masha-session-id") ??
      window.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random()}`;

    sessionStorage.setItem("masha-session-id", sessionId);

    sendAnalyticsEvent("visit", {
      sessionId,
      language: navigator.language,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    const handleClick = (event) => {
      const target = event.target.closest?.("button,a,[role='button'],input,textarea,select") || event.target;
      if (!target) return;

      sendAnalyticsEvent("click", {
        sessionId,
        tag: target.tagName?.toLowerCase(),
        x: Math.round(event.clientX),
        y: Math.round(event.clientY),
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        text: target.innerText?.trim().slice(0, 120) || target.getAttribute("aria-label") || "без текста"
      });
    };

    const handleExit = () => {
      sendAnalyticsEvent("exit", {
        sessionId,
        scrollY: Math.round(window.scrollY),
        durationMs: Math.round(performance.now())
      });
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("pagehide", handleExit);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("pagehide", handleExit);
    };
  }, [consent]);
}

function CookieGate({ consent, onAccept, onDecline }) {
  const { shouldLoop } = useCalmMotion();

  if (consent === "yes") return null;

  return (
    <motion.div
      className="mobile-gate fixed inset-0 z-[90] grid place-items-center px-5 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(251,113,133,0.2),transparent_30%),radial-gradient(circle_at_78%_20%,rgba(251,191,36,0.18),transparent_28%),rgba(255,250,247,0.84)] backdrop-blur-2xl" />
      <motion.div
        className="mobile-dialog relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/76 p-7 text-center shadow-[0_34px_110px_rgba(63,49,44,0.24)] backdrop-blur-2xl sm:p-10"
        initial={{ y: 26, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-full bg-rose-100 text-rose-500 shadow-[0_18px_54px_rgba(244,63,94,0.18)]"
          animate={shouldLoop ? { scale: [1, 1.06, 1], rotate: [0, -2, 2, 0] } : undefined}
          transition={shouldLoop ? { duration: 3.4, repeat: Infinity, ease: "easeInOut" } : undefined}
        >
          <Heart size={27} fill="currentColor" strokeWidth={1.4} />
        </motion.div>
        <h1 className="font-display text-5xl leading-tight text-stone-800 sm:text-6xl">
          cookie
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
          Сайт использует cookie, чтобы корректно открываться, запоминать согласие и поддерживать работу страницы.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <motion.button
            type="button"
            onClick={onAccept}
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-stone-800 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_20px_54px_rgba(63,49,44,0.24)]"
            whileHover={{ y: -3, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
          >
            разрешить
          </motion.button>
          <motion.button
            type="button"
            onClick={onDecline}
            className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/80 bg-white/54 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600 shadow-[0_16px_44px_rgba(126,91,73,0.1)]"
            whileHover={{ y: -3, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
          >
            нет
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Hero() {
  const { shouldLoop } = useCalmMotion();
  const scrollToMain = () => {
    document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" });
  };
  const todayMoscowDay = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    timeZone: MOSCOW_TIME_ZONE
  }).format(new Date());

  return (
    <section className="hero-section relative flex min-h-screen items-center px-5 py-24 sm:px-8">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="font-display text-[clamp(3.35rem,10vw,8.4rem)] leading-[0.9] text-stone-800">
            Маша,
            <span className="block text-rose-400">с 20-летием 🤍</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-stone-600 sm:text-xl">
            26.05.2026 — день, который хочется запомнить
          </p>
          <p className="mt-4 max-w-xl text-base leading-8 text-stone-500">
            Пусть сегодня будет тихо, светло и по-настоящему тепло.
          </p>
          <button
            type="button"
            onClick={scrollToMain}
            className="mobile-primary-action mt-10 inline-flex items-center gap-3 rounded-full bg-stone-800 px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_22px_60px_rgba(63,49,44,0.28)] transition hover:-translate-y-1 hover:bg-stone-700"
          >
            Открыть
            <Sparkles size={17} />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.78, delay: 0.16, ease: smoothEase }}
          className="hero-card relative mx-auto aspect-[4/5] w-full max-w-[420px]"
        >
          <div className="absolute inset-4 rounded-[2.2rem] bg-gradient-to-br from-white/80 via-rose-50/72 to-amber-50/72 shadow-[0_35px_100px_rgba(129,93,80,0.18)] backdrop-blur-2xl" />
          <div className="absolute inset-0 rounded-[2.8rem] border border-white/70 bg-white/30 p-5 shadow-inner">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[2.1rem] border border-white/70 bg-[linear-gradient(155deg,rgba(255,255,255,0.78),rgba(255,234,229,0.62),rgba(244,216,181,0.42))] p-7">
              <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-rose-200/45 blur-2xl" />
              <div className="absolute -bottom-16 -left-12 h-52 w-52 rounded-full bg-amber-100/75 blur-2xl" />
              <motion.div
                animate={shouldLoop ? { rotate: [0, 5, -4, 0], scale: [1, 1.04, 1] } : undefined}
                transition={shouldLoop ? { duration: 6.2, repeat: Infinity, ease: "easeInOut" } : undefined}
                className="relative text-rose-300"
              >
                <Sparkles size={34} strokeWidth={1.4} />
              </motion.div>
              <div className="relative">
                <p className="font-display text-6xl text-stone-800">{todayMoscowDay}</p>
                <p className="mt-4 text-sm uppercase tracking-[0.24em] text-stone-500">may / twenty six</p>
              </div>
              <p className="relative max-w-[16rem] text-sm leading-7 text-stone-600">
                Нежная страница о маленьких моментах, которые остаются светом.
              </p>
              <div className="relative flex items-center justify-between rounded-2xl border border-white/70 bg-white/45 px-4 py-3 text-xs uppercase tracking-[0.18em] text-stone-500">
                <span>тепло</span>
                <Heart size={16} className="text-rose-400" />
                <span>память</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Countdown() {
  const countdown = useCountdown(BIRTHDAY);
  const units = [
    ["дни", countdown.days],
    ["часы", countdown.hours],
    ["минуты", countdown.minutes],
    ["секунды", countdown.seconds]
  ];

  return (
    <motion.section
      id="main-content"
      className="mx-auto max-w-6xl px-5 py-24 sm:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={fadeUp}
    >
      <div className="mb-10 flex items-center gap-3 text-stone-500">
        <CalendarHeart size={22} className="text-rose-400" />
        <div>
          <span className="block text-sm uppercase tracking-[0.22em]">обратный отсчёт</span>
          <span className="mt-2 block text-sm text-stone-500">до {BIRTHDAY_LABEL}</span>
        </div>
      </div>
      {countdown.isToday ? (
        <div className="rounded-[2rem] border border-white/75 bg-white/52 p-8 text-center font-display text-4xl text-stone-800 shadow-[0_24px_80px_rgba(126,91,73,0.12)] backdrop-blur-xl sm:p-12">
          Сегодня твой день. С днём рождения 🤍
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {units.map(([label, value]) => (
            <motion.div
              key={label}
              whileHover={{ y: -8, scale: 1.015 }}
              className="rounded-[1.65rem] border border-white/75 bg-white/48 p-6 text-center shadow-[0_24px_70px_rgba(126,91,73,0.13)] backdrop-blur-xl sm:p-8"
            >
              <div className="font-display text-5xl text-stone-800 sm:text-7xl">{value}</div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

function PhotoCard({ memory, index, onOpen }) {
  const [failed, setFailed] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={() => onOpen({ ...memory, failed })}
      className="photo-card group relative aspect-[4/5] overflow-hidden rounded-[1.6rem] border border-white/75 bg-white/45 text-left shadow-[0_22px_70px_rgba(126,91,73,0.12)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.06 }}
      whileHover={{ y: -10, rotateX: 3, rotateY: -3 }}
    >
      {!failed ? (
        <img
          src={memory.src}
          alt={memory.caption}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.92),transparent_28%),linear-gradient(145deg,#fff8f4,#ffdbe3_45%,#f4d7b8)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-white/10" />
      <span className="absolute bottom-5 left-5 right-5 font-display text-2xl text-white drop-shadow">
        {memory.caption}
      </span>
    </motion.button>
  );
}

function PhotoMemories() {
  const [activePhoto, setActivePhoto] = useState(null);

  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <h2 className="font-display text-5xl text-stone-800 sm:text-6xl">наши кадры</h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
          К ним хочется возвращаться просто так.
        </p>
      </motion.div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {photoMemories.map((memory, index) => (
          <PhotoCard key={memory.src} memory={memory} index={index} onOpen={setActivePhoto} />
        ))}
      </div>

      <AnimatePresence>
        {activePhoto && (
          <Lightbox photo={activePhoto} onClose={() => setActivePhoto(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

function Lightbox({ photo, onClose }) {
  return (
    <motion.div
      className="mobile-overlay fixed inset-0 z-50 flex items-center justify-center bg-stone-900/35 p-5 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="mobile-lightbox relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/65 bg-white/70 p-4 shadow-[0_35px_100px_rgba(55,40,34,0.28)]"
        initial={{ y: 24, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 24, scale: 0.96, opacity: 0 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-10 rounded-full bg-white/80 p-3 text-stone-700 shadow-lg backdrop-blur transition hover:scale-105"
          aria-label="Закрыть фото"
        >
          <X size={19} />
        </button>
        {photo.failed ? (
          <div className="aspect-[16/10] rounded-[1.45rem] bg-[linear-gradient(135deg,#fff8f4,#ffdbe3,#f4d7b8)]" />
        ) : (
          <img src={photo.src} alt={photo.caption} className="mobile-lightbox-image max-h-[74vh] w-full rounded-[1.45rem] object-cover" />
        )}
        <p className="px-2 pt-5 text-center font-display text-3xl text-stone-800">{photo.caption}</p>
      </motion.div>
    </motion.div>
  );
}

function Timeline() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
      <motion.h2
        className="text-center font-display text-5xl text-stone-800 sm:text-6xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        маленькие моменты
      </motion.h2>
      <div className="relative mt-16">
        <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-rose-200 via-stone-300/70 to-transparent sm:left-1/2" />
        {timelineItems.map((item, index) => (
          <motion.div
            key={item}
            className={`relative mb-10 flex ${index % 2 === 0 ? "sm:justify-start" : "sm:justify-end"}`}
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75, delay: index * 0.08 }}
          >
            <div className="absolute left-[9px] top-6 h-4 w-4 rounded-full border border-white bg-rose-300 shadow-[0_0_0_8px_rgba(255,255,255,0.45)] sm:left-1/2 sm:-ml-2" />
            <div className="ml-12 w-full rounded-[1.5rem] border border-white/75 bg-white/48 p-6 shadow-[0_22px_70px_rgba(126,91,73,0.11)] backdrop-blur-xl sm:ml-0 sm:w-[44%]">
              <p className="font-display text-2xl text-stone-800">{item}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function MessageSection() {
  return (
    <motion.section
      className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={fadeUp}
    >
      <div className="rounded-[2rem] border border-white/75 bg-white/50 p-8 shadow-[0_28px_90px_rgba(126,91,73,0.12)] backdrop-blur-xl sm:p-12">
        <p className="text-xl leading-9 text-stone-700 sm:text-2xl sm:leading-10">
          Иногда самые важные люди остаются в памяти не громкими словами, а маленькими моментами.
          <br />
          Пусть этот день будет для тебя спокойным, светлым и тёплым.
          <br />
          Я правда хочу, чтобы у тебя всё было хорошо.
        </p>
      </div>
    </motion.section>
  );
}

function WishGarden() {
  const [activeWish, setActiveWish] = useState(0);
  const ActiveIcon = wishCards[activeWish].icon;

  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <motion.div
        className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
      >
        <div>
          <h2 className="font-display text-5xl leading-tight text-stone-800 sm:text-6xl">
            сад пожеланий
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">
            Ничего громкого. Только то, что правда хочется оставить рядом.
          </p>
          <div className="mt-9 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {wishCards.map((wish, index) => {
              const Icon = wish.icon;
              const isActive = index === activeWish;

              return (
                <motion.button
                  key={wish.title}
                  type="button"
                  onClick={() => setActiveWish(index)}
                  aria-label={`Пожелание: ${wish.title}`}
                  className={`group flex items-center gap-4 rounded-[1.35rem] border px-5 py-4 text-left shadow-[0_18px_54px_rgba(126,91,73,0.1)] backdrop-blur-xl transition ${isActive
                      ? "border-rose-200 bg-white/78 text-stone-800"
                      : "border-white/70 bg-white/42 text-stone-600 hover:-translate-y-0.5 hover:bg-white/62"
                    }`}
                  whileHover={{ y: -4, scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${isActive ? "bg-rose-100 text-rose-500" : "bg-white/70 text-stone-500"
                      }`}
                  >
                    <Icon size={19} strokeWidth={1.7} />
                  </span>
                  <span className="font-display text-2xl">{wish.title}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <motion.div
          key={activeWish}
          className="relative overflow-hidden rounded-[2.4rem] border border-white/75 bg-white/58 p-7 shadow-[0_34px_100px_rgba(126,91,73,0.14)] backdrop-blur-2xl sm:p-10"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full bg-rose-200/45 blur-3xl" />
          <div className="absolute -bottom-16 left-8 h-48 w-48 rounded-full bg-amber-100/70 blur-3xl" />
          <div className="relative">
            <div className="mb-12 flex items-center justify-between">
              <div className="grid h-16 w-16 place-items-center rounded-[1.4rem] bg-stone-800 text-white shadow-[0_18px_46px_rgba(63,49,44,0.24)]">
                <ActiveIcon size={26} strokeWidth={1.6} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
                wish {String(activeWish + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="font-display text-4xl leading-tight text-stone-800 sm:text-6xl">
              {wishCards[activeWish].text}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function QuietReasons() {
  const { shouldLoop } = useCalmMotion();

  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <motion.div
        className="mb-12 max-w-3xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <h2 className="font-display text-5xl leading-tight text-stone-800 sm:text-6xl">
          тихие причины
        </h2>
        <p className="mt-6 text-lg leading-8 text-stone-600">
          Я бы мог сказать больше, но пусть останется вот так.
        </p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-2">
        {quietReasons.map((reason, index) => (
          <motion.div
            key={reason}
            className="group relative min-h-[180px] overflow-hidden rounded-[2rem] border border-white/75 bg-white/48 p-7 shadow-[0_24px_74px_rgba(126,91,73,0.11)] backdrop-blur-xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={softPop}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -8, rotate: index % 2 ? 0.6 : -0.6 }}
          >
            <motion.div
              className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-rose-200/35 blur-2xl"
              animate={shouldLoop ? { scale: [1, 1.12, 1], opacity: [0.38, 0.58, 0.38] } : undefined}
              transition={shouldLoop ? { duration: 6 + index, repeat: Infinity, ease: "easeInOut" } : undefined}
            />
            <span className="relative font-display text-4xl text-rose-300">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="relative mt-8 font-display text-3xl leading-tight text-stone-800 sm:text-4xl">
              {reason}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function OpenWhenLetters() {
  const [activeLetter, setActiveLetter] = useState(null);

  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <motion.div
        className="mb-12 max-w-3xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <h2 className="font-display text-5xl leading-tight text-stone-800 sm:text-6xl">
          открой, когда...
        </h2>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {openWhenLetters.map((letter, index) => {
          const isOpen = activeLetter === index;

          return (
            <motion.button
              key={letter.title}
              type="button"
              onClick={() => setActiveLetter(isOpen ? null : index)}
              className={`relative min-h-[220px] overflow-hidden rounded-[2rem] border p-6 text-left shadow-[0_24px_74px_rgba(126,91,73,0.11)] backdrop-blur-xl transition ${isOpen
                  ? "border-rose-200 bg-white/78"
                  : "border-white/75 bg-white/46 hover:bg-white/64"
                }`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={softPop}
              whileHover={{ y: -8, rotate: index % 2 ? 0.8 : -0.8 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-200/30 blur-2xl" />
              <Mail className="relative text-rose-400" size={26} strokeWidth={1.5} />
              <p className="relative mt-10 font-display text-3xl leading-tight text-stone-800">
                {letter.title}
              </p>
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.p
                    key="open"
                    className="relative mt-6 text-base leading-7 text-stone-600"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                  >
                    {letter.text}
                  </motion.p>
                ) : (
                  <motion.div
                    key="closed"
                    className="absolute bottom-5 left-6 right-6 h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

function FavoriteThings() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-24 sm:px-8">
      <motion.div
        className="relative overflow-hidden rounded-[2.4rem] border border-white/75 bg-white/52 p-7 shadow-[0_34px_100px_rgba(126,91,73,0.13)] backdrop-blur-2xl sm:p-10 lg:p-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
      >
        <div className="absolute -right-16 top-10 h-56 w-56 rounded-full bg-rose-200/35 blur-3xl" />
        <h2 className="relative font-display text-5xl leading-tight text-stone-800 sm:text-6xl">
          мне в тебе нравится
        </h2>
        <div className="relative mt-10 grid gap-4">
          {favoriteThings.map((thing, index) => (
            <motion.div
              key={thing}
              className="flex items-center gap-4 rounded-[1.4rem] border border-white/70 bg-white/42 p-5"
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              whileHover={{ x: 8 }}
            >
              <Heart className="shrink-0 text-rose-400" size={18} fill="currentColor" />
              <p className="font-display text-2xl text-stone-800 sm:text-3xl">{thing}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function WarmJar() {
  const { shouldLoop } = useCalmMotion();
  const [noteIndex, setNoteIndex] = useState(0);

  const showNextNote = () => {
    setNoteIndex((current) => (current + 1) % jarNotes.length);
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <motion.div
        className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
      >
        <div className="warm-jar-visual relative min-h-[360px] overflow-hidden rounded-[2.4rem] border border-white/75 bg-white/48 p-8 shadow-[0_34px_100px_rgba(126,91,73,0.12)] backdrop-blur-xl sm:p-10">
          <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full bg-rose-200/35 blur-3xl" />
          <div className="absolute bottom-8 left-8 h-24 w-24 rounded-full bg-amber-100/75 blur-2xl" />
          <div className="relative mx-auto flex max-w-sm flex-col items-center">
            <motion.div
              className="warm-jar relative h-72 w-56 rounded-b-[4rem] rounded-t-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,232,238,0.48),rgba(251,230,195,0.34))] shadow-[inset_0_0_38px_rgba(255,255,255,0.7),0_24px_70px_rgba(126,91,73,0.12)]"
              animate={shouldLoop ? { y: [0, -4, 0] } : undefined}
              transition={shouldLoop ? { duration: 7, repeat: Infinity, ease: "easeInOut" } : undefined}
            >
              <div className="absolute left-1/2 top-[-18px] h-10 w-32 -translate-x-1/2 rounded-full border border-white/80 bg-white/70 shadow-[0_12px_28px_rgba(126,91,73,0.1)]" />
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <motion.span
                  key={item}
                  className="absolute grid h-10 w-10 place-items-center rounded-full bg-white/68 text-rose-400 shadow-[0_10px_30px_rgba(126,91,73,0.1)]"
                  style={{
                    left: `${20 + ((item * 23) % 54)}%`,
                    top: `${34 + ((item * 17) % 43)}%`
                  }}
                  animate={
                    shouldLoop
                      ? { y: [0, item % 2 ? 5 : -5, 0], rotate: [0, item % 2 ? 5 : -5, 0] }
                      : undefined
                  }
                  transition={shouldLoop ? { duration: 5.6 + item * 0.25, repeat: Infinity, ease: "easeInOut" } : undefined}
                >
                  <Heart size={15} fill="currentColor" strokeWidth={1.4} />
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-5xl leading-tight text-stone-800 sm:text-6xl">
            баночка тепла
          </h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={noteIndex}
              className="warm-note mt-8 rounded-[2rem] border border-white/75 bg-white/52 p-7 font-display text-3xl leading-tight text-stone-800 shadow-[0_24px_74px_rgba(126,91,73,0.11)] backdrop-blur-xl sm:p-9 sm:text-5xl"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              {jarNotes[noteIndex]}
            </motion.p>
          </AnimatePresence>
          <motion.button
            type="button"
            onClick={showNextNote}
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-stone-800 px-7 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_22px_60px_rgba(63,49,44,0.24)] transition hover:bg-stone-700"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            вытянуть
            <Sparkles size={17} />
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}

function TinyConstellation() {
  const [activeStar, setActiveStar] = useState(0);

  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <motion.div
        className="constellation-panel relative overflow-hidden rounded-[2.4rem] border border-white/75 bg-[radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.76),transparent_34%),linear-gradient(135deg,rgba(255,246,243,0.68),rgba(255,225,232,0.48),rgba(244,216,181,0.34))] p-7 shadow-[0_34px_100px_rgba(126,91,73,0.13)] backdrop-blur-xl sm:p-10 lg:p-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
      >
        <div className="absolute -right-16 top-10 h-56 w-56 rounded-full bg-amber-100/70 blur-3xl" />
        <div className="absolute -bottom-16 left-8 h-48 w-48 rounded-full bg-rose-200/35 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <h2 className="font-display text-5xl leading-tight text-stone-800 sm:text-6xl">
              маленькое созвездие
            </h2>
            <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {constellationNotes.map((star, index) => {
                const isActive = activeStar === index;

                return (
                  <motion.button
                    key={star.title}
                    type="button"
                    onClick={() => setActiveStar(index)}
                    className={`flex min-h-20 items-center justify-center gap-2 rounded-[1.35rem] border px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] shadow-[0_16px_50px_rgba(126,91,73,0.08)] transition ${isActive
                        ? "border-rose-200 bg-stone-800 text-white"
                        : "border-white/70 bg-white/46 text-stone-600 hover:bg-white/68"
                      }`}
                    whileHover={{ y: -4, scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Star size={16} fill={isActive ? "currentColor" : "none"} />
                    {star.title}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStar}
              className="constellation-message relative min-h-[260px] overflow-hidden rounded-[2rem] border border-white/75 bg-white/52 p-8 shadow-[0_24px_80px_rgba(126,91,73,0.12)] backdrop-blur-xl sm:p-10"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.98 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute right-8 top-8 text-rose-300/60">
                <Star size={56} strokeWidth={1.2} />
              </div>
              <p className="relative font-display text-4xl leading-tight text-stone-800 sm:text-6xl">
                {constellationNotes[activeStar].text}
              </p>
              <div className="relative mt-10 h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
              <p className="relative mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
                {String(activeStar + 1).padStart(2, "0")} / {String(constellationNotes.length).padStart(2, "0")}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}

function RandomWish() {
  const { shouldLoop } = useCalmMotion();
  const [wishIndex, setWishIndex] = useState(0);

  const showNextWish = () => {
    setWishIndex((current) => (current + 1) % extraWishes.length);
  };

  return (
    <section className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
      <motion.div
        className="relative overflow-hidden rounded-[2.4rem] border border-white/75 bg-[linear-gradient(135deg,rgba(255,255,255,0.74),rgba(255,232,238,0.58),rgba(251,230,195,0.44))] p-8 shadow-[0_34px_100px_rgba(126,91,73,0.13)] backdrop-blur-2xl sm:p-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <motion.div
          className="mx-auto mb-8 grid h-16 w-16 place-items-center rounded-full bg-stone-800 text-white shadow-[0_18px_46px_rgba(63,49,44,0.24)]"
          animate={shouldLoop ? { rotate: [0, 5, -5, 0] } : undefined}
          transition={shouldLoop ? { duration: 6.4, repeat: Infinity, ease: "easeInOut" } : undefined}
        >
          <Sparkles size={25} strokeWidth={1.6} />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.p
            key={wishIndex}
            className="font-display text-4xl leading-tight text-stone-800 sm:text-6xl"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {extraWishes[wishIndex]}
          </motion.p>
        </AnimatePresence>
        <motion.button
          type="button"
          onClick={showNextWish}
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-stone-800 px-7 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_22px_60px_rgba(63,49,44,0.24)] transition hover:bg-stone-700"
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ещё одно
          <Sparkles size={17} />
        </motion.button>
      </motion.div>
    </section>
  );
}

function FutureLetter() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <motion.div
        className="relative overflow-hidden rounded-[2.4rem] border border-white/75 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,237,232,0.58),rgba(244,216,181,0.36))] p-7 shadow-[0_34px_100px_rgba(126,91,73,0.13)] backdrop-blur-2xl sm:p-10 lg:p-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
      >
        <div className="absolute right-8 top-8 hidden text-rose-200/70 sm:block">
          <Wand2 size={86} strokeWidth={1.1} />
        </div>
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <div className="mb-8 inline-grid h-14 w-14 place-items-center rounded-2xl bg-white/76 text-rose-500 shadow-[0_16px_46px_rgba(126,91,73,0.12)]">
              <Mail size={23} strokeWidth={1.6} />
            </div>
            <h2 className="font-display text-5xl leading-tight text-stone-800 sm:text-6xl">
              письмо в будущий день
            </h2>
            <p className="mt-6 text-lg leading-8 text-stone-600">
              На потом. На случай, если вдруг забудется самое важное.
            </p>
          </div>

          <div className="grid gap-4">
            {futureNotes.map((note, index) => (
              <motion.div
                key={note}
                className="flex items-start gap-4 rounded-[1.4rem] border border-white/70 bg-white/46 p-5 shadow-[0_16px_50px_rgba(126,91,73,0.08)]"
                initial={{ opacity: 0, x: 22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <span className="mt-1 font-display text-2xl text-rose-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-lg leading-8 text-stone-700">{note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function TimeCapsule() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-3 rounded-full border border-white/75 bg-white/55 px-7 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-stone-700 shadow-[0_22px_70px_rgba(126,91,73,0.12)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/75"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Heart size={17} className="text-rose-400" />
        Открыть маленькое послание
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-overlay fixed inset-0 z-50 flex items-center justify-center bg-stone-900/35 p-5 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="mobile-dialog relative max-w-xl rounded-[2rem] border border-white/70 bg-white/76 p-8 text-center shadow-[0_35px_100px_rgba(55,40,34,0.28)] sm:p-12"
              initial={{ y: 26, scale: 0.94, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 26, scale: 0.94, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-5 top-5 rounded-full bg-white/80 p-3 text-stone-700 shadow-lg transition hover:scale-105"
                aria-label="Закрыть послание"
              >
                <X size={18} />
              </button>
              <Heart className="mx-auto mb-6 text-rose-400" size={34} strokeWidth={1.5} />
              <div className="final-message text-stone-800">
                <p>С днем рождения тебя.</p>
                <p>
                  Я долго думал, что написать, и понял, что не хочу каких-то громких слов. Просто хочу, чтобы ты знала — все, что было между нами, для меня по-настоящему важно. Я до сих пор с теплом вспоминаю наши разговоры, моменты, смех, даже мелочи, которые тогда казались обычными.
                </p>
                <p>
                  Ты очень много значишь для меня. И, наверное, часть меня все еще верит, что люди, которым было так хорошо вместе, не встречаются случайно.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function FinalSection() {
  return (
    <motion.footer
      className="final-section px-5 py-32 text-center sm:px-8"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9 }}
    >
      <p className="font-display text-5xl text-stone-800 sm:text-7xl">Береги себя 🤍</p>
      <p className="mt-5 text-sm uppercase tracking-[0.28em] text-stone-500">26.05.2026</p>
    </motion.footer>
  );
}

export default function App() {
  const [nightMode, setNightMode] = useState(true);
  const [analyticsConsent, setAnalyticsConsent] = useState(() => getCookieValue(CONSENT_COOKIE));
  const isMobile = useIsMobile();
  const siteUnlocked = analyticsConsent === "yes";
  useConsentAnalytics(analyticsConsent);

  const acceptAnalytics = () => {
    setCookieValue(CONSENT_COOKIE, "yes");
    setAnalyticsConsent("yes");
  };

  const declineAnalytics = () => {
    window.location.replace("about:blank");
  };

  return (
    <div
      className={`min-h-screen overflow-x-hidden transition-colors duration-700 ${nightMode ? "night-mode text-stone-100" : "text-stone-800"
        }`}
    >
      <MotionConfig reducedMotion={isMobile ? "always" : "user"}>
        <div className="fixed left-0 top-0 z-[60] h-1 w-full bg-gradient-to-r from-rose-300 via-orange-200 to-amber-200" />
        <BackgroundDecor nightMode={nightMode} />
        <CookieGate
          consent={analyticsConsent}
          onAccept={acceptAnalytics}
          onDecline={declineAnalytics}
        />
        {siteUnlocked && (
          <>
            <NightToggle nightMode={nightMode} onToggle={() => setNightMode((current) => !current)} />
            <FloatingHeart />
            {!isMobile && <ClickSparkles />}
            <Hero />
            <main>
              <Countdown />
              <PhotoMemories />
              <Timeline />
              <MessageSection />
              <OpenWhenLetters />
              <WishGarden />
              <QuietReasons />
              <FavoriteThings />
              <WarmJar />
              <TinyConstellation />
              <RandomWish />
              <FutureLetter />
              <TimeCapsule />
              <FinalSection />
            </main>
          </>
        )}
      </MotionConfig>
    </div>
  );
}

