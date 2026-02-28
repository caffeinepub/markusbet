import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Download,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Trophy,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useAddPrediction,
  useAdminLogin,
  useAdminLogout,
  useDeletePrediction,
  useFetchMatchesByCompetition,
  useIsAdminAuthenticated,
  usePredictions,
  useUpdatePrediction,
} from "./hooks/useQueries";
import type { Prediction } from "./hooks/useQueries";

// ---- Football API types ----
interface FootballMatch {
  id: number;
  utcDate: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  competition: { name: string };
}

const STORAGE_KEY = "markusbet_admin_token";

// ---- Form state type ----
interface PredictionForm {
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  league: string;
  prediction: string;
  odds: string;
  confidence: string;
  analysis: string;
}

const EMPTY_FORM: PredictionForm = {
  homeTeam: "",
  awayTeam: "",
  matchDate: "",
  league: "",
  prediction: "",
  odds: "",
  confidence: "75",
  analysis: "",
};

function formFromPrediction(p: Prediction): PredictionForm {
  return {
    homeTeam: p.homeTeam,
    awayTeam: p.awayTeam,
    matchDate: p.matchDate,
    league: p.league,
    prediction: p.prediction,
    odds: String(p.odds),
    confidence: String(Number(p.confidence)),
    analysis: p.analysis,
  };
}

// ---- Field Component ----
function Field({
  label,
  id,
  required,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
          color: "oklch(0.60 0.02 265)",
          textTransform: "uppercase",
        }}
      >
        {label}{" "}
        {required && <span style={{ color: "oklch(0.82 0.22 142)" }}>*</span>}
      </Label>
      {children}
    </div>
  );
}

// ---- Prediction Form Dialog ----
interface PredictionFormDialogProps {
  open: boolean;
  onClose: () => void;
  editTarget: Prediction | null;
  token: string;
  prefillData?: Partial<PredictionForm>;
}

function PredictionFormDialog({
  open,
  onClose,
  editTarget,
  token,
  prefillData,
}: PredictionFormDialogProps) {
  const [form, setForm] = useState<PredictionForm>(EMPTY_FORM);
  const [category, setCategory] = useState<"single" | "parlay">("single");
  const addMutation = useAddPrediction();
  const updateMutation = useUpdatePrediction();

  useEffect(() => {
    if (open) {
      if (editTarget) {
        setForm(formFromPrediction(editTarget));
        setCategory(
          (editTarget.category as "single" | "parlay") === "parlay"
            ? "parlay"
            : "single",
        );
      } else if (prefillData) {
        setForm({ ...EMPTY_FORM, ...prefillData });
        setCategory("single");
      } else {
        setForm(EMPTY_FORM);
        setCategory("single");
      }
    }
  }, [open, editTarget, prefillData]);

  const isEditing = !!editTarget;
  const isPending = addMutation.isPending || updateMutation.isPending;

  function set(field: keyof PredictionForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const odds = Number.parseFloat(form.odds);
    const confidence = Number.parseInt(form.confidence, 10);

    if (
      !form.homeTeam ||
      !form.awayTeam ||
      !form.matchDate ||
      !form.league ||
      !form.prediction ||
      Number.isNaN(odds) ||
      Number.isNaN(confidence)
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      if (isEditing && editTarget) {
        const ok = await updateMutation.mutateAsync({
          token,
          id: editTarget.id,
          homeTeam: form.homeTeam,
          awayTeam: form.awayTeam,
          matchDate: form.matchDate,
          league: form.league,
          prediction: form.prediction,
          odds,
          confidence: BigInt(confidence),
          analysis: form.analysis,
          category,
        });
        if (ok) {
          toast.success("Prediction updated!");
          onClose();
        } else {
          toast.error("Failed to update prediction.");
        }
      } else {
        const newId = await addMutation.mutateAsync({
          token,
          homeTeam: form.homeTeam,
          awayTeam: form.awayTeam,
          matchDate: form.matchDate,
          league: form.league,
          prediction: form.prediction,
          odds,
          confidence: BigInt(confidence),
          analysis: form.analysis,
          category,
        });
        if (newId !== null) {
          toast.success("Prediction added!");
          onClose();
        } else {
          toast.error("Failed to add prediction.");
        }
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    }
  }

  const inputStyle = {
    background: "oklch(0.14 0.018 265)",
    border: "1px solid oklch(0.30 0.025 265)",
    color: "oklch(0.92 0.01 265)",
    fontFamily: "'Barlow', sans-serif",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        style={{
          background: "oklch(0.13 0.02 265)",
          border: "1px solid oklch(0.28 0.025 265)",
          maxWidth: "36rem",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "1.3rem",
              letterSpacing: "0.04em",
              color: "oklch(0.96 0.01 265)",
            }}
          >
            {isEditing ? "EDIT PREDICTION" : "ADD NEW PREDICTION"}
          </DialogTitle>
          <DialogDescription
            style={{ color: "oklch(0.50 0.02 265)", fontSize: "0.78rem" }}
          >
            {isEditing
              ? "Update the prediction details below."
              : "Fill in the prediction details below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Category toggle */}
          <div>
            <p
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: "0.10em",
                color: "oklch(0.60 0.02 265)",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
              }}
            >
              Κατηγορία
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                background: "oklch(0.12 0.016 265)",
                border: "1px solid oklch(0.26 0.025 265)",
                borderRadius: "0.5rem",
                padding: "0.25rem",
                width: "fit-content",
              }}
            >
              <button
                type="button"
                onClick={() => setCategory("single")}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  letterSpacing: "0.08em",
                  padding: "0.4rem 1rem",
                  borderRadius: "0.35rem",
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.15s",
                  background:
                    category === "single"
                      ? "oklch(0.82 0.22 142 / 0.18)"
                      : "transparent",
                  color:
                    category === "single"
                      ? "oklch(0.82 0.22 142)"
                      : "oklch(0.50 0.02 265)",
                  boxShadow:
                    category === "single"
                      ? "0 0 0 1px oklch(0.82 0.22 142 / 0.35)"
                      : "none",
                }}
              >
                ⚽ ΚΑΝΟΝΙΚΗ ΠΡΟΒΛΕΨΗ
              </button>
              <button
                type="button"
                onClick={() => setCategory("parlay")}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  letterSpacing: "0.08em",
                  padding: "0.4rem 1rem",
                  borderRadius: "0.35rem",
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.15s",
                  background:
                    category === "parlay"
                      ? "oklch(0.88 0.18 85 / 0.15)"
                      : "transparent",
                  color:
                    category === "parlay"
                      ? "oklch(0.88 0.18 85)"
                      : "oklch(0.50 0.02 265)",
                  boxShadow:
                    category === "parlay"
                      ? "0 0 0 1px oklch(0.88 0.18 85 / 0.40)"
                      : "none",
                }}
              >
                🎰 ΠΑΡΟΛΙ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Home Team" id="homeTeam" required>
              <Input
                id="homeTeam"
                value={form.homeTeam}
                onChange={set("homeTeam")}
                placeholder="e.g. Arsenal"
                style={inputStyle}
                className="placeholder:opacity-40"
              />
            </Field>
            <Field label="Away Team" id="awayTeam" required>
              <Input
                id="awayTeam"
                value={form.awayTeam}
                onChange={set("awayTeam")}
                placeholder="e.g. Chelsea"
                style={inputStyle}
                className="placeholder:opacity-40"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Match Date" id="matchDate" required>
              <Input
                id="matchDate"
                type="datetime-local"
                value={form.matchDate}
                onChange={set("matchDate")}
                style={{ ...inputStyle, colorScheme: "dark" }}
              />
            </Field>
            <Field label="League" id="league" required>
              <Input
                id="league"
                value={form.league}
                onChange={set("league")}
                placeholder="e.g. Premier League"
                style={inputStyle}
                className="placeholder:opacity-40"
              />
            </Field>
          </div>

          <Field label="Prediction" id="prediction" required>
            <Input
              id="prediction"
              value={form.prediction}
              onChange={set("prediction")}
              placeholder="e.g. Home Win, Over 2.5, BTTS"
              style={inputStyle}
              className="placeholder:opacity-40"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Odds" id="odds" required>
              <Input
                id="odds"
                type="number"
                min="1"
                step="0.01"
                value={form.odds}
                onChange={set("odds")}
                placeholder="e.g. 1.85"
                style={inputStyle}
                className="placeholder:opacity-40"
              />
            </Field>
            <Field
              label={`Confidence (${form.confidence}%)`}
              id="confidence"
              required
            >
              <div className="pt-1">
                <input
                  id="confidence"
                  type="range"
                  min="0"
                  max="100"
                  value={form.confidence}
                  onChange={set("confidence")}
                  className="w-full accent-green-400 h-2 rounded-full cursor-pointer"
                  style={{ accentColor: "oklch(0.82 0.22 142)" }}
                />
                <div className="flex justify-between mt-1">
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "oklch(0.45 0.02 265)",
                    }}
                  >
                    0%
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "oklch(0.82 0.22 142)",
                      fontWeight: 700,
                    }}
                  >
                    {form.confidence}%
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "oklch(0.45 0.02 265)",
                    }}
                  >
                    100%
                  </span>
                </div>
              </div>
            </Field>
          </div>

          <Field label="Analysis" id="analysis">
            <Textarea
              id="analysis"
              value={form.analysis}
              onChange={set("analysis")}
              placeholder="Write your analysis and reasoning..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              className="placeholder:opacity-40"
            />
          </Field>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid oklch(0.30 0.025 265)",
                color: "oklch(0.65 0.02 265)",
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              style={{
                background: "oklch(0.82 0.22 142)",
                color: "oklch(0.10 0.02 142)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending
                ? "SAVING..."
                : isEditing
                  ? "UPDATE"
                  : "ADD PREDICTION"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- Delete Confirm Dialog ----
interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  predictionLabel: string;
}

function DeleteDialog({
  open,
  onClose,
  onConfirm,
  isPending,
  predictionLabel,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent
        style={{
          background: "oklch(0.13 0.02 265)",
          border: "1px solid oklch(0.65 0.22 25 / 0.4)",
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "1.2rem",
              letterSpacing: "0.04em",
              color: "oklch(0.96 0.01 265)",
            }}
          >
            DELETE PREDICTION?
          </AlertDialogTitle>
          <AlertDialogDescription
            style={{ color: "oklch(0.55 0.02 265)", fontSize: "0.82rem" }}
          >
            This will permanently delete the prediction:{" "}
            <strong style={{ color: "oklch(0.80 0.15 25)" }}>
              {predictionLabel}
            </strong>
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid oklch(0.30 0.025 265)",
              color: "oklch(0.65 0.02 265)",
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            style={{
              background: "oklch(0.55 0.22 25)",
              color: "oklch(0.98 0 0)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "DELETING..." : "DELETE"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---- Login Page ----
function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginMutation = useAdminLogin();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const token = await loginMutation.mutateAsync(password);
      if (token) {
        localStorage.setItem(STORAGE_KEY, token);
        onLogin(token);
        toast.success("Logged in successfully.");
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Login failed. Please try again.");
    }
  }

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <header
        style={{
          background: "oklch(0.10 0.02 265)",
          borderBottom: "1px solid oklch(0.28 0.025 265)",
          padding: "1rem",
        }}
      >
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link
            to="/"
            style={{
              color: "oklch(0.50 0.02 265)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
              fontSize: "0.78rem",
            }}
          >
            <ArrowLeft size={14} />
            Back to Predictions
          </Link>
        </div>
      </header>

      {/* Login form */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth: "24rem" }}
        >
          {/* Logo area */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: "oklch(0.82 0.22 142 / 0.12)",
                border: "1px solid oklch(0.82 0.22 142 / 0.3)",
              }}
            >
              <ShieldCheck
                size={28}
                style={{ color: "oklch(0.82 0.22 142)" }}
              />
            </div>
            <h1
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: "1.8rem",
                letterSpacing: "0.04em",
                color: "oklch(0.96 0.01 265)",
                lineHeight: 1,
              }}
            >
              ADMIN ACCESS
            </h1>
            <p
              style={{
                fontSize: "0.78rem",
                color: "oklch(0.48 0.02 265)",
                marginTop: "0.4rem",
              }}
            >
              Sign in to manage predictions
            </p>
          </div>

          {/* Form card */}
          <div
            style={{
              background: "oklch(0.16 0.02 265)",
              border: "1px solid oklch(0.28 0.025 265)",
              borderRadius: "0.75rem",
              padding: "2rem",
              boxShadow: "0 8px 32px oklch(0 0 0 / 0.4)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Password" id="admin-password" required>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    style={{
                      background: "oklch(0.14 0.018 265)",
                      border: `1px solid ${error ? "oklch(0.65 0.22 25 / 0.7)" : "oklch(0.30 0.025 265)"}`,
                      color: "oklch(0.92 0.01 265)",
                      paddingRight: "2.75rem",
                    }}
                    className="placeholder:opacity-40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{
                      color: "oklch(0.45 0.02 265)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              <AnimatePresence>
                {error && (
                  <motion.p
                    key="error"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    style={{
                      fontSize: "0.78rem",
                      color: "oklch(0.75 0.15 25)",
                      background: "oklch(0.65 0.22 25 / 0.1)",
                      border: "1px solid oklch(0.65 0.22 25 / 0.3)",
                      borderRadius: "0.5rem",
                      padding: "0.6rem 0.75rem",
                    }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={loginMutation.isPending || !password}
                className="w-full"
                style={{
                  background: "oklch(0.82 0.22 142)",
                  color: "oklch(0.10 0.02 142)",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "1rem",
                  letterSpacing: "0.1em",
                }}
              >
                {loginMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {loginMutation.isPending ? "SIGNING IN..." : "SIGN IN"}
              </Button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// ---- Competition selector data ----
const COMPETITIONS = [
  { code: "PL", name: "Premier League" },
  { code: "PD", name: "La Liga" },
  { code: "BL1", name: "Bundesliga" },
  { code: "SA", name: "Serie A" },
  { code: "FL1", name: "Ligue 1" },
  { code: "PPL", name: "Primeira Liga" },
  { code: "DED", name: "Eredivisie" },
] as const;

type CompetitionCode = (typeof COMPETITIONS)[number]["code"];

function parseApiError(jsonText: string): string {
  try {
    const parsed = JSON.parse(jsonText) as { message?: string };
    if (parsed.message) return parsed.message;
  } catch {
    // not JSON, return as-is
  }
  return jsonText;
}

// ---- Import Matches Tab ----
interface ImportMatchesTabProps {
  onCreatePrediction: (prefill: Partial<PredictionForm>) => void;
  token: string;
}

function ImportMatchesTab({
  onCreatePrediction,
  token,
}: ImportMatchesTabProps) {
  const [matches, setMatches] = useState<FootballMatch[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompetition, setSelectedCompetition] =
    useState<CompetitionCode>("PL");
  const [selectedLeague, setSelectedLeague] = useState<string>("ALL");
  const fetchMatchesMutation = useFetchMatchesByCompetition();

  function formatMatchDateLocal(utcDate: string): string {
    try {
      const d = new Date(utcDate);
      if (Number.isNaN(d.getTime())) return "";
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  }

  function formatDisplayDate(utcDate: string): string {
    try {
      const d = new Date(utcDate);
      if (Number.isNaN(d.getTime())) return utcDate;
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
      });
    } catch {
      return utcDate;
    }
  }

  function getCompetitionName(match: FootballMatch): string {
    if (match.competition?.name) return match.competition.name;
    return (
      COMPETITIONS.find((c) => c.code === selectedCompetition)?.name ??
      selectedCompetition
    );
  }

  async function fetchMatches() {
    setSelectedLeague("ALL");
    setIsFetching(true);
    setError(null);
    try {
      const jsonText = await fetchMatchesMutation.mutateAsync({
        token,
        competitionCode: selectedCompetition,
      });

      // Check if the response is an error payload
      let parsed: { matches?: FootballMatch[]; message?: string };
      try {
        parsed = JSON.parse(jsonText) as typeof parsed;
      } catch {
        throw new Error("Unexpected response from server.");
      }

      if (parsed.message && !parsed.matches) {
        // API returned an error object
        throw new Error(parsed.message);
      }

      setMatches(parsed.matches ?? []);
      setHasFetched(true);
    } catch (err) {
      const rawMsg =
        err instanceof Error
          ? err.message
          : "Failed to fetch matches. Please try again.";
      setError(parseApiError(rawMsg));
      setHasFetched(true);
    } finally {
      setIsFetching(false);
    }
  }

  const uniqueLeagues = Array.from(
    new Set(matches.map((m) => getCompetitionName(m))),
  );
  const displayedMatches =
    selectedLeague === "ALL"
      ? matches
      : matches.filter((m) => getCompetitionName(m) === selectedLeague);

  const btnBase = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    letterSpacing: "0.06em",
    fontSize: "0.82rem",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "1.2rem",
            letterSpacing: "0.04em",
            color: "oklch(0.95 0.01 265)",
            lineHeight: 1,
          }}
        >
          IMPORT FROM FOOTBALL-DATA.ORG
        </h3>
        <p
          style={{
            fontSize: "0.70rem",
            color: "oklch(0.45 0.02 265)",
            marginTop: 3,
          }}
        >
          Select a competition, fetch upcoming matches, and quickly create
          predictions.
        </p>
      </div>

      {/* Competition selector */}
      <div>
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "0.68rem",
            letterSpacing: "0.10em",
            color: "oklch(0.50 0.02 265)",
            textTransform: "uppercase",
            marginBottom: "0.5rem",
          }}
        >
          Select Competition
        </p>
        <fieldset
          className="flex flex-wrap gap-2"
          style={{ border: "none", padding: 0, margin: 0 }}
        >
          <legend className="sr-only">Select competition to fetch</legend>
          {COMPETITIONS.map((comp) => {
            const isActive = selectedCompetition === comp.code;
            return (
              <button
                key={comp.code}
                type="button"
                onClick={() => setSelectedCompetition(comp.code)}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "0.35rem 0.85rem",
                  borderRadius: "0.45rem",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: isActive
                    ? "oklch(0.45 0.18 230 / 0.22)"
                    : "oklch(0.18 0.022 265)",
                  border: isActive
                    ? "1px solid oklch(0.45 0.18 230 / 0.6)"
                    : "1px solid oklch(0.28 0.025 265)",
                  color: isActive
                    ? "oklch(0.78 0.16 230)"
                    : "oklch(0.58 0.02 265)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "oklch(0.22 0.025 265)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "oklch(0.75 0.02 265)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "oklch(0.18 0.022 265)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "oklch(0.58 0.02 265)";
                  }
                }}
              >
                {comp.name}
              </button>
            );
          })}
        </fieldset>
      </div>

      {/* Fetch button */}
      <div>
        <Button
          onClick={fetchMatches}
          disabled={isFetching}
          style={{
            background: "oklch(0.45 0.18 230)",
            color: "oklch(0.96 0.01 265)",
            ...btnBase,
          }}
        >
          {isFetching ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw size={15} className="mr-1.5" />
          )}
          {isFetching
            ? "FETCHING..."
            : `FETCH ${COMPETITIONS.find((c) => c.code === selectedCompetition)?.name.toUpperCase() ?? "MATCHES"}`}
        </Button>
      </div>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.6rem",
              background: "oklch(0.65 0.22 25 / 0.08)",
              border: "1px solid oklch(0.65 0.22 25 / 0.35)",
              borderRadius: "0.6rem",
              padding: "0.85rem 1rem",
            }}
          >
            <AlertCircle
              size={16}
              style={{
                color: "oklch(0.75 0.18 25)",
                flexShrink: 0,
                marginTop: 1,
              }}
            />
            <div>
              <p
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.80rem",
                  letterSpacing: "0.05em",
                  color: "oklch(0.80 0.18 25)",
                  marginBottom: "0.2rem",
                }}
              >
                FETCH FAILED
              </p>
              <p style={{ fontSize: "0.75rem", color: "oklch(0.65 0.12 25)" }}>
                {error}
              </p>
              <p
                style={{
                  fontSize: "0.70rem",
                  color: "oklch(0.48 0.08 25)",
                  marginTop: "0.35rem",
                }}
              >
                Tip: Make sure your API key is valid and you have not exceeded
                the free tier rate limit (10 req/min). Note: Champions League
                and other premium competitions require a paid plan.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeletons */}
      {isFetching && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg animate-pulse"
              style={{ background: "oklch(0.18 0.022 265)" }}
            />
          ))}
        </div>
      )}

      {/* Results */}
      {!isFetching && hasFetched && !error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Match count badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: "0.08em",
                color: "oklch(0.75 0.02 265)",
              }}
            >
              FOUND
            </span>
            <span
              style={{
                background: "oklch(0.45 0.18 230 / 0.18)",
                border: "1px solid oklch(0.45 0.18 230 / 0.4)",
                color: "oklch(0.72 0.14 230)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: "0.75rem",
                letterSpacing: "0.06em",
                padding: "0.15rem 0.6rem",
                borderRadius: "0.35rem",
              }}
            >
              {matches.length} {matches.length === 1 ? "MATCH" : "MATCHES"}
            </span>
          </div>

          {/* League filter chips (only shown when multiple leagues returned) */}
          {matches.length > 0 && uniqueLeagues.length > 1 && (
            <fieldset
              className="flex flex-wrap gap-2 mb-4"
              style={{ border: "none", padding: 0, margin: 0 }}
            >
              <legend className="sr-only">Filter by league</legend>
              {["ALL", ...uniqueLeagues].map((league) => {
                const isActive = selectedLeague === league;
                return (
                  <button
                    key={league}
                    type="button"
                    onClick={() => setSelectedLeague(league)}
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.70rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "0.28rem 0.75rem",
                      borderRadius: "0.4rem",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      background: isActive
                        ? "oklch(0.82 0.22 142 / 0.18)"
                        : "oklch(0.20 0.025 265)",
                      border: isActive
                        ? "1px solid oklch(0.82 0.22 142 / 0.5)"
                        : "1px solid oklch(0.28 0.025 265)",
                      color: isActive
                        ? "oklch(0.82 0.22 142)"
                        : "oklch(0.62 0.02 265)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "oklch(0.24 0.025 265)";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "oklch(0.78 0.02 265)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "oklch(0.20 0.025 265)";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "oklch(0.62 0.02 265)";
                      }
                    }}
                  >
                    {league === "ALL"
                      ? `ALL (${matches.length})`
                      : `${league} (${matches.filter((m) => getCompetitionName(m) === league).length})`}
                  </button>
                );
              })}
            </fieldset>
          )}

          {matches.length === 0 ? (
            <div
              style={{
                background: "oklch(0.16 0.02 265)",
                border: "1px solid oklch(0.28 0.025 265)",
                borderRadius: "0.75rem",
                padding: "3rem",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📅</p>
              <p
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  letterSpacing: "0.06em",
                  color: "oklch(0.50 0.02 265)",
                }}
              >
                NO UPCOMING MATCHES FOUND
              </p>
              <p
                style={{
                  fontSize: "0.73rem",
                  color: "oklch(0.38 0.02 265)",
                  marginTop: 6,
                }}
              >
                The API returned no scheduled matches for this competition.
              </p>
            </div>
          ) : displayedMatches.length === 0 ? (
            <div
              style={{
                background: "oklch(0.16 0.02 265)",
                border: "1px solid oklch(0.28 0.025 265)",
                borderRadius: "0.75rem",
                padding: "2.5rem",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.90rem",
                  letterSpacing: "0.06em",
                  color: "oklch(0.50 0.02 265)",
                }}
              >
                NO MATCHES FOR THIS LEAGUE
              </p>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "oklch(0.38 0.02 265)",
                  marginTop: 6,
                }}
              >
                Try selecting a different filter above.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {displayedMatches.map((match, i) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.04 }}
                    style={{
                      background: "oklch(0.16 0.02 265)",
                      border: "1px solid oklch(0.26 0.025 265)",
                      borderRadius: "0.6rem",
                      padding: "0.85rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Match info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          letterSpacing: "0.03em",
                          color: "oklch(0.92 0.01 265)",
                          lineHeight: 1.3,
                          marginBottom: "0.3rem",
                        }}
                      >
                        {match.homeTeam.name}
                        <span
                          style={{
                            color: "oklch(0.42 0.025 265)",
                            margin: "0 0.4em",
                            fontWeight: 400,
                          }}
                        >
                          vs
                        </span>
                        {match.awayTeam.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            color: "oklch(0.62 0.02 265)",
                            background: "oklch(0.20 0.025 265)",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "0.3rem",
                            border: "1px solid oklch(0.28 0.025 265)",
                            fontFamily: "'Barlow Condensed', sans-serif",
                            letterSpacing: "0.04em",
                          }}
                        >
                          <Trophy size={10} />
                          {getCompetitionName(match)}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "0.68rem",
                            color: "oklch(0.50 0.02 265)",
                            fontFamily: "'Barlow', sans-serif",
                          }}
                        >
                          <Calendar size={10} />
                          {formatDisplayDate(match.utcDate)}
                        </span>
                      </div>
                    </div>

                    {/* Create prediction button */}
                    <button
                      type="button"
                      onClick={() =>
                        onCreatePrediction({
                          homeTeam: match.homeTeam.name,
                          awayTeam: match.awayTeam.name,
                          matchDate: formatMatchDateLocal(match.utcDate),
                          league: getCompetitionName(match),
                          prediction: "",
                          odds: "",
                          confidence: "75",
                          analysis: "",
                        })
                      }
                      style={{
                        background: "oklch(0.82 0.22 142 / 0.12)",
                        border: "1px solid oklch(0.82 0.22 142 / 0.35)",
                        borderRadius: "0.45rem",
                        padding: "0.4rem 0.85rem",
                        color: "oklch(0.82 0.22 142)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        letterSpacing: "0.06em",
                        transition: "all 0.15s",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "oklch(0.82 0.22 142 / 0.22)";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "oklch(0.82 0.22 142 / 0.12)";
                      }}
                    >
                      <Download size={12} />
                      CREATE PREDICTION
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}

      {/* Initial empty state (before any fetch) */}
      {!isFetching && !hasFetched && (
        <div
          style={{
            background: "oklch(0.16 0.02 265)",
            border: "1px dashed oklch(0.30 0.025 265)",
            borderRadius: "0.75rem",
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <RefreshCw
            size={28}
            style={{ color: "oklch(0.35 0.02 265)", margin: "0 auto 0.85rem" }}
          />
          <p
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: "0.06em",
              color: "oklch(0.48 0.02 265)",
            }}
          >
            SELECT A COMPETITION AND CLICK FETCH
          </p>
          <p
            style={{
              fontSize: "0.72rem",
              color: "oklch(0.36 0.02 265)",
              marginTop: 6,
            }}
          >
            Pulls scheduled matches from football-data.org (free tier)
          </p>
        </div>
      )}
    </div>
  );
}

// ---- Admin Dashboard ----
function AdminDashboard({
  token,
  onLogout,
}: { token: string; onLogout: () => void }) {
  const { data: predictions, isLoading } = usePredictions();
  const logoutMutation = useAdminLogout();
  const deleteMutation = useDeletePrediction();

  const [activeTab, setActiveTab] = useState<"predictions" | "import">(
    "predictions",
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Prediction | null>(null);
  const [prefillData, setPrefillData] = useState<
    Partial<PredictionForm> | undefined
  >(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Prediction | null>(null);

  async function handleLogout() {
    await logoutMutation.mutateAsync(token).catch(() => {});
    localStorage.removeItem(STORAGE_KEY);
    onLogout();
    toast.success("Logged out.");
  }

  function openAdd() {
    setEditTarget(null);
    setPrefillData(undefined);
    setFormOpen(true);
  }

  function openEdit(p: Prediction) {
    setEditTarget(p);
    setPrefillData(undefined);
    setFormOpen(true);
  }

  function openFromImport(prefill: Partial<PredictionForm>) {
    setEditTarget(null);
    setPrefillData(prefill);
    setActiveTab("predictions");
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const ok = await deleteMutation.mutateAsync({
        token,
        id: deleteTarget.id,
      });
      if (ok) {
        toast.success("Prediction deleted.");
      } else {
        toast.error("Failed to delete prediction.");
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setDeleteTarget(null);
    }
  }

  const tableHeadStyle = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: "0.70rem",
    letterSpacing: "0.1em",
    color: "oklch(0.50 0.02 265)",
    textTransform: "uppercase" as const,
    paddingBottom: "0.75rem",
  };

  const tabBtnStyle = (active: boolean) => ({
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: "0.82rem",
    letterSpacing: "0.08em",
    padding: "0.55rem 1.2rem",
    borderRadius: "0.45rem",
    cursor: "pointer",
    border: "none",
    transition: "all 0.15s",
    background: active ? "oklch(0.22 0.025 265)" : "transparent",
    color: active ? "oklch(0.95 0.01 265)" : "oklch(0.48 0.02 265)",
    borderBottom: active
      ? "2px solid oklch(0.82 0.22 142)"
      : "2px solid transparent",
  });

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Toaster />

      {/* Header */}
      <header
        style={{
          background: "oklch(0.10 0.02 265)",
          borderBottom: "1px solid oklch(0.28 0.025 265)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "oklch(0.50 0.02 265)",
                textDecoration: "none",
                fontSize: "0.78rem",
                marginRight: "0.5rem",
              }}
            >
              <ArrowLeft size={14} />
              Public
            </Link>
            <div
              style={{
                width: 1,
                height: 20,
                background: "oklch(0.28 0.025 265)",
              }}
            />
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={18}
                style={{ color: "oklch(0.82 0.22 142)" }}
              />
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  letterSpacing: "0.04em",
                  color: "oklch(0.96 0.01 265)",
                }}
              >
                ADMIN PANEL
              </span>
              <Badge
                style={{
                  background: "oklch(0.82 0.22 142 / 0.15)",
                  border: "1px solid oklch(0.82 0.22 142 / 0.35)",
                  color: "oklch(0.82 0.22 142)",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                }}
              >
                MARKUSBET
              </Badge>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            style={{
              background: "transparent",
              border: "1px solid oklch(0.65 0.22 25 / 0.4)",
              color: "oklch(0.75 0.15 25)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              letterSpacing: "0.05em",
              fontSize: "0.78rem",
            }}
          >
            {logoutMutation.isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut size={14} className="mr-1.5" />
            )}
            LOGOUT
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between mb-5"
        >
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
              MANAGE PREDICTIONS
            </h2>
            <p
              style={{
                fontSize: "0.72rem",
                color: "oklch(0.45 0.02 265)",
                marginTop: 3,
              }}
            >
              {isLoading
                ? "Loading..."
                : `${predictions?.length ?? 0} prediction${predictions?.length !== 1 ? "s" : ""} total`}
            </p>
          </div>

          {activeTab === "predictions" && (
            <Button
              onClick={openAdd}
              style={{
                background: "oklch(0.82 0.22 142)",
                color: "oklch(0.10 0.02 142)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: "0.88rem",
                letterSpacing: "0.06em",
              }}
            >
              <Plus size={16} className="mr-1.5" />
              ADD PREDICTION
            </Button>
          )}
        </motion.div>

        {/* Tab navigation */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          style={{
            display: "flex",
            gap: "0.25rem",
            background: "oklch(0.14 0.018 265)",
            border: "1px solid oklch(0.26 0.025 265)",
            borderRadius: "0.6rem",
            padding: "0.3rem",
            marginBottom: "1.5rem",
            width: "fit-content",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("predictions")}
            style={tabBtnStyle(activeTab === "predictions")}
          >
            ⚽ PREDICTIONS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("import")}
            style={tabBtnStyle(activeTab === "import")}
          >
            📥 IMPORT MATCHES
          </button>
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "predictions" ? (
            <motion.div
              key="predictions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* Predictions table */}
              <div
                style={{
                  background: "oklch(0.16 0.02 265)",
                  border: "1px solid oklch(0.28 0.025 265)",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                }}
              >
                {isLoading ? (
                  <div className="p-8 text-center space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 rounded-lg animate-pulse"
                        style={{ background: "oklch(0.20 0.025 265)" }}
                      />
                    ))}
                  </div>
                ) : !predictions || predictions.length === 0 ? (
                  <div className="p-12 text-center">
                    <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
                      ⚽
                    </p>
                    <p
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700,
                        fontSize: "1rem",
                        letterSpacing: "0.06em",
                        color: "oklch(0.50 0.02 265)",
                      }}
                    >
                      NO PREDICTIONS YET
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "oklch(0.38 0.02 265)",
                        marginTop: 6,
                      }}
                    >
                      Click "Add Prediction" or import from the "Import Matches"
                      tab.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: "1px solid oklch(0.24 0.025 265)",
                            background: "oklch(0.14 0.018 265)",
                          }}
                        >
                          <th
                            style={{
                              ...tableHeadStyle,
                              padding: "0.75rem 1rem",
                              textAlign: "left",
                            }}
                          >
                            Match
                          </th>
                          <th
                            style={{
                              ...tableHeadStyle,
                              padding: "0.75rem 0.75rem",
                              textAlign: "left",
                            }}
                          >
                            League
                          </th>
                          <th
                            style={{
                              ...tableHeadStyle,
                              padding: "0.75rem 0.75rem",
                              textAlign: "left",
                            }}
                          >
                            Prediction
                          </th>
                          <th
                            style={{
                              ...tableHeadStyle,
                              padding: "0.75rem 0.75rem",
                              textAlign: "center",
                            }}
                          >
                            Category
                          </th>
                          <th
                            style={{
                              ...tableHeadStyle,
                              padding: "0.75rem 0.75rem",
                              textAlign: "center",
                            }}
                          >
                            Odds
                          </th>
                          <th
                            style={{
                              ...tableHeadStyle,
                              padding: "0.75rem 0.75rem",
                              textAlign: "center",
                            }}
                          >
                            Conf.
                          </th>
                          <th
                            style={{
                              ...tableHeadStyle,
                              padding: "0.75rem 0.75rem",
                              textAlign: "left",
                            }}
                          >
                            Date
                          </th>
                          <th
                            style={{
                              ...tableHeadStyle,
                              padding: "0.75rem 1rem",
                              textAlign: "right",
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {predictions.map((p, i) => (
                            <motion.tr
                              key={String(p.id)}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 8 }}
                              transition={{ duration: 0.25, delay: i * 0.04 }}
                              style={{
                                borderBottom: "1px solid oklch(0.22 0.02 265)",
                              }}
                              className="hover:bg-[oklch(0.18_0.02_265)] transition-colors"
                            >
                              <td style={{ padding: "0.85rem 1rem" }}>
                                <div
                                  style={{
                                    fontFamily:
                                      "'Barlow Condensed', sans-serif",
                                    fontWeight: 700,
                                    fontSize: "0.90rem",
                                    color: "oklch(0.92 0.01 265)",
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {p.homeTeam}
                                  <span
                                    style={{
                                      color: "oklch(0.40 0.025 265)",
                                      margin: "0 0.3em",
                                    }}
                                  >
                                    vs
                                  </span>
                                  {p.awayTeam}
                                </div>
                              </td>
                              <td style={{ padding: "0.85rem 0.75rem" }}>
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    fontWeight: 600,
                                    color: "oklch(0.60 0.02 265)",
                                    background: "oklch(0.20 0.025 265)",
                                    padding: "0.2rem 0.5rem",
                                    borderRadius: "0.35rem",
                                    border: "1px solid oklch(0.28 0.025 265)",
                                    fontFamily:
                                      "'Barlow Condensed', sans-serif",
                                    letterSpacing: "0.04em",
                                    whiteSpace: "nowrap" as const,
                                  }}
                                >
                                  {p.league}
                                </span>
                              </td>
                              <td style={{ padding: "0.85rem 0.75rem" }}>
                                <span
                                  style={{
                                    fontFamily:
                                      "'Barlow Condensed', sans-serif",
                                    fontWeight: 700,
                                    fontSize: "0.82rem",
                                    color: "oklch(0.85 0.20 142)",
                                    letterSpacing: "0.04em",
                                  }}
                                >
                                  {p.prediction}
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: "0.85rem 0.75rem",
                                  textAlign: "center",
                                }}
                              >
                                {p.category === "parlay" ? (
                                  <span
                                    style={{
                                      fontFamily:
                                        "'Barlow Condensed', sans-serif",
                                      fontWeight: 800,
                                      fontSize: "0.65rem",
                                      letterSpacing: "0.10em",
                                      padding: "0.2rem 0.55rem",
                                      borderRadius: "0.3rem",
                                      background: "oklch(0.88 0.18 85 / 0.15)",
                                      border:
                                        "1px solid oklch(0.88 0.18 85 / 0.45)",
                                      color: "oklch(0.88 0.18 85)",
                                      whiteSpace: "nowrap" as const,
                                    }}
                                  >
                                    🎰 ΠΑΡΟΛΙ
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      fontFamily:
                                        "'Barlow Condensed', sans-serif",
                                      fontWeight: 800,
                                      fontSize: "0.65rem",
                                      letterSpacing: "0.10em",
                                      padding: "0.2rem 0.55rem",
                                      borderRadius: "0.3rem",
                                      background: "oklch(0.82 0.22 142 / 0.12)",
                                      border:
                                        "1px solid oklch(0.82 0.22 142 / 0.35)",
                                      color: "oklch(0.82 0.22 142)",
                                      whiteSpace: "nowrap" as const,
                                    }}
                                  >
                                    ⚽ SINGLE
                                  </span>
                                )}
                              </td>
                              <td
                                style={{
                                  padding: "0.85rem 0.75rem",
                                  textAlign: "center",
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily:
                                      "'Barlow Condensed', sans-serif",
                                    fontWeight: 700,
                                    fontSize: "0.88rem",
                                    color: "oklch(0.88 0.18 85)",
                                  }}
                                >
                                  {typeof p.odds === "number"
                                    ? p.odds.toFixed(2)
                                    : p.odds}
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: "0.85rem 0.75rem",
                                  textAlign: "center",
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily:
                                      "'Barlow Condensed', sans-serif",
                                    fontWeight: 700,
                                    fontSize: "0.82rem",
                                    color:
                                      Number(p.confidence) >= 70
                                        ? "oklch(0.82 0.22 142)"
                                        : Number(p.confidence) >= 40
                                          ? "oklch(0.80 0.18 85)"
                                          : "oklch(0.65 0.22 25)",
                                  }}
                                >
                                  {Number(p.confidence)}%
                                </span>
                              </td>
                              <td style={{ padding: "0.85rem 0.75rem" }}>
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    color: "oklch(0.52 0.02 265)",
                                    fontFamily: "'Barlow', sans-serif",
                                    whiteSpace: "nowrap" as const,
                                  }}
                                >
                                  {p.matchDate
                                    ? (() => {
                                        try {
                                          const d = new Date(p.matchDate);
                                          return Number.isNaN(d.getTime())
                                            ? p.matchDate
                                            : d.toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "2-digit",
                                              });
                                        } catch {
                                          return p.matchDate;
                                        }
                                      })()
                                    : "—"}
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: "0.85rem 1rem",
                                  textAlign: "right",
                                }}
                              >
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEdit(p)}
                                    style={{
                                      background: "oklch(0.22 0.025 265)",
                                      border: "1px solid oklch(0.30 0.025 265)",
                                      borderRadius: "0.4rem",
                                      padding: "0.3rem 0.6rem",
                                      color: "oklch(0.75 0.02 265)",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                      fontSize: "0.70rem",
                                      fontFamily:
                                        "'Barlow Condensed', sans-serif",
                                      fontWeight: 700,
                                      letterSpacing: "0.05em",
                                      transition: "all 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                      (
                                        e.currentTarget as HTMLButtonElement
                                      ).style.background =
                                        "oklch(0.26 0.025 265)";
                                    }}
                                    onMouseLeave={(e) => {
                                      (
                                        e.currentTarget as HTMLButtonElement
                                      ).style.background =
                                        "oklch(0.22 0.025 265)";
                                    }}
                                  >
                                    <Pencil size={12} />
                                    EDIT
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteTarget(p)}
                                    style={{
                                      background: "oklch(0.65 0.22 25 / 0.1)",
                                      border:
                                        "1px solid oklch(0.65 0.22 25 / 0.35)",
                                      borderRadius: "0.4rem",
                                      padding: "0.3rem 0.6rem",
                                      color: "oklch(0.75 0.15 25)",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                      fontSize: "0.70rem",
                                      fontFamily:
                                        "'Barlow Condensed', sans-serif",
                                      fontWeight: 700,
                                      letterSpacing: "0.05em",
                                      transition: "all 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                      (
                                        e.currentTarget as HTMLButtonElement
                                      ).style.background =
                                        "oklch(0.65 0.22 25 / 0.2)";
                                    }}
                                    onMouseLeave={(e) => {
                                      (
                                        e.currentTarget as HTMLButtonElement
                                      ).style.background =
                                        "oklch(0.65 0.22 25 / 0.1)";
                                    }}
                                  >
                                    <Trash2 size={12} />
                                    DEL
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ImportMatchesTab
                onCreatePrediction={openFromImport}
                token={token}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: "1.5rem",
            fontSize: "0.70rem",
            color: "oklch(0.35 0.02 265)",
            textAlign: "center",
          }}
        >
          Changes are immediately reflected on the public page.
        </motion.p>
      </main>

      {/* Modals */}
      <PredictionFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setPrefillData(undefined);
        }}
        editTarget={editTarget}
        token={token}
        prefillData={prefillData}
      />
      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
        predictionLabel={
          deleteTarget
            ? `${deleteTarget.homeTeam} vs ${deleteTarget.awayTeam}`
            : ""
        }
      />
    </div>
  );
}

// ---- Main Admin Panel ----
export default function AdminPanel() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(!!token);

  const authQuery = useIsAdminAuthenticated(token);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      setVerified(false);
      return;
    }
    if (authQuery.isSuccess) {
      if (authQuery.data) {
        setVerified(true);
      } else {
        // Token expired/invalid
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setVerified(false);
      }
      setChecking(false);
    }
    if (authQuery.isError) {
      setChecking(false);
    }
  }, [authQuery.isSuccess, authQuery.data, authQuery.isError, token]);

  function handleLogin(newToken: string) {
    setToken(newToken);
    setVerified(true);
  }

  function handleLogout() {
    setToken(null);
    setVerified(false);
  }

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2
            size={32}
            style={{
              color: "oklch(0.82 0.22 142)",
              animation: "spin 1s linear infinite",
            }}
          />
          <p
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              letterSpacing: "0.1em",
              fontSize: "0.80rem",
              color: "oklch(0.45 0.02 265)",
            }}
          >
            VERIFYING SESSION...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!token || !verified) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard token={token} onLogout={handleLogout} />;
}
