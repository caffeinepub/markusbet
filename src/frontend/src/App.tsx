import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  useGetMatchOfDayPredictions,
  useGetParlayPredictions,
  useGetSinglePredictions,
  useMatchHistory,
} from "./hooks/useQueries";
import type { MatchResult, Prediction } from "./hooks/useQueries";

// --- HOT Badge ---
function HotBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        background: "oklch(0.65 0.22 25 / 0.18)",
        border: "1px solid oklch(0.72 0.22 25 / 0.65)",
        borderRadius: "0.35rem",
        padding: "0.18rem 0.55rem",
        color: "oklch(0.88 0.20 35)",
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 900,
        fontSize: "0.68rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase" as const,
        animation: "hot-pulse 1.8s ease-in-out infinite",
        boxShadow: "0 0 8px oklch(0.72 0.22 25 / 0.35)",
      }}
    >
      🔥 HOT
    </span>
  );
}

// --- History Stats Banner ---
function HistoryStatsBanner({ history }: { history: MatchResult[] }) {
  if (!history || history.length === 0) return null;
  const wins = history.filter((h) => h.result.toLowerCase() === "win").length;
  const losses = history.filter(
    (h) => h.result.toLowerCase() === "loss",
  ).length;
  const voids = history.filter((h) => h.result.toLowerCase() === "void").length;
  const total = wins + losses; // voids don't count for %
  const winPct = total > 0 ? Math.round((wins / total) * 100) : 0;
  const recentEntries = [...history].slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      className="mb-5 rounded-xl overflow-hidden"
      style={{
        background: "oklch(0.15 0.02 265)",
        border: "1px solid oklch(0.28 0.025 265)",
      }}
    >
      {/* Top accent */}
      <div
        style={{
          height: 2,
          background:
            "linear-gradient(90deg, oklch(0.82 0.22 142), oklch(0.88 0.18 85 / 0.3), transparent)",
        }}
      />
      <div className="px-4 py-3 flex items-center gap-4 flex-wrap">
        {/* Win rate */}
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "1.6rem",
              lineHeight: 1,
              color:
                winPct >= 60
                  ? "oklch(0.82 0.22 142)"
                  : winPct >= 40
                    ? "oklch(0.82 0.18 85)"
                    : "oklch(0.72 0.18 25)",
            }}
          >
            {winPct}%
          </span>
          <span
            style={{
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.10em",
              color: "oklch(0.45 0.02 265)",
              fontFamily: "'Barlow Condensed', sans-serif",
              lineHeight: 1.2,
            }}
          >
            ΠΟΣΟΣΤΟ
            <br />
            ΕΠΙΤΥΧΙΑΣ
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 32,
            background: "oklch(0.26 0.025 265)",
            flexShrink: 0,
          }}
        />

        {/* WIN count */}
        <div className="flex items-center gap-1.5">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "oklch(0.82 0.22 142 / 0.15)",
              border: "1px solid oklch(0.82 0.22 142 / 0.45)",
              borderRadius: "0.4rem",
              padding: "0.25rem 0.7rem",
              color: "oklch(0.82 0.22 142)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "0.85rem",
              letterSpacing: "0.06em",
            }}
          >
            ✅ WIN {wins}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "oklch(0.65 0.22 25 / 0.12)",
              border: "1px solid oklch(0.65 0.22 25 / 0.40)",
              borderRadius: "0.4rem",
              padding: "0.25rem 0.7rem",
              color: "oklch(0.75 0.15 25)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "0.85rem",
              letterSpacing: "0.06em",
            }}
          >
            ❌ LOSS {losses}
          </span>
          {voids > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "oklch(0.40 0.02 265 / 0.15)",
                border: "1px solid oklch(0.40 0.02 265 / 0.35)",
                borderRadius: "0.4rem",
                padding: "0.25rem 0.7rem",
                color: "oklch(0.55 0.02 265)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: "0.85rem",
                letterSpacing: "0.06em",
              }}
            >
              ⬜ VOID {voids}
            </span>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 32,
            background: "oklch(0.26 0.025 265)",
            flexShrink: 0,
          }}
        />

        {/* Recent streak mini chips */}
        <div className="flex items-center gap-1 flex-wrap">
          <span
            style={{
              fontSize: "0.60rem",
              color: "oklch(0.42 0.02 265)",
              fontWeight: 600,
              letterSpacing: "0.08em",
              marginRight: 2,
            }}
          >
            ΤΕΛΕΥΤΑΙΑ
          </span>
          {recentEntries.map((h, i) => {
            const r = h.result.toLowerCase();
            return (
              <span
                key={`recent-${String(h.id)}-${i}`}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "0.25rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.58rem",
                  fontWeight: 900,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  background:
                    r === "win"
                      ? "oklch(0.82 0.22 142 / 0.20)"
                      : r === "loss"
                        ? "oklch(0.65 0.22 25 / 0.18)"
                        : "oklch(0.28 0.02 265)",
                  color:
                    r === "win"
                      ? "oklch(0.82 0.22 142)"
                      : r === "loss"
                        ? "oklch(0.75 0.15 25)"
                        : "oklch(0.50 0.02 265)",
                  border: `1px solid ${r === "win" ? "oklch(0.82 0.22 142 / 0.40)" : r === "loss" ? "oklch(0.65 0.22 25 / 0.35)" : "oklch(0.32 0.025 265)"}`,
                }}
              >
                {r === "win" ? "W" : r === "loss" ? "L" : "V"}
              </span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// --- Utility helpers ---
function getPredictionType(prediction: string): "win" | "draw" | "loss" {
  const lower = prediction.toLowerCase();
  if (lower.includes("draw")) return "draw";
  if (lower.includes("away")) return "loss";
  return "win";
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 70) return "oklch(0.82 0.22 142)";
  if (confidence >= 40) return "oklch(0.80 0.18 85)";
  return "oklch(0.65 0.22 25)";
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 70) return "High";
  if (confidence >= 40) return "Medium";
  return "Low";
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getLeagueEmoji(league: string): string {
  const lower = league.toLowerCase();
  if (lower.includes("premier") || lower.includes("england")) return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
  if (lower.includes("la liga") || lower.includes("spain")) return "🇪🇸";
  if (lower.includes("bundesliga") || lower.includes("germany")) return "🇩🇪";
  if (lower.includes("serie a") || lower.includes("italy")) return "🇮🇹";
  if (lower.includes("ligue") || lower.includes("france")) return "🇫🇷";
  if (lower.includes("champions")) return "⭐";
  if (lower.includes("europa")) return "🌍";
  if (
    lower.includes("greek") ||
    lower.includes("super league") ||
    lower.includes("greece")
  )
    return "🇬🇷";
  return "⚽";
}

// --- Countdown Timer ---
function calcSecondsLeft(matchDate: string): number | null {
  if (!matchDate || matchDate.trim() === "") return null;
  const target = new Date(matchDate).getTime();
  if (Number.isNaN(target)) return null;
  return Math.floor((target - Date.now()) / 1000);
}

function useCountdown(matchDate: string) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(() =>
    calcSecondsLeft(matchDate),
  );

  useEffect(() => {
    setSecondsLeft(calcSecondsLeft(matchDate));
    const id = setInterval(() => {
      setSecondsLeft(calcSecondsLeft(matchDate));
    }, 1000);
    return () => clearInterval(id);
  }, [matchDate]);

  return secondsLeft;
}

type CountdownStatus = "live" | "soon" | "upcoming" | "finished";

function getCountdownStatus(secondsLeft: number | null): CountdownStatus {
  if (secondsLeft === null) return "upcoming";
  if (secondsLeft < 0 && secondsLeft > -5400) return "live"; // within 90 min after kickoff
  if (secondsLeft <= 0) return "finished";
  if (secondsLeft <= 10800) return "soon"; // <= 3 hours
  return "upcoming";
}

function CountdownTimer({ matchDate }: { matchDate: string }) {
  const secondsLeft = useCountdown(matchDate);
  const status = getCountdownStatus(secondsLeft);

  const colors: Record<
    CountdownStatus,
    { bg: string; border: string; text: string; dot: string }
  > = {
    live: {
      bg: "oklch(0.65 0.22 25 / 0.15)",
      border: "oklch(0.65 0.22 25 / 0.55)",
      text: "oklch(0.78 0.18 25)",
      dot: "oklch(0.72 0.22 25)",
    },
    soon: {
      bg: "oklch(0.80 0.18 85 / 0.12)",
      border: "oklch(0.80 0.18 85 / 0.50)",
      text: "oklch(0.85 0.18 85)",
      dot: "oklch(0.82 0.20 85)",
    },
    upcoming: {
      bg: "oklch(0.82 0.22 142 / 0.10)",
      border: "oklch(0.82 0.22 142 / 0.40)",
      text: "oklch(0.82 0.22 142)",
      dot: "oklch(0.82 0.22 142)",
    },
    finished: {
      bg: "oklch(0.22 0.025 265 / 0.6)",
      border: "oklch(0.32 0.025 265)",
      text: "oklch(0.48 0.02 265)",
      dot: "oklch(0.36 0.02 265)",
    },
  };

  const c = colors[status];

  function formatTime(secs: number): string {
    const abs = Math.abs(secs);
    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    const s = abs % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
    if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
    return `${s}s`;
  }

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        display: "inline-flex",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.dot,
          display: "inline-block",
          flexShrink: 0,
          animation:
            status === "live" || status === "soon"
              ? "pulse-green 1.5s infinite"
              : "none",
        }}
      />
      <span
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: "0.70rem",
          letterSpacing: "0.08em",
          color: c.text,
        }}
      >
        {status === "live"
          ? "⚽ LIVE"
          : status === "finished"
            ? "ΤΕΛΟΣ"
            : secondsLeft !== null
              ? formatTime(secondsLeft)
              : "—"}
      </span>
    </div>
  );
}

// --- Prediction Card ---
interface PredictionCardProps {
  prediction: Prediction;
  index: number;
  isParlay?: boolean;
  isMatchOfDay?: boolean;
}

function PredictionCard({
  prediction,
  index,
  isParlay = false,
  isMatchOfDay = false,
}: PredictionCardProps) {
  const predType = getPredictionType(prediction.prediction);
  const confidence = Number(prediction.confidence);
  const confidenceColor = getConfidenceColor(confidence);
  const confidenceLabel = getConfidenceLabel(confidence);
  const parlayAccent = "oklch(0.88 0.18 85)";
  const matchOfDayAccent = "oklch(0.82 0.18 45)";

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="glass-surface rounded-xl overflow-hidden transition-all duration-300 group"
      style={
        isMatchOfDay
          ? {
              boxShadow:
                "0 0 0 1px oklch(0.82 0.18 45 / 0.25), 0 4px 24px oklch(0 0 0 / 0.3)",
              border: "1px solid oklch(0.82 0.18 45 / 0.35)",
            }
          : isParlay
            ? {
                boxShadow:
                  "0 0 0 1px oklch(0.88 0.18 85 / 0.18), 0 4px 24px oklch(0 0 0 / 0.3)",
                border: "1px solid oklch(0.88 0.18 85 / 0.25)",
              }
            : undefined
      }
    >
      {/* Card top accent line */}
      <div
        className="h-0.5 w-full"
        style={{
          background: isMatchOfDay
            ? `linear-gradient(90deg, ${matchOfDayAccent}, ${matchOfDayAccent}88, transparent)`
            : isParlay
              ? `linear-gradient(90deg, ${parlayAccent}, ${parlayAccent}88, transparent)`
              : `linear-gradient(90deg, ${confidenceColor}, ${confidenceColor}88, transparent)`,
        }}
      />

      <div className="p-5 md:p-6">
        {/* League + Date row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base">
              {getLeagueEmoji(prediction.league)}
            </span>
            <span
              className="font-display text-xs font-700 uppercase tracking-widest px-2.5 py-0.5 rounded-full"
              style={{
                background: "oklch(0.22 0.025 265)",
                border: "1px solid oklch(0.32 0.03 265)",
                color: "oklch(0.75 0.02 265)",
                letterSpacing: "0.12em",
                fontWeight: 700,
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              {prediction.league}
            </span>
            {isParlay && (
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "0.3rem",
                  background: "oklch(0.88 0.18 85 / 0.15)",
                  border: "1px solid oklch(0.88 0.18 85 / 0.45)",
                  color: "oklch(0.88 0.18 85)",
                  textTransform: "uppercase",
                }}
              >
                ΠΑΡΟΛΙ
              </span>
            )}
            {isMatchOfDay && (
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "0.3rem",
                  background: "oklch(0.82 0.18 45 / 0.15)",
                  border: "1px solid oklch(0.82 0.18 45 / 0.50)",
                  color: "oklch(0.82 0.18 45)",
                  textTransform: "uppercase",
                }}
              >
                🔥 ΑΓΩΝΑΣ ΗΜΕΡΑΣ
              </span>
            )}
            {confidence >= 80 && <HotBadge />}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <CountdownTimer matchDate={prediction.matchDate} />
            <span
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.70rem",
                color: "oklch(0.50 0.02 265)",
                fontWeight: 500,
              }}
            >
              {formatDate(prediction.matchDate)}
            </span>
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-5 gap-3">
          <div className="flex-1 text-center">
            <p
              className="font-display leading-tight"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)",
                color: "oklch(0.95 0.01 265)",
                lineHeight: 1.15,
              }}
            >
              {prediction.homeTeam}
            </p>
            <p
              style={{
                fontSize: "0.65rem",
                color: "oklch(0.50 0.02 265)",
                fontWeight: 600,
                letterSpacing: "0.08em",
                marginTop: 2,
              }}
            >
              HOME
            </p>
          </div>

          {/* VS divider */}
          <div className="flex flex-col items-center gap-1 px-2 shrink-0">
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: "1rem",
                color: "oklch(0.40 0.025 265)",
                letterSpacing: "0.05em",
              }}
            >
              VS
            </span>
            <div
              style={{
                width: 24,
                height: 1,
                background: "oklch(0.32 0.025 265)",
              }}
            />
          </div>

          <div className="flex-1 text-center">
            <p
              className="font-display leading-tight"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)",
                color: "oklch(0.95 0.01 265)",
                lineHeight: 1.15,
              }}
            >
              {prediction.awayTeam}
            </p>
            <p
              style={{
                fontSize: "0.65rem",
                color: "oklch(0.50 0.02 265)",
                fontWeight: 600,
                letterSpacing: "0.08em",
                marginTop: 2,
              }}
            >
              AWAY
            </p>
          </div>
        </div>

        {/* Prediction badge + Odds row */}
        <div className="flex items-center justify-between mb-4">
          {/* Prediction badge */}
          <div className="flex items-center gap-2">
            <span
              className={`font-display px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wide ${
                predType === "win"
                  ? "prediction-badge-win"
                  : predType === "draw"
                    ? "prediction-badge-draw"
                    : "prediction-badge-loss"
              }`}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                letterSpacing: "0.06em",
                fontSize: "0.82rem",
              }}
            >
              {prediction.prediction}
            </span>
          </div>

          {/* Odds chip */}
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: "0.68rem",
                color: "oklch(0.50 0.02 265)",
                fontWeight: 600,
                letterSpacing: "0.06em",
              }}
            >
              ODDS
            </span>
            <span className="odds-chip">
              {typeof prediction.odds === "number"
                ? prediction.odds.toFixed(2)
                : prediction.odds}
            </span>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span
              style={{
                fontSize: "0.68rem",
                color: "oklch(0.55 0.02 265)",
                fontWeight: 600,
                letterSpacing: "0.08em",
              }}
            >
              CONFIDENCE
            </span>
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: confidenceColor,
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}
              >
                {confidenceLabel.toUpperCase()}
              </span>
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  color: confidenceColor,
                }}
              >
                {confidence}%
              </span>
            </div>
          </div>
          <div className="confidence-bar-track h-1.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{
                duration: 0.8,
                delay: index * 0.1 + 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${confidenceColor}, ${confidenceColor}cc)`,
                borderRadius: 9999,
                boxShadow: `0 0 8px ${confidenceColor}66`,
              }}
            />
          </div>
        </div>

        {/* Analysis */}
        <div
          className="rounded-lg p-3 diagonal-stripe"
          style={{
            background: "oklch(0.14 0.018 265 / 0.7)",
            border: "1px solid oklch(0.26 0.025 265 / 0.6)",
          }}
        >
          <p
            style={{
              fontSize: "0.80rem",
              lineHeight: 1.6,
              color: "oklch(0.65 0.015 265)",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            {prediction.analysis}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

// --- Loading Skeleton ---
function PredictionSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: "oklch(0.16 0.02 265)",
        border: "1px solid oklch(0.26 0.025 265)",
      }}
    >
      <div
        className="h-0.5 w-full"
        style={{ background: "oklch(0.28 0.025 265)" }}
      />
      <div className="p-5 md:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div
            className="h-5 w-28 rounded-full animate-pulse"
            style={{ background: "oklch(0.22 0.025 265)" }}
          />
          <div
            className="h-4 w-24 rounded-full animate-pulse"
            style={{ background: "oklch(0.20 0.02 265)" }}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div
              className="h-6 rounded animate-pulse mx-auto w-4/5"
              style={{ background: "oklch(0.20 0.025 265)" }}
            />
          </div>
          <div
            className="h-5 w-8 rounded animate-pulse shrink-0"
            style={{ background: "oklch(0.20 0.025 265)" }}
          />
          <div className="flex-1 space-y-2">
            <div
              className="h-6 rounded animate-pulse mx-auto w-4/5"
              style={{ background: "oklch(0.20 0.025 265)" }}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div
            className="h-7 w-24 rounded-lg animate-pulse"
            style={{ background: "oklch(0.20 0.025 265)" }}
          />
          <div
            className="h-7 w-16 rounded animate-pulse"
            style={{ background: "oklch(0.20 0.025 265)" }}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <div
              className="h-3 w-20 rounded animate-pulse"
              style={{ background: "oklch(0.20 0.025 265)" }}
            />
            <div
              className="h-3 w-10 rounded animate-pulse"
              style={{ background: "oklch(0.20 0.025 265)" }}
            />
          </div>
          <div
            className="h-1.5 rounded-full animate-pulse"
            style={{ background: "oklch(0.22 0.025 265)" }}
          />
        </div>
        <div
          className="h-14 rounded-lg animate-pulse"
          style={{ background: "oklch(0.14 0.018 265)" }}
        />
      </div>
    </motion.div>
  );
}

// --- Header ---
function Header() {
  return (
    <header className="header-gradient sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between"
        >
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/assets/generated/markusbet-logo-transparent.dim_200x200.png"
                alt="MarkusBet"
                className="w-10 h-10 object-contain"
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: "0 0 12px oklch(0.82 0.22 142 / 0.4)" }}
              />
            </div>
            <div>
              <h1
                className="font-display leading-none"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: "1.6rem",
                  letterSpacing: "0.02em",
                  color: "oklch(0.96 0.01 265)",
                }}
              >
                MARKUS<span className="text-gradient-green">BET</span>
              </h1>
              <p
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.18em",
                  color: "oklch(0.50 0.02 265)",
                  fontWeight: 600,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  textTransform: "uppercase",
                  marginTop: "-1px",
                }}
              >
                Expert Football Predictions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live badge */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: "oklch(0.82 0.22 142 / 0.12)",
                border: "1px solid oklch(0.82 0.22 142 / 0.3)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "oklch(0.82 0.22 142)",
                  display: "inline-block",
                  animation: "pulse-green 2s infinite",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  color: "oklch(0.82 0.22 142)",
                  letterSpacing: "0.1em",
                }}
              >
                LIVE TIPS
              </span>
            </div>
            {/* Admin link */}
            <Link
              to="/admin"
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "oklch(0.36 0.02 265)",
                textDecoration: "none",
                fontFamily: "'Barlow Condensed', sans-serif",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "oklch(0.50 0.02 265)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "oklch(0.36 0.02 265)";
              }}
            >
              ADMIN
            </Link>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

// --- Stats Bar ---
function StatsBar({ predictions }: { predictions: Prediction[] }) {
  const avgOdds =
    predictions.length > 0
      ? (
          predictions.reduce(
            (sum, p) => sum + (typeof p.odds === "number" ? p.odds : 0),
            0,
          ) / predictions.length
        ).toFixed(2)
      : "—";
  const _avgConf =
    predictions.length > 0
      ? Math.round(
          predictions.reduce((sum, p) => sum + Number(p.confidence), 0) /
            predictions.length,
        )
      : 0;
  const highConf = predictions.filter((p) => Number(p.confidence) >= 70).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="grid grid-cols-3 gap-3 mb-6"
    >
      {[
        {
          label: "PREDICTIONS",
          value: predictions.length.toString(),
          color: "oklch(0.82 0.22 142)",
        },
        { label: "AVG ODDS", value: avgOdds, color: "oklch(0.88 0.18 85)" },
        {
          label: "HIGH CONFIDENCE",
          value: `${highConf}/${predictions.length}`,
          color: "oklch(0.80 0.22 142)",
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl p-3 text-center"
          style={{
            background: "oklch(0.16 0.02 265)",
            border: "1px solid oklch(0.26 0.025 265)",
          }}
        >
          <p
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "1.4rem",
              color: stat.color,
              lineHeight: 1,
              marginBottom: "0.2rem",
            }}
          >
            {stat.value}
          </p>
          <p
            style={{
              fontSize: "0.60rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "oklch(0.45 0.02 265)",
            }}
          >
            {stat.label}
          </p>
        </div>
      ))}
    </motion.div>
  );
}

// --- Footer ---
function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer
      style={{
        borderTop: "1px solid oklch(0.22 0.025 265)",
        marginTop: "3rem",
        background: "oklch(0.10 0.015 265)",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-6 text-center space-y-3">
        {/* Responsible gambling */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: "oklch(0.65 0.22 25 / 0.1)",
            border: "1px solid oklch(0.65 0.22 25 / 0.25)",
          }}
        >
          <span style={{ fontSize: "1rem" }}>⚠️</span>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "oklch(0.75 0.15 25)",
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            18+ GAMBLE RESPONSIBLY — PREDICTIONS ARE FOR ENTERTAINMENT ONLY
          </p>
        </div>

        {/* Caffeine attribution */}
        <p style={{ fontSize: "0.70rem", color: "oklch(0.38 0.02 265)" }}>
          © {year}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "oklch(0.82 0.22 142)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}

// --- Live Scores Types ---
interface LiveMatch {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string; // "IN_PLAY" | "PAUSED" | "FINISHED" | "SCHEDULED" | "TIMED"
  minute: number | null;
  league: string;
  matchDate: string;
  stage?: string;
}

// --- Live Scores Tab ---
function useLiveScores() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchLive() {
    setIsError(false);
    try {
      // TheSportsDB free API - no key needed for basic data
      // Fetch live scores (v2 endpoint, no key required)
      const res = await fetch(
        "https://www.thesportsdb.com/api/v1/json/3/latestsoccer.php",
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawMatches: any[] = json.events ?? [];

      if (rawMatches.length === 0) {
        // Fallback: fetch today's scheduled soccer matches
        const today = new Date().toISOString().slice(0, 10);
        const res2 = await fetch(
          `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`,
        );
        if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
        const json2 = await res2.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawToday: any[] = json2.events ?? [];
        const parsed: LiveMatch[] = rawToday.map((m, idx: number) => {
          const homeScore =
            m.intHomeScore !== null && m.intHomeScore !== ""
              ? Number(m.intHomeScore)
              : null;
          const awayScore =
            m.intAwayScore !== null && m.intAwayScore !== ""
              ? Number(m.intAwayScore)
              : null;
          const finished =
            m.strStatus === "Match Finished" || m.strProgress === "FT";
          const live =
            m.strStatus === "1H" ||
            m.strStatus === "2H" ||
            m.strStatus === "HT" ||
            (m.strProgress &&
              m.strProgress !== "FT" &&
              m.strProgress !== "" &&
              m.intHomeScore !== null);
          const status = finished ? "FINISHED" : live ? "IN_PLAY" : "SCHEDULED";
          const matchDateStr =
            m.dateEvent && m.strTime
              ? `${m.dateEvent}T${m.strTime}`
              : (m.dateEvent ?? "");
          return {
            id: idx + 1,
            homeTeam: m.strHomeTeam ?? "?",
            awayTeam: m.strAwayTeam ?? "?",
            homeScore,
            awayScore,
            status,
            minute: null,
            league: m.strLeague ?? m.strSport ?? "",
            matchDate: matchDateStr,
            stage: m.strRound ?? "",
          };
        });
        const order: Record<string, number> = {
          IN_PLAY: 0,
          PAUSED: 1,
          SCHEDULED: 2,
          TIMED: 3,
          FINISHED: 4,
        };
        parsed.sort(
          (a, b) =>
            (order[a.status] ?? 5) - (order[b.status] ?? 5) ||
            a.matchDate.localeCompare(b.matchDate),
        );
        setMatches(parsed);
        setLastUpdated(new Date());
        return;
      }

      const parsed: LiveMatch[] = rawMatches.map((m, idx: number) => {
        const homeScore =
          m.intHomeScore !== null && m.intHomeScore !== ""
            ? Number(m.intHomeScore)
            : null;
        const awayScore =
          m.intAwayScore !== null && m.intAwayScore !== ""
            ? Number(m.intAwayScore)
            : null;
        const finished =
          m.strStatus === "Match Finished" || m.strProgress === "FT";
        const live = !finished && (m.intHomeScore !== null || m.strProgress);
        const status = finished ? "FINISHED" : live ? "IN_PLAY" : "SCHEDULED";
        const matchDateStr =
          m.dateEvent && m.strTime
            ? `${m.dateEvent}T${m.strTime}`
            : (m.dateEvent ?? "");
        return {
          id: idx + 1,
          homeTeam: m.strHomeTeam ?? "?",
          awayTeam: m.strAwayTeam ?? "?",
          homeScore,
          awayScore,
          status,
          minute:
            m.strProgress && !Number.isNaN(Number(m.strProgress))
              ? Number(m.strProgress)
              : null,
          league: m.strLeague ?? m.strSport ?? "",
          matchDate: matchDateStr,
          stage: m.strRound ?? "",
        };
      });
      const order: Record<string, number> = {
        IN_PLAY: 0,
        PAUSED: 1,
        SCHEDULED: 2,
        TIMED: 3,
        FINISHED: 4,
      };
      parsed.sort(
        (a, b) =>
          (order[a.status] ?? 5) - (order[b.status] ?? 5) ||
          a.matchDate.localeCompare(b.matchDate),
      );
      setMatches(parsed);
      setLastUpdated(new Date());
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchLive is stable inside the hook
  useEffect(() => {
    fetchLive();
    const id = setInterval(fetchLive, 60_000);
    return () => clearInterval(id);
  }, []);

  return { matches, isLoading, isError, lastUpdated, refetch: fetchLive };
}

function LiveScoreCard({
  match,
  index,
}: {
  match: LiveMatch;
  index: number;
}) {
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const isFinished = match.status === "FINISHED";
  const isScheduled = match.status === "TIMED" || match.status === "SCHEDULED";

  const accentColor = isLive
    ? "oklch(0.72 0.22 25)"
    : isFinished
      ? "oklch(0.50 0.02 265)"
      : "oklch(0.82 0.22 142)";

  function formatMatchTime(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleTimeString("el-GR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Athens",
      });
    } catch {
      return "";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        background: "oklch(0.16 0.02 265)",
        border: `1px solid ${accentColor}33`,
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
    >
      {/* Accent line */}
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}44, transparent)`,
        }}
      />
      <div className="px-4 py-3">
        {/* League + status row */}
        <div className="flex items-center justify-between mb-3">
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              padding: "0.15rem 0.55rem",
              borderRadius: "0.3rem",
              background: "oklch(0.22 0.025 265)",
              border: "1px solid oklch(0.32 0.03 265)",
              color: "oklch(0.65 0.02 265)",
              textTransform: "uppercase" as const,
            }}
          >
            {getLeagueEmoji(match.league)} {match.league}
          </span>

          {/* Status badge */}
          {isLive ? (
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "oklch(0.72 0.22 25)",
                  display: "inline-block",
                  animation: "pulse-red 1.2s infinite",
                  boxShadow: "0 0 6px oklch(0.72 0.22 25 / 0.7)",
                }}
              />
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: "0.70rem",
                  letterSpacing: "0.12em",
                  color: "oklch(0.88 0.18 25)",
                }}
              >
                {match.status === "PAUSED" ? "ΗΜ." : "LIVE"}
                {match.minute !== null ? ` ${match.minute}′` : ""}
              </span>
            </div>
          ) : isFinished ? (
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                color: "oklch(0.48 0.02 265)",
              }}
            >
              ΤΕΛΙΚΟ
            </span>
          ) : (
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                color: "oklch(0.65 0.14 142)",
              }}
            >
              ⏰ {formatMatchTime(match.matchDate)}
            </span>
          )}
        </div>

        {/* Score row */}
        <div className="flex items-center justify-between gap-2">
          {/* Home team */}
          <div className="flex-1 text-right">
            <p
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(0.9rem, 2.2vw, 1.1rem)",
                color: "oklch(0.92 0.01 265)",
                lineHeight: 1.2,
              }}
            >
              {match.homeTeam}
            </p>
          </div>

          {/* Score */}
          <div
            className="flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-lg"
            style={{
              background: isLive
                ? "oklch(0.72 0.22 25 / 0.15)"
                : isFinished
                  ? "oklch(0.18 0.025 265)"
                  : "oklch(0.14 0.018 265)",
              border: `1px solid ${isLive ? "oklch(0.72 0.22 25 / 0.40)" : "oklch(0.28 0.025 265)"}`,
              minWidth: "4.5rem",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: "1.4rem",
                color: isLive
                  ? "oklch(0.88 0.18 25)"
                  : isFinished
                    ? "oklch(0.82 0.01 265)"
                    : "oklch(0.40 0.02 265)",
                letterSpacing: "0.02em",
                lineHeight: 1,
              }}
            >
              {match.homeScore !== null && match.awayScore !== null
                ? `${match.homeScore} - ${match.awayScore}`
                : isScheduled
                  ? "vs"
                  : "- -"}
            </span>
          </div>

          {/* Away team */}
          <div className="flex-1 text-left">
            <p
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(0.9rem, 2.2vw, 1.1rem)",
                color: "oklch(0.92 0.01 265)",
                lineHeight: 1.2,
              }}
            >
              {match.awayTeam}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LiveScoresContent() {
  const { matches, isLoading, isError, lastUpdated, refetch } = useLiveScores();

  const liveMatches = matches.filter(
    (m) => m.status === "IN_PLAY" || m.status === "PAUSED",
  );
  const scheduledMatches = matches.filter(
    (m) => m.status === "TIMED" || m.status === "SCHEDULED",
  );
  const finishedMatches = matches.filter((m) => m.status === "FINISHED");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl animate-pulse"
            style={{ background: "oklch(0.16 0.02 265)" }}
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="rounded-xl p-10 text-center"
        style={{
          background: "oklch(0.16 0.02 265)",
          border: "1px solid oklch(0.65 0.22 25 / 0.3)",
        }}
      >
        <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📡</p>
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "oklch(0.75 0.15 25)",
            letterSpacing: "0.04em",
            marginBottom: "0.5rem",
          }}
        >
          ΔΕΝ ΗΤΑΝ ΔΥΝΑΤΗ Η ΣΥΝΔΕΣΗ
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: "oklch(0.48 0.02 265)",
            marginBottom: "1rem",
          }}
        >
          Πρόβλημα σύνδεσης με το TheSportsDB
        </p>
        <button
          type="button"
          onClick={refetch}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            padding: "0.45rem 1.2rem",
            borderRadius: "0.4rem",
            cursor: "pointer",
            border: "none",
            background: "oklch(0.65 0.22 25 / 0.2)",
            color: "oklch(0.78 0.15 25)",
            transition: "all 0.15s",
          }}
        >
          ↺ ΔΟΚΙΜΗ ΞΑΝΑ
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{
          background: "oklch(0.16 0.02 265)",
          border: "1px solid oklch(0.28 0.025 265)",
        }}
      >
        <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>⚽</p>
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "oklch(0.55 0.02 265)",
            letterSpacing: "0.04em",
          }}
        >
          ΔΕΝ ΥΠΑΡΧΟΥΝ ΑΓΩΝΕΣ ΣΗΜΕΡΑ
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: "oklch(0.42 0.02 265)",
            marginTop: "0.5rem",
          }}
        >
          Δεν βρέθηκαν αγώνες για σήμερα στα διαθέσιμα πρωταθλήματα
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Last updated + refresh */}
      <div className="flex items-center justify-between">
        <span
          style={{
            fontSize: "0.62rem",
            color: "oklch(0.40 0.02 265)",
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: "0.06em",
          }}
        >
          {lastUpdated
            ? `ΕΝΗΜΕΡΩΘΗΚΕ: ${lastUpdated.toLocaleTimeString("el-GR", { hour: "2-digit", minute: "2-digit" })}`
            : ""}
        </span>
        <button
          type="button"
          onClick={refetch}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "0.68rem",
            letterSpacing: "0.08em",
            padding: "0.3rem 0.8rem",
            borderRadius: "0.4rem",
            cursor: "pointer",
            border: "none",
            background: "oklch(0.18 0.025 265)",
            color: "oklch(0.55 0.02 265)",
            transition: "all 0.15s",
          }}
        >
          ↺ ΑΝΑΝΕΩΣΗ
        </button>
      </div>

      {/* Live now section */}
      {liveMatches.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "oklch(0.72 0.22 25)",
                display: "inline-block",
                animation: "pulse-red 1.2s infinite",
                boxShadow: "0 0 6px oklch(0.72 0.22 25 / 0.7)",
              }}
            />
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: "0.75rem",
                letterSpacing: "0.14em",
                color: "oklch(0.88 0.18 25)",
              }}
            >
              LIVE ΤΩΡΑ ({liveMatches.length})
            </span>
          </div>
          <div className="space-y-2">
            {liveMatches.map((m, i) => (
              <LiveScoreCard key={m.id} match={m} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Scheduled today */}
      {scheduledMatches.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                color: "oklch(0.55 0.02 265)",
              }}
            >
              📅 ΠΡΟΓΡΑΜΜΑΤΙΣΜΕΝΟΙ ({scheduledMatches.length})
            </span>
          </div>
          <div className="space-y-2">
            {scheduledMatches.map((m, i) => (
              <LiveScoreCard key={m.id} match={m} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Finished today */}
      {finishedMatches.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                color: "oklch(0.48 0.02 265)",
              }}
            >
              ✓ ΟΛΟΚΛΗΡΩΘΗΚΑΝ ({finishedMatches.length})
            </span>
          </div>
          <div className="space-y-2">
            {finishedMatches.map((m, i) => (
              <LiveScoreCard key={m.id} match={m} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Tab Switcher ---
type ActiveTab = "single" | "parlay" | "match_of_day" | "history" | "live";

function TabSwitcher({
  active,
  onChange,
}: {
  active: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="flex items-center gap-1 mb-6 flex-wrap"
      style={{
        background: "oklch(0.14 0.018 265)",
        border: "1px solid oklch(0.26 0.025 265)",
        borderRadius: "0.6rem",
        padding: "0.3rem",
        width: "fit-content",
      }}
    >
      <button
        type="button"
        onClick={() => onChange("single")}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: "0.88rem",
          letterSpacing: "0.10em",
          padding: "0.5rem 1.3rem",
          borderRadius: "0.4rem",
          cursor: "pointer",
          border: "none",
          transition: "all 0.18s",
          background:
            active === "single" ? "oklch(0.20 0.025 265)" : "transparent",
          color:
            active === "single"
              ? "oklch(0.95 0.01 265)"
              : "oklch(0.48 0.02 265)",
          borderBottom:
            active === "single"
              ? "2px solid oklch(0.82 0.22 142)"
              : "2px solid transparent",
        }}
      >
        ⚽ ΠΡΟΒΛΕΨΕΙΣ
      </button>
      <button
        type="button"
        onClick={() => onChange("parlay")}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: "0.88rem",
          letterSpacing: "0.10em",
          padding: "0.5rem 1.3rem",
          borderRadius: "0.4rem",
          cursor: "pointer",
          border: "none",
          transition: "all 0.18s",
          background:
            active === "parlay" ? "oklch(0.88 0.18 85 / 0.10)" : "transparent",
          color:
            active === "parlay"
              ? "oklch(0.88 0.18 85)"
              : "oklch(0.48 0.02 265)",
          borderBottom:
            active === "parlay"
              ? "2px solid oklch(0.88 0.18 85)"
              : "2px solid transparent",
        }}
      >
        🎰 ΠΑΡΟΛΙ
      </button>
      <button
        type="button"
        onClick={() => onChange("match_of_day")}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: "0.88rem",
          letterSpacing: "0.10em",
          padding: "0.5rem 1.3rem",
          borderRadius: "0.4rem",
          cursor: "pointer",
          border: "none",
          transition: "all 0.18s",
          background:
            active === "match_of_day"
              ? "oklch(0.72 0.20 25 / 0.12)"
              : "transparent",
          color:
            active === "match_of_day"
              ? "oklch(0.82 0.18 45)"
              : "oklch(0.48 0.02 265)",
          borderBottom:
            active === "match_of_day"
              ? "2px solid oklch(0.82 0.18 45)"
              : "2px solid transparent",
        }}
      >
        🔥 ΑΓΩΝΑΣ ΗΜΕΡΑΣ
      </button>
      <button
        type="button"
        onClick={() => onChange("history")}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: "0.88rem",
          letterSpacing: "0.10em",
          padding: "0.5rem 1.3rem",
          borderRadius: "0.4rem",
          cursor: "pointer",
          border: "none",
          transition: "all 0.18s",
          background:
            active === "history"
              ? "oklch(0.45 0.18 230 / 0.15)"
              : "transparent",
          color:
            active === "history"
              ? "oklch(0.72 0.14 230)"
              : "oklch(0.48 0.02 265)",
          borderBottom:
            active === "history"
              ? "2px solid oklch(0.72 0.14 230)"
              : "2px solid transparent",
        }}
      >
        📊 ΙΣΤΟΡΙΚΟ
      </button>
      <button
        type="button"
        onClick={() => onChange("live")}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: "0.88rem",
          letterSpacing: "0.10em",
          padding: "0.5rem 1.3rem",
          borderRadius: "0.4rem",
          cursor: "pointer",
          border: "none",
          transition: "all 0.18s",
          background:
            active === "live" ? "oklch(0.72 0.22 25 / 0.15)" : "transparent",
          color:
            active === "live" ? "oklch(0.88 0.18 25)" : "oklch(0.48 0.02 265)",
          borderBottom:
            active === "live"
              ? "2px solid oklch(0.72 0.22 25)"
              : "2px solid transparent",
        }}
      >
        🔴 LIVE
      </button>
    </motion.div>
  );
}

// --- Match History Card ---
function MatchHistoryCard({
  entry,
  index,
}: {
  entry: MatchResult;
  index: number;
}) {
  function getResultBadge(result: string) {
    const lower = result.toLowerCase();
    if (lower === "win") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "oklch(0.82 0.22 142 / 0.15)",
            border: "1px solid oklch(0.82 0.22 142 / 0.50)",
            borderRadius: "0.5rem",
            padding: "0.3rem 0.85rem",
            color: "oklch(0.82 0.22 142)",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "0.82rem",
            letterSpacing: "0.08em",
          }}
        >
          ✅ ΝΙΚΗ
        </span>
      );
    }
    if (lower === "loss") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "oklch(0.65 0.22 25 / 0.12)",
            border: "1px solid oklch(0.65 0.22 25 / 0.50)",
            borderRadius: "0.5rem",
            padding: "0.3rem 0.85rem",
            color: "oklch(0.75 0.15 25)",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "0.82rem",
            letterSpacing: "0.08em",
          }}
        >
          ❌ ΑΤΥΧΙΑ
        </span>
      );
    }
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "oklch(0.40 0.02 265 / 0.15)",
          border: "1px solid oklch(0.40 0.02 265 / 0.50)",
          borderRadius: "0.5rem",
          padding: "0.3rem 0.85rem",
          color: "oklch(0.60 0.02 265)",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: "0.82rem",
          letterSpacing: "0.08em",
        }}
      >
        ⬜ VOID
      </span>
    );
  }

  function formatMatchDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("el-GR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    } catch {
      return dateStr;
    }
  }

  const lower = entry.result.toLowerCase();
  const accentColor =
    lower === "win"
      ? "oklch(0.82 0.22 142)"
      : lower === "loss"
        ? "oklch(0.65 0.22 25)"
        : "oklch(0.42 0.02 265)";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.38,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        background: "oklch(0.16 0.02 265)",
        border: `1px solid ${accentColor}33`,
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
    >
      {/* Accent top line */}
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}44, transparent)`,
        }}
      />
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          {/* Left: league + match */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.68rem",
                  letterSpacing: "0.12em",
                  padding: "0.15rem 0.55rem",
                  borderRadius: "0.3rem",
                  background: "oklch(0.22 0.025 265)",
                  border: "1px solid oklch(0.32 0.03 265)",
                  color: "oklch(0.65 0.02 265)",
                  textTransform: "uppercase" as const,
                }}
              >
                {getLeagueEmoji(entry.league)} {entry.league}
              </span>
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "oklch(0.50 0.02 265)",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                {formatMatchDate(entry.matchDate)}
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "oklch(0.90 0.01 265)",
                lineHeight: 1.2,
                marginBottom: "0.5rem",
              }}
            >
              {entry.homeTeam}
              <span
                style={{ color: "oklch(0.42 0.025 265)", margin: "0 0.4em" }}
              >
                vs
              </span>
              {entry.awayTeam}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  color: "oklch(0.72 0.14 230)",
                  background: "oklch(0.45 0.18 230 / 0.10)",
                  border: "1px solid oklch(0.45 0.18 230 / 0.30)",
                  borderRadius: "0.4rem",
                  padding: "0.2rem 0.6rem",
                  letterSpacing: "0.04em",
                }}
              >
                {entry.prediction}
              </span>
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  color: "oklch(0.88 0.18 85)",
                }}
              >
                @{" "}
                {typeof entry.odds === "number"
                  ? entry.odds.toFixed(2)
                  : entry.odds}
              </span>
            </div>
          </div>

          {/* Right: result badge */}
          <div className="flex items-center">
            {getResultBadge(entry.result)}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// --- History Tab Content ---
function HistoryContent() {
  const { data: history, isLoading, isError } = useMatchHistory();

  if (isLoading) {
    return (
      <motion.div
        key="history-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl animate-pulse"
            style={{ background: "oklch(0.16 0.02 265)" }}
          />
        ))}
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl p-10 text-center"
        style={{
          background: "oklch(0.16 0.02 265)",
          border: "1px solid oklch(0.65 0.22 25 / 0.3)",
        }}
      >
        <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📊</p>
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "oklch(0.75 0.15 25)",
            letterSpacing: "0.04em",
          }}
        >
          ΣΦΑΛΜΑ ΦΟΡΤΩΣΗΣ
        </p>
      </motion.div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl p-12 text-center"
        style={{
          background: "oklch(0.16 0.02 265)",
          border: "1px solid oklch(0.45 0.18 230 / 0.2)",
        }}
      >
        <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📊</p>
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "oklch(0.72 0.14 230 / 0.7)",
            letterSpacing: "0.04em",
          }}
        >
          ΚΑΝΕΝΑ ΙΣΤΟΡΙΚΟ ΑΚΟ ΜΑ
        </p>
        <p
          style={{
            fontSize: "0.78rem",
            color: "oklch(0.42 0.02 265)",
            marginTop: "0.5rem",
          }}
        >
          Αφού ολοκληρωθεί ένας αγώνας, αρχειοθέτησέ τον από το Admin Panel.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-3">
      {history.map((entry: MatchResult, index: number) => (
        <MatchHistoryCard key={String(entry.id)} entry={entry} index={index} />
      ))}
    </motion.div>
  );
}

// --- Predictions Content ---
function PredictionsContent({
  predictions,
  isLoading,
  isError,
  isParlay,
  isMatchOfDay,
}: {
  predictions: Prediction[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isParlay: boolean;
  isMatchOfDay?: boolean;
}) {
  const emptyLabel = isParlay
    ? "ΔΕΝ ΥΠΑΡΧΟΥΝ ΠΑΡΟΛΙ"
    : isMatchOfDay
      ? "ΔΕΝ ΥΠΑΡΧΕΙ ΑΓΩΝΑΣ ΗΜΕΡΑΣ"
      : "NO PREDICTIONS AVAILABLE";

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          {(["s1", "s2", "s3", "s4", "s5"] as const).map((id, i) => (
            <PredictionSkeleton key={id} index={i} />
          ))}
        </motion.div>
      ) : isError ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl p-10 text-center"
          style={{
            background: "oklch(0.16 0.02 265)",
            border: "1px solid oklch(0.65 0.22 25 / 0.3)",
          }}
        >
          <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⚽</p>
          <p
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "oklch(0.75 0.15 25)",
              letterSpacing: "0.04em",
            }}
          >
            UNABLE TO LOAD PREDICTIONS
          </p>
          <p
            style={{
              fontSize: "0.78rem",
              color: "oklch(0.50 0.02 265)",
              marginTop: "0.5rem",
            }}
          >
            Please try refreshing the page.
          </p>
        </motion.div>
      ) : predictions && predictions.length > 0 ? (
        <motion.div key="predictions" className="space-y-4">
          {predictions.map((prediction, index) => (
            <PredictionCard
              key={`${prediction.homeTeam}-${prediction.awayTeam}-${index}`}
              prediction={prediction}
              index={index}
              isParlay={isParlay}
              isMatchOfDay={isMatchOfDay}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl p-10 text-center"
          style={{
            background: "oklch(0.16 0.02 265)",
            border: isParlay
              ? "1px solid oklch(0.88 0.18 85 / 0.2)"
              : isMatchOfDay
                ? "1px solid oklch(0.82 0.18 45 / 0.2)"
                : "1px solid oklch(0.28 0.025 265)",
          }}
        >
          <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
            {isParlay ? "🎰" : isMatchOfDay ? "🔥" : "⚽"}
          </p>
          <p
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: isParlay
                ? "oklch(0.88 0.18 85 / 0.7)"
                : isMatchOfDay
                  ? "oklch(0.82 0.18 45 / 0.7)"
                  : "oklch(0.55 0.02 265)",
              letterSpacing: "0.04em",
            }}
          >
            {emptyLabel}
          </p>
          {(isParlay || isMatchOfDay) && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "oklch(0.42 0.02 265)",
                marginTop: "0.5rem",
              }}
            >
              {isMatchOfDay
                ? "Πρόσθεσε τον αγώνα της ημέρας από το Admin Panel"
                : "Πρόσθεσε παρολί από το Admin Panel"}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Date filter helper ---
function getTodayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function isMatchToday(matchDate: string): boolean {
  // If date is missing or empty, show the prediction by default
  if (!matchDate || matchDate.trim() === "") return true;
  // matchDate can be "2025-02-28T15:30" or "2025-02-28" or similar ISO string
  // Be lenient: compare only the date portion
  const datePart = matchDate.trim().slice(0, 10);
  // Also accept if it's not a recognisable date-like string
  if (!/^\d{4}-\d{2}-\d{2}/.test(datePart)) return true;
  return datePart === getTodayDateStr();
}

// --- Date Filter Toggle ---
function DateFilterToggle({
  todayOnly,
  onChange,
}: {
  todayOnly: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex items-center gap-2 mb-5"
    >
      <button
        type="button"
        onClick={() => onChange(true)}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: "0.75rem",
          letterSpacing: "0.09em",
          padding: "0.35rem 0.9rem",
          borderRadius: "0.4rem",
          cursor: "pointer",
          border: "none",
          transition: "all 0.18s",
          background: todayOnly
            ? "oklch(0.82 0.22 142 / 0.18)"
            : "oklch(0.16 0.02 265)",
          color: todayOnly ? "oklch(0.88 0.20 142)" : "oklch(0.45 0.02 265)",
          boxShadow: todayOnly
            ? "0 0 0 1px oklch(0.82 0.22 142 / 0.40)"
            : "0 0 0 1px oklch(0.28 0.025 265)",
        }}
      >
        📅 ΣΗΜΕΡΑ
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: "0.75rem",
          letterSpacing: "0.09em",
          padding: "0.35rem 0.9rem",
          borderRadius: "0.4rem",
          cursor: "pointer",
          border: "none",
          transition: "all 0.18s",
          background: !todayOnly
            ? "oklch(0.45 0.18 230 / 0.15)"
            : "oklch(0.16 0.02 265)",
          color: !todayOnly ? "oklch(0.72 0.14 230)" : "oklch(0.45 0.02 265)",
          boxShadow: !todayOnly
            ? "0 0 0 1px oklch(0.45 0.18 230 / 0.4)"
            : "0 0 0 1px oklch(0.28 0.025 265)",
        }}
      >
        📋 ΟΛΕΣ
      </button>
    </motion.div>
  );
}

// --- Live Score hook for banner (fetches from TheSportsDB, no API key) ---
interface LiveScoreLookup {
  [key: string]: {
    home: number | null;
    away: number | null;
    minute: number | null;
  };
}

function useLiveScoresForBanner(): {
  scores: LiveScoreLookup;
  isLoaded: boolean;
} {
  const [scores, setScores] = useState<LiveScoreLookup>({});
  const [isLoaded, setIsLoaded] = useState(false);

  async function fetchScores() {
    try {
      // Try live scores first
      const res = await fetch(
        "https://www.thesportsdb.com/api/v1/json/3/latestsoccer.php",
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawMatches: any[] = json.events ?? [];

      // If no live matches, try today's events
      let allMatches = rawMatches;
      if (allMatches.length === 0) {
        const today = new Date().toISOString().slice(0, 10);
        const res2 = await fetch(
          `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`,
        );
        if (res2.ok) {
          const json2 = await res2.json();
          allMatches = json2.events ?? [];
        }
      }

      const lookup: LiveScoreLookup = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const m of allMatches) {
        const homeScore =
          m.intHomeScore !== null && m.intHomeScore !== ""
            ? Number(m.intHomeScore)
            : null;
        const awayScore =
          m.intAwayScore !== null && m.intAwayScore !== ""
            ? Number(m.intAwayScore)
            : null;
        const minute =
          m.strProgress && !Number.isNaN(Number(m.strProgress))
            ? Number(m.strProgress)
            : null;
        const home = (m.strHomeTeam ?? "").toLowerCase().trim();
        const away = (m.strAwayTeam ?? "").toLowerCase().trim();
        if (home && away) {
          lookup[`${home}|${away}`] = {
            home: homeScore,
            away: awayScore,
            minute,
          };
        }
      }
      setScores(lookup);
    } catch {
      // silent fail - banner still shows without scores
    } finally {
      setIsLoaded(true);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchScores is stable inside the hook
  useEffect(() => {
    fetchScores();
    const id = setInterval(fetchScores, 60_000);
    return () => clearInterval(id);
  }, []);

  return { scores, isLoaded };
}

function findScore(
  scores: LiveScoreLookup,
  homeTeam: string,
  awayTeam: string,
): { home: number | null; away: number | null; minute: number | null } | null {
  // Try exact match first
  const key = `${homeTeam.toLowerCase().trim()}|${awayTeam.toLowerCase().trim()}`;
  if (scores[key]) return scores[key];

  // Try partial/fuzzy match (first 5 chars of each team name)
  const shortHome = homeTeam.toLowerCase().trim().slice(0, 5);
  const shortAway = awayTeam.toLowerCase().trim().slice(0, 5);
  for (const [k, v] of Object.entries(scores)) {
    const [kHome, kAway] = k.split("|");
    if (
      kHome &&
      kAway &&
      kHome.slice(0, 5) === shortHome &&
      kAway.slice(0, 5) === shortAway
    ) {
      return v;
    }
  }
  return null;
}

// --- Live Matches Banner ---
function LiveMatchesBanner({ predictions }: { predictions: Prediction[] }) {
  const { scores } = useLiveScoresForBanner();

  const liveMatches = predictions.filter((p) => {
    const secs = calcSecondsLeft(p.matchDate);
    if (secs === null) return false;
    return secs < 0 && secs > -5400; // started but within 90 min
  });

  if (liveMatches.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="mb-5 rounded-xl overflow-hidden"
      style={{
        background: "oklch(0.65 0.22 25 / 0.12)",
        border: "1px solid oklch(0.65 0.22 25 / 0.55)",
        boxShadow: "0 0 20px oklch(0.65 0.22 25 / 0.18)",
      }}
    >
      {/* Red top accent */}
      <div
        style={{
          height: 3,
          background:
            "linear-gradient(90deg, oklch(0.72 0.22 25), oklch(0.65 0.22 25 / 0.4), transparent)",
        }}
      />
      <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
        {/* Pulsing red dot + LIVE label */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "oklch(0.72 0.22 25)",
              display: "inline-block",
              flexShrink: 0,
              animation: "pulse-red 1.2s ease-in-out infinite",
              boxShadow: "0 0 8px oklch(0.72 0.22 25 / 0.7)",
            }}
          />
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "0.82rem",
              letterSpacing: "0.16em",
              color: "oklch(0.88 0.18 25)",
              textTransform: "uppercase" as const,
            }}
          >
            LIVE ΤΩΡΑ
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 24,
            background: "oklch(0.65 0.22 25 / 0.40)",
            flexShrink: 0,
          }}
        />

        {/* Match list */}
        <div className="flex flex-col gap-2 w-full sm:flex-row sm:flex-wrap sm:items-center sm:w-auto">
          {liveMatches.map((p, i) => {
            const elapsed = p.matchDate
              ? Math.abs(
                  Math.floor(
                    (Date.now() - new Date(p.matchDate).getTime()) / 60000,
                  ),
                )
              : 0;
            const scoreData = findScore(scores, p.homeTeam, p.awayTeam);
            const hasScore =
              scoreData !== null &&
              scoreData.home !== null &&
              scoreData.away !== null;
            const displayMinute = scoreData?.minute ?? elapsed;

            return (
              <div
                key={`live-${String(p.id)}-${i}`}
                className="flex items-center gap-2 flex-wrap"
              >
                <span style={{ fontSize: "0.85rem" }}>
                  {getLeagueEmoji(p.league)}
                </span>
                {/* Home team */}
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "oklch(0.92 0.01 265)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {p.homeTeam}
                </span>

                {/* Score box */}
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded"
                  style={{
                    background: hasScore
                      ? "oklch(0.72 0.22 25 / 0.20)"
                      : "oklch(0.18 0.025 265)",
                    border: `1px solid ${hasScore ? "oklch(0.72 0.22 25 / 0.55)" : "oklch(0.32 0.025 265)"}`,
                    minWidth: "3.2rem",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 900,
                      fontSize: "1rem",
                      color: hasScore
                        ? "oklch(0.96 0.12 25)"
                        : "oklch(0.42 0.02 265)",
                      letterSpacing: "0.04em",
                      lineHeight: 1,
                    }}
                  >
                    {hasScore
                      ? `${scoreData!.home} - ${scoreData!.away}`
                      : "vs"}
                  </span>
                </div>

                {/* Away team */}
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "oklch(0.92 0.01 265)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {p.awayTeam}
                </span>

                {/* Minute badge */}
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    color: "oklch(0.72 0.22 25)",
                    background: "oklch(0.72 0.22 25 / 0.12)",
                    border: "1px solid oklch(0.72 0.22 25 / 0.35)",
                    borderRadius: "0.3rem",
                    padding: "0.1rem 0.45rem",
                    letterSpacing: "0.06em",
                  }}
                >
                  {displayMinute}′
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// --- Main App ---
export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("single");
  const [todayOnly, setTodayOnly] = useState(false);

  const {
    data: singleData,
    isLoading: singleLoading,
    isError: singleError,
  } = useGetSinglePredictions();

  const {
    data: parlayData,
    isLoading: parlayLoading,
    isError: parlayError,
  } = useGetParlayPredictions();

  const {
    data: matchOfDayData,
    isLoading: matchOfDayLoading,
    isError: matchOfDayError,
  } = useGetMatchOfDayPredictions();

  const { data: historyData } = useMatchHistory();

  const singlePredictions: Prediction[] = singleData ?? [];
  const parlayPredictions: Prediction[] = parlayData ?? [];
  const matchOfDayPredictions: Prediction[] = matchOfDayData ?? [];

  const isHistoryTab = activeTab === "history";
  const isLiveTab = activeTab === "live";

  // Apply today filter (not relevant for history/live tab)
  const filteredSingle = todayOnly
    ? singlePredictions.filter((p) => isMatchToday(p.matchDate))
    : singlePredictions;
  const filteredParlay = todayOnly
    ? parlayPredictions.filter((p) => isMatchToday(p.matchDate))
    : parlayPredictions;
  const filteredMatchOfDay = todayOnly
    ? matchOfDayPredictions.filter((p) => isMatchToday(p.matchDate))
    : matchOfDayPredictions;

  const activePredictions =
    activeTab === "single"
      ? filteredSingle
      : activeTab === "parlay"
        ? filteredParlay
        : activeTab === "match_of_day"
          ? filteredMatchOfDay
          : [];
  const isLoading =
    activeTab === "single"
      ? singleLoading
      : activeTab === "parlay"
        ? parlayLoading
        : activeTab === "match_of_day"
          ? matchOfDayLoading
          : false;
  const isError =
    activeTab === "single"
      ? singleError
      : activeTab === "parlay"
        ? parlayError
        : activeTab === "match_of_day"
          ? matchOfDayError
          : false;

  // Determine empty state type: todayOnly with no results vs genuinely empty
  const hasPredictionsAtAll =
    activeTab === "single"
      ? singlePredictions.length > 0
      : activeTab === "parlay"
        ? parlayPredictions.length > 0
        : activeTab === "match_of_day"
          ? matchOfDayPredictions.length > 0
          : false;
  const emptyBecauseFilter =
    !isHistoryTab &&
    todayOnly &&
    hasPredictionsAtAll &&
    activePredictions.length === 0;

  // Section title derivation
  const sectionTitle = isHistoryTab
    ? "ΙΣΤΟΡΙΚΟ ΑΓΩΝΩΝ"
    : isLiveTab
      ? "LIVE ΑΠΟΤΕΛΕΣΜΑΤΑ"
      : activeTab === "parlay"
        ? "ΠΑΡΟΛΙ"
        : activeTab === "match_of_day"
          ? "ΑΓΩΝΑΣ ΤΗΣ ΗΜΕΡΑΣ"
          : todayOnly
            ? "ΣΗΜΕΡΙΝΕΣ ΠΡΟΒΛΕΨΕΙΣ"
            : "ΟΛΕΣ ΟΙ ΠΡΟΒΛΕΨΕΙΣ";

  const sectionSubtitle = isHistoryTab
    ? "Αρχειοθετημένες προβλέψεις με αποτελέσματα"
    : isLiveTab
      ? "Αποτελέσματα & σκορ αγώνων σήμερα"
      : activeTab === "parlay"
        ? "Συνδυαστικές προβλέψεις"
        : activeTab === "match_of_day"
          ? "Η κορυφαία επιλογή της ημέρας"
          : todayOnly
            ? "Προβλέψεις για σήμερα"
            : "Expertly curated football tips";

  const accentGradient = isHistoryTab
    ? "linear-gradient(180deg, oklch(0.72 0.14 230), oklch(0.55 0.12 230))"
    : isLiveTab
      ? "linear-gradient(180deg, oklch(0.72 0.22 25), oklch(0.55 0.18 25))"
      : activeTab === "parlay"
        ? "linear-gradient(180deg, oklch(0.88 0.18 85), oklch(0.75 0.16 85))"
        : activeTab === "match_of_day"
          ? "linear-gradient(180deg, oklch(0.82 0.18 45), oklch(0.70 0.16 25))"
          : "linear-gradient(180deg, oklch(0.82 0.22 142), oklch(0.70 0.20 160))";

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header />

      {/* Hero Banner */}
      <div className="w-full" style={{ maxHeight: 220, overflow: "hidden" }}>
        <img
          src="/assets/generated/betting-hero-banner.dim_1200x400.jpg"
          alt="MarkusBet Betting Banner"
          style={{
            width: "100%",
            height: 220,
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
        />
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex items-center gap-3 mb-5"
        >
          <div
            style={{
              width: 3,
              height: 28,
              background: accentGradient,
              borderRadius: 2,
              flexShrink: 0,
              transition: "background 0.3s",
            }}
          />
          <div>
            <h2
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: "1.4rem",
                letterSpacing: "0.04em",
                color: "oklch(0.95 0.01 265)",
                lineHeight: 1,
              }}
            >
              {sectionTitle}
            </h2>
            <p
              style={{
                fontSize: "0.68rem",
                color: "oklch(0.48 0.02 265)",
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              {sectionSubtitle}
            </p>
          </div>
        </motion.div>

        {/* Live Matches Banner - shown when a match is in progress */}
        <AnimatePresence>
          {[
            ...singlePredictions,
            ...parlayPredictions,
            ...matchOfDayPredictions,
          ].some((p) => {
            const secs = calcSecondsLeft(p.matchDate);
            return secs !== null && secs < 0 && secs > -5400;
          }) && (
            <LiveMatchesBanner
              predictions={[
                ...singlePredictions,
                ...parlayPredictions,
                ...matchOfDayPredictions,
              ]}
            />
          )}
        </AnimatePresence>

        {/* History Stats Banner - shown when there's history data */}
        {historyData && historyData.length > 0 && (
          <HistoryStatsBanner history={historyData} />
        )}

        {/* Tab Switcher */}
        <TabSwitcher active={activeTab} onChange={setActiveTab} />

        {/* Date filter toggle - hidden on history/live tab */}
        {!isHistoryTab && !isLiveTab && (
          <DateFilterToggle todayOnly={todayOnly} onChange={setTodayOnly} />
        )}

        {/* Stats bar - hidden on history/live tab */}
        {!isHistoryTab &&
          !isLiveTab &&
          !isLoading &&
          activePredictions.length > 0 && (
            <StatsBar predictions={activePredictions} />
          )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${todayOnly ? "today" : "all"}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {isHistoryTab ? (
              <HistoryContent />
            ) : isLiveTab ? (
              <LiveScoresContent />
            ) : emptyBecauseFilter ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl p-10 text-center"
                style={{
                  background: "oklch(0.16 0.02 265)",
                  border:
                    activeTab === "parlay"
                      ? "1px solid oklch(0.88 0.18 85 / 0.2)"
                      : activeTab === "match_of_day"
                        ? "1px solid oklch(0.82 0.18 45 / 0.2)"
                        : "1px solid oklch(0.28 0.025 265)",
                }}
              >
                <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📅</p>
                <p
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "oklch(0.75 0.02 265)",
                    letterSpacing: "0.04em",
                  }}
                >
                  ΔΕΝ ΥΠΑΡΧΟΥΝ ΣΗΜΕΡΙΝΕΣ ΠΡΟΒΛΕΨΕΙΣ
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "oklch(0.48 0.02 265)",
                    marginTop: "0.5rem",
                  }}
                >
                  Πρόσθεσε προβλέψεις για σήμερα από το Admin Panel
                </p>
                <button
                  type="button"
                  onClick={() => setTodayOnly(false)}
                  style={{
                    marginTop: "1rem",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    letterSpacing: "0.08em",
                    padding: "0.4rem 1rem",
                    borderRadius: "0.4rem",
                    cursor: "pointer",
                    border: "none",
                    background: "oklch(0.22 0.025 265)",
                    color: "oklch(0.65 0.02 265)",
                    transition: "all 0.15s",
                  }}
                >
                  📋 ΔΕΣ ΟΛΕΣ ΤΙΣ ΠΡΟΒΛΕΨΕΙΣ
                </button>
              </motion.div>
            ) : (
              <PredictionsContent
                predictions={activePredictions}
                isLoading={isLoading}
                isError={isError}
                isParlay={activeTab === "parlay"}
                isMatchOfDay={activeTab === "match_of_day"}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
