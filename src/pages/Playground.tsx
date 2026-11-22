import { Helmet } from "react-helmet-async";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { ArrowRight, RefreshCw, Info, AlertTriangle, CheckCircle, XCircle, Zap, Loader2 } from "lucide-react";
import { FormatBadge } from "../components/MatchFormat";

const VALID_NUMBERS = [0, 1, 2, 3, 4, 6] as const;
type ValidNumber = typeof VALID_NUMBERS[number];

const BOWLER_NORMAL = [1, 2, 3, 4, 6] as const;
const BOWLER_WITH_ZERO = [0, 1, 2, 3, 4, 6] as const;

const PHASES_T15 = [
  { name: "Powerplay", overs: 5, boundaries: 2 },
  { name: "Middle", overs: 5, boundaries: 1 },
  { name: "Death", overs: 5, boundaries: 2 },
] as const;

const DISMISSAL_TYPES = ["Bowled", "Caught", "LBW", "Run Out", "Stumped"] as const;

function getRandomDismissal(): string {
  return DISMISSAL_TYPES[Math.floor(Math.random() * DISMISSAL_TYPES.length)];
}

function ballsToOvers(balls: number): string {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

function getPhaseT15(balls: number): number {
  return Math.min(3, Math.floor(balls / 5) + 1);
}

function getSessionTest(balls: number): number {
  return Math.min(3, Math.floor(balls / 30) + 1);
}

function canScoreBoundaryTest(batterBallsInInnings: number, boundariesThisOver: number): boolean {
  if (batterBallsInInnings >= 15) {
    return boundariesThisOver < 2;
  }
  return boundariesThisOver < 1;
}

function canScoreBoundaryT15(phase: number, boundariesThisOver: number): boolean {
  return boundariesThisOver < PHASES_T15[phase - 1].boundaries;
}

function canBatterChooseZero(consecutiveZeros: number): boolean {
  return consecutiveZeros < 3;
}

function getBowlerAllowed(bowler: BowlerState, inningBalls: number): readonly ValidNumber[] {
  if (bowler.isOnHatTrick || (inningBalls >= 6 && bowler.lastOverMaiden && !bowler.zeroByBowler)) {
    return BOWLER_WITH_ZERO;
  }
  return BOWLER_NORMAL;
}

interface DeliveryResult {
  batterChoice: ValidNumber;
  bowlerChoice: ValidNumber;
  outcome: "runs" | "wicket";
  runs: number;
  isWicket: boolean;
  dismissal?: string;
  phaseOrSession: number;
}

interface BatterState {
  runs: number;
  balls: number;
  ballsThisOver: number;
  boundariesThisOver: number;
  consecutiveZeros: number;
  fours: number;
  sixes: number;
}

interface BowlerState {
  runsConceded: number;
  balls: number;
  wickets: number;
  maidenOvers: number;
  lastOverMaiden: boolean;
  currentOverRuns: number;
  isOnHatTrick: boolean;
  zeroByBowler: boolean;
  timeline: string[];
}

interface InningsState {
  runs: number;
  wickets: number;
  balls: number;
}

interface PlaygroundState {
  format: "test" | "t15";
  batter: BatterState;
  bowler: BowlerState;
  innings: InningsState;
  history: Array<{
    ball: number;
    result: DeliveryResult;
    batterRuns: number;
    batterBalls: number;
    bowlerRuns: number;
    bowlerBalls: number;
    bowlerWickets: number;
    totalRuns: number;
    wickets: number;
  }>;
}

const INITIAL_BATTER: BatterState = {
  runs: 0,
  balls: 0,
  ballsThisOver: 0,
  boundariesThisOver: 0,
  consecutiveZeros: 0,
  fours: 0,
  sixes: 0,
};

const INITIAL_BOWLER: BowlerState = {
  runsConceded: 0,
  balls: 0,
  wickets: 0,
  maidenOvers: 0,
  lastOverMaiden: false,
  currentOverRuns: 0,
  isOnHatTrick: false,
  zeroByBowler: false,
  timeline: [],
};

const INITIAL_INNINGS: InningsState = {
  runs: 0,
  wickets: 0,
  balls: 0,
};

const INITIAL_STATE: PlaygroundState = {
  format: "test",
  batter: INITIAL_BATTER,
  bowler: INITIAL_BOWLER,
  innings: INITIAL_INNINGS,
  history: [],
};

export function Playground() {
  const [state, setState] = useState<PlaygroundState>(INITIAL_STATE);
  const [batterChoice, setBatterChoice] = useState<ValidNumber | null>(null);
  const [lastResult, setLastResult] = useState<DeliveryResult | null>(null);
  const [isBowling, setIsBowling] = useState(false);
  const bowlTimeoutRef = useRef<number | null>(null);

  const phaseOrSession = useMemo(() => {
    if (state.format === "t15") return getPhaseT15(state.innings.balls);
    return getSessionTest(state.innings.balls);
  }, [state.format, state.innings.balls]);

  const overs = ballsToOvers(state.innings.balls);
  const batterSR = state.batter.balls > 0 ? ((state.batter.runs / state.batter.balls) * 100).toFixed(2) : "0.00";
  const bowlerEcon = state.bowler.balls > 0 ? ((state.bowler.runsConceded / state.bowler.balls) * 6).toFixed(2) : "0.00";

  const canBoundary = useMemo(() => {
    if (state.format === "test") {
      return canScoreBoundaryTest(state.batter.balls, state.batter.boundariesThisOver);
    }
    return canScoreBoundaryT15(phaseOrSession, state.batter.boundariesThisOver);
  }, [state.format, state.batter.balls, state.batter.boundariesThisOver, phaseOrSession]);

  const canZero = canBatterChooseZero(state.batter.consecutiveZeros);
  const bowlerAllowed = getBowlerAllowed(state.bowler, state.innings.balls);
  const canBowlerChooseZero = bowlerAllowed.includes(0);

  const simulateDelivery = useCallback((): DeliveryResult => {
    const bChoice = batterChoice ?? VALID_NUMBERS[Math.floor(Math.random() * VALID_NUMBERS.length)];
    const wChoice = bowlerAllowed[Math.floor(Math.random() * bowlerAllowed.length)];

    let outcome: DeliveryResult["outcome"] = "runs";
    let runs = 0;
    let isWicket = false;
    let dismissal: string | undefined;

    if (bChoice === wChoice) {
      outcome = "wicket";
      isWicket = true;
      dismissal = getRandomDismissal();
      runs = 0;
    } else {
      runs = bChoice;
    }

    return {
      batterChoice: bChoice,
      bowlerChoice: wChoice,
      outcome,
      runs,
      isWicket,
      dismissal,
      phaseOrSession,
    };
  }, [batterChoice, bowlerAllowed, canBoundary, canZero, phaseOrSession]);

  const playBall = useCallback(() => {
    if (isBowling) return;
    
    setIsBowling(true);
    
    bowlTimeoutRef.current = window.setTimeout(() => {
      const result = simulateDelivery();
      setLastResult(result);

      setState((prev) => {
        const newBatterBallsThisOver = (prev.batter.ballsThisOver + 1) % 6;
        const isNewOver = newBatterBallsThisOver === 0;

        const isBoundary = result.batterChoice === 4 || result.batterChoice === 6;
        const newBoundariesThisOver = isNewOver ? 0 : prev.batter.boundariesThisOver + (isBoundary ? 1 : 0);

        const newBatter: BatterState = {
          ...prev.batter,
          runs: prev.batter.runs + (result.isWicket ? 0 : result.runs),
          balls: prev.batter.balls + 1,
          ballsThisOver: newBatterBallsThisOver,
          boundariesThisOver: newBoundariesThisOver,
          consecutiveZeros: result.batterChoice === 0 ? prev.batter.consecutiveZeros + 1 : 0,
          fours: prev.batter.fours + (result.batterChoice === 4 ? 1 : 0),
          sixes: prev.batter.sixes + (result.batterChoice === 6 ? 1 : 0),
        };

        const newBowlerRuns = prev.bowler.runsConceded + result.runs;
        const newBowlerBalls = prev.bowler.balls + 1;
        const newBowlerCurrentOverRuns = prev.bowler.currentOverRuns + result.runs;
        const newBowlerIsNewOver = newBowlerBalls % 6 === 0;

        let newMaidenOvers = prev.bowler.maidenOvers;
        let newLastOverMaiden = false;
        let newZeroByBowler = prev.bowler.zeroByBowler;

        if (newBowlerIsNewOver) {
          newLastOverMaiden = prev.bowler.currentOverRuns === 0 && prev.bowler.balls > 0;
          if (newLastOverMaiden) newMaidenOvers += 1;
          if (newLastOverMaiden) newZeroByBowler = false;
        }
        if (result.runs > 0) {
          newZeroByBowler = true;
        }

        const newTimeline = [...prev.bowler.timeline];
        if (result.isWicket) newTimeline.push("W");
        else newTimeline.push(String(result.runs));
        if (newTimeline.length > 2) newTimeline.shift();

        const newIsOnHatTrick = newTimeline.length === 2 && newTimeline[0] === "W" && newTimeline[1] === "W";

        const newBowler: BowlerState = {
          ...prev.bowler,
          runsConceded: newBowlerRuns,
          balls: newBowlerBalls,
          wickets: prev.bowler.wickets + (result.isWicket ? 1 : 0),
          maidenOvers: newMaidenOvers,
          lastOverMaiden: newLastOverMaiden,
          currentOverRuns: newBowlerIsNewOver ? 0 : newBowlerCurrentOverRuns,
          isOnHatTrick: newIsOnHatTrick,
          zeroByBowler: newZeroByBowler,
          timeline: newTimeline,
        };

        const newInnings: InningsState = {
          runs: prev.innings.runs + result.runs,
          wickets: prev.innings.wickets + (result.isWicket ? 1 : 0),
          balls: prev.innings.balls + 1,
        };

        const newHistory = [
          ...prev.history,
          {
            ball: prev.innings.balls + 1,
            result,
            batterRuns: newBatter.runs,
            batterBalls: newBatter.balls,
            bowlerRuns: newBowler.runsConceded,
            bowlerBalls: newBowler.balls,
            bowlerWickets: newBowler.wickets,
            totalRuns: newInnings.runs,
            wickets: newInnings.wickets,
          },
        ];

        return {
          ...prev,
          batter: newBatter,
          bowler: newBowler,
          innings: newInnings,
          history: newHistory,
        };
      });

      setBatterChoice(null);
      setIsBowling(false);
    }, 600);
  }, [simulateDelivery, isBowling]);

  useEffect(() => {
    if (batterChoice !== null && !isBowling) {
      playBall();
    }
  }, [batterChoice, isBowling, playBall]);

  useEffect(() => {
    return () => {
      if (bowlTimeoutRef.current) {
        window.clearTimeout(bowlTimeoutRef.current);
      }
    };
  }, []);

  const resetInnings = () => {
    if (bowlTimeoutRef.current) {
      window.clearTimeout(bowlTimeoutRef.current);
    }
    setState((prev) => ({ ...INITIAL_STATE, format: prev.format }));
    setLastResult(null);
    setBatterChoice(null);
    setIsBowling(false);
  };

  const toggleFormat = () => {
    setState((prev) => ({ ...prev, format: prev.format === "t15" ? "test" : "t15" }));
    // Reset innings after format change
    setTimeout(() => resetInnings(), 0);
  };

  const getOutcomeLabel = (result: DeliveryResult): { label: string; className: string; icon: React.ReactNode } => {
    switch (result.outcome) {
      case "wicket":
        return {
          label: `Wicket — ${result.dismissal}`,
          className: "text-ball",
          icon: <XCircle className="h-4 w-4" aria-hidden="true" />,
        };
      default:
        return {
          label: `${result.runs} run${result.runs !== 1 ? "s" : ""}`,
          className: "text-paper",
          icon: <CheckCircle className="h-4 w-4" aria-hidden="true" />,
        };
    }
  };

  const phaseLabel = state.format === "t15" 
    ? `Phase ${phaseOrSession} / 3 · ${PHASES_T15[phaseOrSession - 1].name} · ${PHASES_T15[phaseOrSession - 1].boundaries} boundary${PHASES_T15[phaseOrSession - 1].boundaries !== 1 ? "s" : ""} per batter/over`
    : `Session ${phaseOrSession} / 3`;

  const batterNumbers = VALID_NUMBERS.filter((num) => {
    if (num === 0) return canZero;
    if (num === 4 || num === 6) return canBoundary;
    return true;
  });

  return (
    <>
      <Helmet>
        <title>Playground · Ashes</title>
        <meta name="description" content="Interactive playground to understand Ashes cricket mechanics. Play as batter, bowler auto-selects. Learn Test and T15 rules." />
        <meta property="og:title" content="Playground · Ashes" />
        <meta property="og:description" content="Interactive playground to understand Ashes cricket mechanics. Play as batter, bowler auto-selects. Learn Test and T15 rules." />
      </Helmet>

      <div className="flex flex-col gap-12 max-w-[1200px] mx-auto w-full px-4">
        <header className="border-b border-rule pb-8">
          <p className="label">Interactive playground</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">Understand the game</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper-soft">
            You are the <strong>batter</strong>. Pick a number (0,1,2,3,4,6) — the bowler chooses automatically.
            Same number = wicket. Different = you score your number. Learn the rules by playing.
          </p>
        </header>

        <section aria-labelledby="format-toggle-heading" className="border-y border-rule py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h2 id="format-toggle-heading" className="display text-2xl">
                Format: <span className={`font-mono ${state.format === "t15" ? "text-t15" : "text-test"}`}>{state.format.toUpperCase()}</span>
              </h2>
              <p className="mt-1 text-sm text-paper-mute">
                {state.format === "t15"
                  ? "Two innings of 15 overs. Boundary limits change by phase (PP/Middle/Death)."
                  : "Four innings. 1 boundary/over until 15 balls faced in innings, then 2/over. Declarations & follow-on."}
              </p>
            </div>
            <button
              onClick={toggleFormat}
              className="btn btn-quiet shrink-0"
              aria-pressed={state.format === "test"}
            >
              Switch to {state.format === "t15" ? "Test" : "T15"}
            </button>
          </div>

          <FormatKey />
        </section>

        <section aria-labelledby="match-state-heading" className="border-y border-rule py-6">
          <h2 id="match-state-heading" className="label mb-4">Match state</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="panel p-4">
              <p className="label">Over</p>
              <p className="display mt-1 text-3xl tabular-nums">{overs}</p>
              <p className="mt-1 text-sm text-paper-mute">{phaseLabel}</p>
            </div>
            <div className="panel p-4">
              <p className="label">Batter</p>
              <p className="display mt-1 text-3xl tabular-nums">{state.batter.runs} ({state.batter.balls})</p>
              <p className="mt-1 text-sm text-paper-mute">SR: {batterSR} · 4s: {state.batter.fours} · 6s: {state.batter.sixes}</p>
            </div>
            <div className="panel p-4">
              <p className="label">Bowler</p>
              <p className="display mt-1 text-3xl tabular-nums">{state.bowler.runsConceded}/{state.bowler.wickets} ({ballsToOvers(state.bowler.balls)})</p>
              <p className="mt-1 text-sm text-paper-mute">Econ: {bowlerEcon} · Maidens: {state.bowler.maidenOvers}</p>
            </div>
            <div className="panel p-4">
              <p className="label">Innings</p>
              <p className="display mt-1 text-3xl tabular-nums">{state.innings.runs}/{state.innings.wickets}</p>
              <p className="mt-1 text-sm text-paper-mute">
                {state.format === "t15" ? `${Math.max(0, 90 - state.innings.balls)} balls left` : "Test — no ball limit"}
              </p>
            </div>
          </div>

          <div className="mt-4 panel p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className={`label ${canBoundary ? "text-paper" : "text-paper-mute"}`}>
                {canBoundary ? "✓" : "✗"} Boundary available
              </span>
              <span className={`label ${canZero ? "text-paper" : "text-paper-mute"}`}>
                {canZero ? "✓" : "✗"} Zero available ({state.batter.consecutiveZeros}/3)
              </span>
              <span className="label text-paper-mute">Balls this over: {state.batter.ballsThisOver}/6</span>
              <span className="label text-paper-mute">Boundaries this over: {state.batter.boundariesThisOver}</span>
              {state.bowler.isOnHatTrick && (
                <span className="label text-ball flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                  Bowler on hat-trick — can bowl 0
                </span>
              )}
              {state.innings.balls >= 6 && state.bowler.lastOverMaiden && !state.bowler.zeroByBowler && (
                <span className="label text-lobby flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                  Maiden over — bowler can bowl 0
                </span>
              )}
            </div>
          </div>
        </section>

        <section aria-labelledby="delivery-heading" className="border-y border-rule py-6">
          <h2 id="delivery-heading" className="label mb-4">Play a delivery</h2>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6 min-w-0">
              <div>
                <h3 className="label mb-3">Your shot (batter)</h3>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Batter number choices">
                  {batterNumbers.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => { if (!isBowling) setBatterChoice(num); }}
                      aria-pressed={batterChoice === num}
                      disabled={isBowling}
                      className={`btn w-14 h-14 px-0 ${batterChoice === num ? "btn-solid" : "btn-quiet"} ${isBowling ? "opacity-40 cursor-not-allowed" : ""} transition-all duration-150`}
                      aria-label={`Batter chooses ${num}`}
                    >
                      {batterChoice === num && isBowling ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : num}
                    </button>
                  ))}
                  {(!canZero || !canBoundary) && (
                    <span className="btn w-14 h-14 px-0 opacity-20 cursor-not-allowed" aria-hidden="true">—</span>
                  )}
                </div>
                <p className="mt-2 text-xs text-paper-mute">
                  Valid: {batterNumbers.join(", ")}. 
                  {!canBoundary && "4/6 unavailable (boundary limit reached)."}
                  {!canZero && " 0 unavailable (3 consecutive dots)."}
                </p>
              </div>

              <div className="panel p-4 bg-ink-sunken min-w-0">
                <h3 className="label mb-3">Bowler (auto)</h3>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Bowler number choices (auto)">
                  {bowlerAllowed.map((num) => (
                    <span
                      key={num}
                      className={`btn w-14 h-14 px-0 btn-quiet ${canBowlerChooseZero && num === 0 ? "text-ball border-ball/50" : ""} ${isBowling && lastResult?.bowlerChoice === num ? "bg-ball/20 border-ball" : ""} transition-all duration-150`}
                      aria-label={`Bowler can choose ${num}`}
                    >
                      {num}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-paper-mute">
                  Bowler picks randomly from allowed numbers. 
                  {canBowlerChooseZero ? "0 is allowed (hat-trick or maiden over)." : "0 not allowed."}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={resetInnings}
                  className="btn btn-quiet"
                >
                  Reset innings
                </button>
              </div>
            </div>

            <aside className="border-l border-rule pl-4 lg:pl-6 min-w-0 max-w-[320px] w-full lg:w-auto flex-shrink-0">
              <h3 className="label mb-4">Last delivery</h3>
              {lastResult ? (
                <div className="space-y-4 min-w-0">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="panel p-4 min-w-0">
                      <p className="label">Batter</p>
                      <p className="display mt-2 text-3xl">{lastResult.batterChoice}</p>
                    </div>
                    <div className="panel p-4 min-w-0">
                      <p className="label">Bowler</p>
                      <p className="display mt-2 text-3xl">{lastResult.bowlerChoice}</p>
                    </div>
                  </div>
                  <div className="panel p-4 min-w-0">
                    {(() => {
                      const { label, className, icon } = getOutcomeLabel(lastResult);
                      return (
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <span className={`display ${className} whitespace-nowrap`}>{icon} {label}</span>
                        </div>
                      );
                    })()}
                  </div>
                  <details className="group">
                    <summary className="details-summary flex items-center justify-between cursor-pointer text-sm text-paper-mute">
                      <span>Why this result?</span>
                      <Info className="h-4 w-4 transition-transform group-open:rotate-90 flex-shrink-0" aria-hidden="true" />
                    </summary>
                    <div className="mt-3 text-sm text-paper-soft space-y-2">
                      {lastResult.outcome === "wicket" && (
                        <p>Numbers match ({lastResult.batterChoice} = {lastResult.bowlerChoice}) → batter is out ({lastResult.dismissal}).</p>
                      )}
                      {lastResult.outcome === "runs" && (
                        <p>Numbers differ ({lastResult.batterChoice} ≠ {lastResult.bowlerChoice}) → batter scores {lastResult.runs} run{lastResult.runs !== 1 ? "s" : ""}.</p>
                      )}
                    </div>
                  </details>
                </div>
              ) : (
                <p className="text-sm text-paper-mute text-center py-8">No delivery played yet</p>
              )}

              {state.history.length > 0 && (
                <div className="mt-6 min-w-0">
                  <h3 className="label mb-3">Recent deliveries</h3>
                  <div className="overflow-x-auto max-h-64">
                    <table className="data-table text-xs min-w-max">
                      <thead>
                        <tr>
                          <th>Ball</th>
                          <th>B</th>
                          <th>Bw</th>
                          <th>Result</th>
                          <th>Batter</th>
                          <th>Bowler</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.history.slice(-10).map((h) => (
                          <tr key={h.ball}>
                            <td className="num">{h.ball}</td>
                            <td className="num">{h.result.batterChoice}</td>
                            <td className="num">{h.result.bowlerChoice}</td>
                            <td>
                              {h.result.isWicket ? (
                                <span className="text-ball">W</span>
                              ) : (
                                <span className="num">{h.result.runs}</span>
                              )}
                            </td>
                            <td className="num">{h.batterRuns} ({h.batterBalls})</td>
                            <td className="num">{h.bowlerRuns}/{h.bowlerWickets} ({ballsToOvers(h.bowlerBalls)})</td>
                            <td className="num">{h.totalRuns}/{h.wickets}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>

        <section aria-labelledby="rules-heading" className="border-y border-rule py-6">
          <h2 id="rules-heading" className="label mb-4">Rules reference</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="panel p-6">
              <h3 className="display text-xl">Core mechanic</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-paper-soft">
                <li>
                  <strong>Valid numbers:</strong> 0, 1, 2, 3, 4, 6. There is no 5.
                </li>
                <li>
                  <strong>Same number:</strong> batter is out (wicket).
                </li>
                <li>
                  <strong>Different numbers:</strong> batter scores their chosen number.
                </li>
                <li>
                  <strong>Batter chooses 0:</strong> scores 0 runs (dot ball). Can't choose 0 more than 3 times consecutively — 4th 0 is not allowed.
                </li>
                <li>
                  <strong>Bowler choices:</strong> 1,2,3,4,6 normally. <strong>0 only on hat-trick ball</strong> (previous 2 balls were wickets) or <strong>after a maiden over</strong> (first ball of new over, previous over 0 runs, no 0 bowled yet this innings).
                </li>
                <li>
                  <strong>Boundary limit:</strong> When reached, 4 and 6 are not available as options.
                </li>
              </ul>
            </article>

            <article className="panel p-6">
              <h3 className="display text-xl">{state.format === "t15" ? "T15 format" : "Test format"}</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-paper-soft">
                {state.format === "t15" ? (
                  <>
                    <li>
                      <strong>Two innings</strong> of 15 overs (90 balls) each.
                    </li>
                    <li>
                      <strong>Phases</strong> (5 overs each): Powerplay (2 boundaries), Middle (1 boundary), Death (2 boundaries) per batter per over.
                    </li>
                    <li>
                      <strong>Boundary limit</strong> resets each over for each batter.
                    </li>
                    <li>
                      <strong>Result:</strong> highest total after two innings wins. Tie possible.
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <strong>Four innings</strong> (three if a team wins by an innings). Host sets overs before toss.
                    </li>
                    <li>
                      <strong>Boundary limit:</strong> 1 per batter per over until batter has faced 15 balls in the innings, then 2 per over.
                    </li>
                    <li>
                      <strong>Declarations</strong> allowed when ahead. <strong>Follow-on</strong> enforced if lead exceeds limit.
                    </li>
                    <li>
                      <strong>Sessions:</strong> 3 per day. Draw if time runs out without result.
                    </li>
                  </>
                )}
              </ul>
            </article>
          </div>
        </section>

        <section aria-labelledby="examples-heading" className="border-y border-rule py-6">
          <h2 id="examples-heading" className="label mb-4">Common scenarios</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { batter: 2, bowler: 3, desc: "Numbers differ → batter scores 2 runs", format: "both" },
              { batter: 3, bowler: 3, desc: "Numbers match → wicket (bowled/caught/LBW/run out/stumped)", format: "both" },
              { batter: 4, bowler: 1, desc: "Boundary hit → 4 runs (if boundary available)", format: "both" },
              { batter: 6, bowler: 2, desc: "Six hit → 6 runs (if boundary available)", format: "both" },
              { batter: 0, bowler: 4, desc: "Dot ball → 0 runs. Three dots in a row → next 0 not allowed", format: "both" },
              { batter: 4, bowler: 2, desc: "Boundary limit reached → 4/6 not available", format: "both" },
              { batter: 1, bowler: 0, desc: "Quick single vs 0 (bowler on hat-trick/maiden)", format: "both" },
              { batter: 2, bowler: 4, desc: "Two runs → good for strike rotation in death overs", format: "t15" },
              { batter: 3, bowler: 0, desc: "Three runs → rare but valuable in Test cricket", format: "test" },
            ].filter((s) => s.format === "both" || s.format === state.format).map((scenario, i) => (
              <div key={i} className="panel p-4 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="btn btn-solid w-10 h-10 px-0 flex-shrink-0">{scenario.batter}</span>
                    <span className="label text-paper-mute">vs</span>
                    <span className="btn btn-quiet w-10 h-10 px-0 flex-shrink-0">{scenario.bowler}</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-ball shrink-0" aria-hidden="true" />
                </div>
                <p className="text-sm text-paper-soft">{scenario.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function FormatKey() {
  return (
    <details className="mt-4 group">
      <summary className="details-summary flex items-center justify-between cursor-pointer label text-paper-mute">
        <span>Format key</span>
        <Info className="h-4 w-4 transition-transform group-open:rotate-90" aria-hidden="true" />
      </summary>
      <div className="mt-3 border-y border-rule">
        <div className="grid gap-2 border-b border-rule-soft py-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-baseline">
          <FormatBadge format="test" detail />
          <p className="text-sm leading-relaxed text-paper-mute">Four innings. Declarations, follow-on and draws are in play.</p>
        </div>
        <div className="grid gap-2 py-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-baseline">
          <FormatBadge format="t15" detail />
          <p className="text-sm leading-relaxed text-paper-mute">Two innings of 15 overs. Boundaries are limited by phase.</p>
        </div>
      </div>
    </details>
  );
}