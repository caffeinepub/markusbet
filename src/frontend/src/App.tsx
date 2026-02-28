import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  useGetParlayPredictions,
  useGetSinglePredictions,
} from "./hooks/useQueries";
import type { Prediction } from "./hooks/useQueries";

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

// --- Prediction Card ---
interface PredictionCardProps {
  prediction: Prediction;
  index: number;
  isParlay?: boolean;
}

function PredictionCard({
  prediction,
  index,
  isParlay = false,
}: PredictionCardProps) {
  const predType = getPredictionType(prediction.prediction);
  const confidence = Number(prediction.confidence);
  const confidenceColor = getConfidenceColor(confidence);
  const confidenceLabel = getConfidenceLabel(confidence);
  const parlayAccent = "oklch(0.88 0.18 85)";

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
        isParlay
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
          background: isParlay
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
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="live-dot"
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "oklch(0.82 0.22 142)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.72rem",
                color: "oklch(0.58 0.02 265)",
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

// --- Tab Switcher ---
type ActiveTab = "single" | "parlay";

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
      className="flex items-center gap-1 mb-6"
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
    </motion.div>
  );
}

// --- Predictions Content ---
function PredictionsContent({
  predictions,
  isLoading,
  isError,
  isParlay,
}: {
  predictions: Prediction[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isParlay: boolean;
}) {
  const emptyLabel = isParlay
    ? "ΔΕΝ ΥΠΑΡΧΟΥΝ ΠΑΡΟΛΙ"
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
              : "1px solid oklch(0.28 0.025 265)",
          }}
        >
          <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
            {isParlay ? "🎰" : "⚽"}
          </p>
          <p
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: isParlay
                ? "oklch(0.88 0.18 85 / 0.7)"
                : "oklch(0.55 0.02 265)",
              letterSpacing: "0.04em",
            }}
          >
            {emptyLabel}
          </p>
          {isParlay && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "oklch(0.42 0.02 265)",
                marginTop: "0.5rem",
              }}
            >
              Πρόσθεσε παρολί από το Admin Panel
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

  const singlePredictions: Prediction[] = singleData ?? [];
  const parlayPredictions: Prediction[] = parlayData ?? [];

  // Apply today filter
  const filteredSingle = todayOnly
    ? singlePredictions.filter((p) => isMatchToday(p.matchDate))
    : singlePredictions;
  const filteredParlay = todayOnly
    ? parlayPredictions.filter((p) => isMatchToday(p.matchDate))
    : parlayPredictions;

  const activePredictions =
    activeTab === "single" ? filteredSingle : filteredParlay;
  const isLoading = activeTab === "single" ? singleLoading : parlayLoading;
  const isError = activeTab === "single" ? singleError : parlayError;

  // Determine empty state type: todayOnly with no results vs genuinely empty
  const hasPredictionsAtAll =
    activeTab === "single"
      ? singlePredictions.length > 0
      : parlayPredictions.length > 0;
  const emptyBecauseFilter =
    todayOnly && hasPredictionsAtAll && activePredictions.length === 0;

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header />

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
              background:
                activeTab === "parlay"
                  ? "linear-gradient(180deg, oklch(0.88 0.18 85), oklch(0.75 0.16 85))"
                  : "linear-gradient(180deg, oklch(0.82 0.22 142), oklch(0.70 0.20 160))",
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
              {activeTab === "parlay"
                ? "ΠΑΡΟΛΙ"
                : todayOnly
                  ? "ΣΗΜΕΡΙΝΕΣ ΠΡΟΒΛΕΨΕΙΣ"
                  : "ΟΛΕΣ ΟΙ ΠΡΟΒΛΕΨΕΙΣ"}
            </h2>
            <p
              style={{
                fontSize: "0.68rem",
                color: "oklch(0.48 0.02 265)",
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              {activeTab === "parlay"
                ? "Συνδυαστικές προβλέψεις"
                : todayOnly
                  ? "Προβλέψεις για σήμερα"
                  : "Expertly curated football tips"}
            </p>
          </div>
        </motion.div>

        {/* Tab Switcher */}
        <TabSwitcher active={activeTab} onChange={setActiveTab} />

        {/* Date filter toggle */}
        <DateFilterToggle todayOnly={todayOnly} onChange={setTodayOnly} />

        {/* Stats bar */}
        {!isLoading && activePredictions.length > 0 && (
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
            {emptyBecauseFilter ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl p-10 text-center"
                style={{
                  background: "oklch(0.16 0.02 265)",
                  border:
                    activeTab === "parlay"
                      ? "1px solid oklch(0.88 0.18 85 / 0.2)"
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
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
