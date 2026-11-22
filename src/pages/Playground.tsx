import { Helmet } from "react-helmet-async";
import { useState, useCallback } from "react";
import { ArrowRight, RefreshCw, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { FormatBadge } from "../components/MatchFormat";

const VALID_NUMBERS = [0, 1, 2, 3, 4, 6] as const;
type ValidNumber = typeof VALID_NUMBERS[number];

const PHASES = {
  test: { name: "Session", boundaries: 1, oversPerPhase: 30 },
  t15: { name: "Phase", boundaries: [2, 1, 2], oversPerPhase: 5 },
};

const DISMISSAL_TYPES = ["Bowled", "Caught", "LBW", "Run Out", "Stumped"] as const;

function getRandomDismissal(): string {
  return DISMISSAL_TYPES[Math.floor(Math.random() * DISMISSAL_TYPES.length)];
}

function ballsToOvers(balls: number): string {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

function getPhase(format: "test" | "t15", balls: number): number {
  if (format === "test") return Math.min(3, Math.floor(balls / 30) + 1);
  return Math.min(3, Math.floor(balls / 5) + 1);
}

function canScoreBoundary(format: "test" | "t15", batterBallsThisOver: number, boundariesThisOver: number): boolean {
  if (format === "test") {
    return boundariesThisOver < (batterBallsThisOver >= 15 ? 2 : 1);
  }
  const phase = getPhase("t15", batterBallsThisOver);
  return boundariesThisOver < PHASES.t15.boundaries[phase - 1];
}

function canChooseZero(consecutiveZeros: number): boolean {
  return consecutiveZeros < 3;
}

interface DeliveryResult {
  batterChoice: ValidNumber;
  bowlerChoice: ValidNumber;
  outcome: "runs" | "wicket" | "boundary-blocked" | "zero-blocked";
  runs: number;
  isWicket: boolean;
  dismissal?: string;
  boundaryBlocked?: boolean;
  zeroBlocked?: boolean;
  phase?: number;
}

interface PlaygroundState {
  format: "test" | "t15";
  inningsBalls: number;
  batterBallsThisOver: number;
  boundariesThisOver: number;
  consecutiveZeros: number;
  batterRuns: number;
  batterBalls: number;
  bowlerRunsConceded: number;
  bowlerBalls: number;
  bowlerWickets: number;
  wickets: number;
  totalRuns: number;
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

const INITIAL_STATE: PlaygroundState = {
  format: "t15",
  inningsBalls: 0,
  batterBallsThisOver: 0,
  boundariesThisOver: 0,
  consecutiveZeros: 0,
  batterRuns: 0,
  batterBalls: 0,
  bowlerRunsConceded: 0,
  bowlerBalls: 0,
  bowlerWickets: 0,
  wickets: 0,
  totalRuns: 0,
  history: [],
};

export function Playground() {
  const [state, setState] = useState<PlaygroundState>(INITIAL_STATE);
  const [batterChoice, setBatterChoice] = useState<ValidNumber | null>(null);
  const [bowlerChoice, setBowlerChoice] = useState<ValidNumber | null>(null);
  const [lastResult, setLastResult] = useState<DeliveryResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const phase = getPhase(state.format, state.inningsBalls);
  const overs = ballsToOvers(state.inningsBalls);
  const batterSR = state.batterBalls > 0 ? ((state.batterRuns / state.batterBalls) * 100).toFixed(2) : "0.00";
  const bowlerEcon = state.bowlerBalls > 0 ? ((state.bowlerRunsConceded / state.bowlerBalls) * 6).toFixed(2) : "0.00";
  const canBoundary = canScoreBoundary(state.format, state.batterBallsThisOver, state.boundariesThisOver);
  const canZero = canChooseZero(state.consecutiveZeros);

  const simulateDelivery = useCallback((): DeliveryResult => {
    const bChoice = batterChoice ?? VALID_NUMBERS[Math.floor(Math.random() * VALID_NUMBERS.length)];
    const wChoice = bowlerChoice ?? VALID_NUMBERS[Math.floor(Math.random() * VALID_NUMBERS.length)];

    let outcome: DeliveryResult["outcome"] = "runs";
    let runs = 0;
    let isWicket = false;
    let dismissal: string | undefined;
    let boundaryBlocked = false;
    let zeroBlocked = false;

    if (bChoice === wChoice) {
      outcome = "wicket";
      isWicket = true;
      dismissal = getRandomDismissal();
      runs = 0;
    } else {
      if (bChoice === 0) {
        if (!canZero) {
          outcome = "zero-blocked";
          zeroBlocked = true;
          runs = 1;
        } else {
          runs = 0;
        }
      } else if (bChoice === 4 || bChoice === 6) {
        if (!canBoundary) {
          outcome = "boundary-blocked";
          boundaryBlocked = true;
          runs = 3;
        } else {
          runs = bChoice;
        }
      } else {
        runs = bChoice;
      }
    }

    return {
      batterChoice: bChoice,
      bowlerChoice: wChoice,
      outcome,
      runs,
      isWicket,
      dismissal,
      boundaryBlocked,
      zeroBlocked,
      phase,
    };
  }, [batterChoice, bowlerChoice, canBoundary, canZero, phase]);

  const playBall = () => {
    const result = simulateDelivery();
    setLastResult(result);

    setState((prev) => {
      const newBatterBallsThisOver = (prev.batterBallsThisOver + 1) % 6;
      const newBoundariesThisOver = newBatterBallsThisOver === 0 ? 0 : prev.boundariesThisOver;
      const newConsecutiveZeros = result.batterChoice === 0 ? prev.consecutiveZeros + 1 : 0;
      const newBoundariesCount = (result.batterChoice === 4 || result.batterChoice === 6) && !result.boundaryBlocked
        ? prev.boundariesThisOver + 1
        : prev.boundariesThisOver;

      const newHistory = [
        ...prev.history,
        {
          ball: prev.inningsBalls + 1,
          result,
          batterRuns: prev.batterRuns + (result.isWicket ? 0 : result.runs),
          batterBalls: prev.batterBalls + 1,
          bowlerRuns: prev.bowlerRunsConceded + result.runs,
          bowlerBalls: prev.bowlerBalls + 1,
          bowlerWickets: prev.bowlerWickets + (result.isWicket ? 1 : 0),
          totalRuns: prev.totalRuns + result.runs,
          wickets: prev.wickets + (result.isWicket ? 1 : 0),
        },
      ];

      return {
        ...prev,
        format: prev.format,
        inningsBalls: prev.inningsBalls + 1,
        batterBallsThisOver: newBatterBallsThisOver,
        boundariesThisOver: newBoundariesCount,
        consecutiveZeros: newConsecutiveZeros,
        batterRuns: prev.batterRuns + (result.isWicket ? 0 : result.runs),
        batterBalls: prev.batterBalls + 1,
        bowlerRunsConceded: prev.bowlerRunsConceded + result.runs,
        bowlerBalls: prev.bowlerBalls + 1,
        bowlerWickets: prev.bowlerWickets + (result.isWicket ? 1 : 0),
        wickets: prev.wickets + (result.isWicket ? 1 : 0),
        totalRuns: prev.totalRuns + result.runs,
        history: newHistory,
      };
    });

    setBatterChoice(null);
    setBowlerChoice(null);
  };

  const resetInnings = () => {
    setState(INITIAL_STATE);
    setLastResult(null);
    setBatterChoice(null);
    setBowlerChoice(null);
  };

  const toggleFormat = () => {
    setState((prev) => ({ ...prev, format: prev.format === "t15" ? "test" : "t15" }));
    resetInnings();
  };

  const getOutcomeLabel = (result: DeliveryResult): { label: string; className: string; icon: React.ReactNode } => {
    switch (result.outcome) {
      case "wicket":
        return {
          label: `Wicket — ${result.dismissal}`,
          className: "text-ball",
          icon: <XCircle className="h-4 w-4" aria-hidden="true" />,
        };
      case "boundary-blocked":
        return {
          label: `Boundary blocked → 3 runs`,
          className: "text-t15",
          icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
        };
      case "zero-blocked":
        return {
          label: `Third consecutive 0 blocked → 1 run`,
          className: "text-lobby",
          icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
        };
      default:
        return {
          label: `${result.runs} run${result.runs !== 1 ? "s" : ""}`,
          className: "text-paper",
          icon: <CheckCircle className="h-4 w-4" aria-hidden="true" />,
        };
    }
  };

  return (
    <>
      <Helmet>
        <title>Playground · Ashes</title>
        <meta name="description" content="Interactive playground to understand Ashes cricket mechanics. Simulate deliveries, learn the rules, and see how Test and T15 formats differ." />
        <meta property="og:title" content="Playground · Ashes" />
        <meta property="og:description" content="Interactive playground to understand Ashes cricket mechanics. Simulate deliveries, learn the rules, and see how Test and T15 formats differ." />
      </Helmet>

      <div className="flex flex-col gap-12">
        <header className="border-b border-rule pb-8">
          <p className="label">Interactive playground</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">Understand the game</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper-soft">
            Ashes resolves every delivery by comparing two numbers — one from the batter, one from the bowler.
            Pick numbers below to see how a ball plays out, or let the simulator choose at random.
          </p>
        </header>

        <section aria-labelledby="format-toggle-heading" className="border-y border-rule py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 id="format-toggle-heading" className="display text-2xl">
                Format: <span className={`font-mono ${state.format === "t15" ? "text-t15" : "text-test"}`}>{state.format.toUpperCase()}</span>
              </h2>
              <p className="mt-1 text-sm text-paper-mute">
                {state.format === "t15"
                  ? "Two innings of 15 overs. Boundary limits change by phase (PP/Middle/Death)."
                  : "Four innings. One boundary per batter per over (two after 15 balls). Declarations and follow-on in play."}
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
              <p className="mt-1 text-sm text-paper-mute">
                {state.format === "t15"
                  ? `Phase ${phase} / 3 · ${PHASES.t15.boundaries[phase - 1]} boundary${PHASES.t15.boundaries[phase - 1] !== 1 ? "s" : ""} per batter`
                  : `Session ${phase} / 3 · 1 boundary per batter (2 after 15 balls)`}
              </p>
            </div>
            <div className="panel p-4">
              <p className="label">Batter</p>
              <p className="display mt-1 text-3xl tabular-nums">{state.batterRuns} ({state.batterBalls})</p>
              <p className="mt-1 text-sm text-paper-mute">SR: {batterSR}</p>
            </div>
            <div className="panel p-4">
              <p className="label">Bowler</p>
              <p className="display mt-1 text-3xl tabular-nums">{state.bowlerRunsConceded}/{state.bowlerWickets} ({ballsToOvers(state.bowlerBalls)})</p>
              <p className="mt-1 text-sm text-paper-mute">Econ: {bowlerEcon}</p>
            </div>
            <div className="panel p-4">
              <p className="label">Innings</p>
              <p className="display mt-1 text-3xl tabular-nums">{state.totalRuns}/{state.wickets}</p>
              <p className="mt-1 text-sm text-paper-mute">
                {state.format === "t15" ? `${Math.max(0, 90 - state.inningsBalls)} balls left` : "Test — no ball limit"}
              </p>
            </div>
          </div>

          <div className="mt-4 panel p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className={`label ${canBoundary ? "text-paper" : "text-paper-mute"}`}>
                {canBoundary ? "✓" : "✗"} Boundary available
              </span>
              <span className={`label ${canZero ? "text-paper" : "text-paper-mute"}`}>
                {canZero ? "✓" : "✗"} Zero available ({state.consecutiveZeros}/3)
              </span>
              <span className="label text-paper-mute">Balls this over: {state.batterBallsThisOver}/6</span>
              <span className="label text-paper-mute">Boundaries this over: {state.boundariesThisOver}</span>
            </div>
          </div>
        </section>

        <section aria-labelledby="delivery-heading" className="border-y border-rule py-6">
          <h2 id="delivery-heading" className="label mb-4">Play a delivery</h2>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <div>
                <h3 className="label mb-3">Batter chooses</h3>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Batter number choices">
                  {VALID_NUMBERS.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBatterChoice(num)}
                      aria-pressed={batterChoice === num}
                      disabled={num === 0 && !canZero}
                      disabled={num === 4 && !canBoundary}
                      disabled={num === 6 && !canBoundary}
                      className={`btn w-14 h-14 px-0 ${batterChoice === num ? "btn-solid" : "btn-quiet"} ${(!canZero && num === 0) || (!canBoundary && (num === 4 || num === 6)) ? "opacity-40 cursor-not-allowed" : ""}`}
                      aria-label={`Batter chooses ${num}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                {batterChoice !== null && (
                  <p className="mt-2 text-sm text-paper-soft">Selected: <span className="font-mono text-paper">{batterChoice}</span></p>
                )}
                {!canZero && (
                  <p className="mt-2 text-sm text-lobby flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    Third consecutive 0 blocked — would score 1 run instead
                  </p>
                )}
                {!canBoundary && (
                  <p className="mt-2 text-sm text-t15 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    Boundary limit reached — 4/6 would score 3 runs instead
                  </p>
                )}
              </div>

              <div>
                <h3 className="label mb-3">Bowler chooses</h3>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Bowler number choices">
                  {VALID_NUMBERS.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBowlerChoice(num)}
                      aria-pressed={bowlerChoice === num}
                      className={`btn w-14 h-14 px-0 ${bowlerChoice === num ? "btn-solid" : "btn-quiet"}`}
                      aria-label={`Bowler chooses ${num}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                {bowlerChoice !== null && (
                  <p className="mt-2 text-sm text-paper-soft">Selected: <span className="font-mono text-paper">{bowlerChoice}</span></p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={playBall}
                  disabled={batterChoice === null && bowlerChoice === null}
                  className="btn btn-solid flex-1 justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Bowl ball {state.inningsBalls + 1}
                </button>
                <button onClick={resetInnings} className="btn btn-quiet">
                  Reset innings
                </button>
              </div>
            </div>

            <aside className="border-l border-rule pl-6 lg:pl-8">
              <h3 className="label mb-4">Last delivery</h3>
              {lastResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="panel p-4">
                      <p className="label">Batter</p>
                      <p className="display mt-2 text-4xl">{lastResult.batterChoice}</p>
                    </div>
                    <div className="panel p-4">
                      <p className="label">Bowler</p>
                      <p className="display mt-2 text-4xl">{lastResult.bowlerChoice}</p>
                    </div>
                  </div>
                  <div className="panel p-4">
                    const { label, className, icon } = getOutcomeLabel(lastResult);
                    <div className="flex items-center justify-center gap-2">
                      <span className={`display ${className}`}>{icon} {label}</span>
                    </div>
                  </div>
                  <details className="group">
                    <summary className="details-summary flex items-center justify-between cursor-pointer text-sm text-paper-mute">
                      <span>Why this result?</span>
                      <Info className="h-4 w-4 transition-transform group-open:rotate-90" aria-hidden="true" />
                    </summary>
                    <div className="mt-3 text-sm text-paper-soft space-y-2">
                      {lastResult.outcome === "wicket" && (
                        <p>Numbers match ({lastResult.batterChoice} = {lastResult.bowlerChoice}) → batter is out ({lastResult.dismissal}).</p>
                      )}
                      {lastResult.outcome === "runs" && lastResult.runs > 0 && (
                        <p>Numbers differ ({lastResult.batterChoice} ≠ {lastResult.bowlerChoice}) → batter scores {lastResult.runs} run{lastResult.runs !== 1 ? "s" : ""}.</p>
                      )}
                      {lastResult.outcome === "runs" && lastResult.runs === 0 && (
                        <p>Numbers differ, batter chose 0 → no runs scored. Consecutive zeros: {state.consecutiveZeros}/3.</p>
                      )}
                      {lastResult.boundaryBlocked && (
                        <p>Boundary limit reached for this batter this over → 4/6 reduced to 3 runs.</p>
                      )}
                      {lastResult.zeroBlocked && (
                        <p>Third consecutive 0 blocked → scores 1 run instead of 0.</p>
                      )}
                    </div>
                  </details>
                </div>
              ) : (
                <p className="text-sm text-paper-mute text-center py-8">No delivery played yet</p>
              )}

              {state.history.length > 0 && (
                <div className="mt-6">
                  <h3 className="label mb-3">Recent deliveries</h3>
                  <div className="scroll-x max-h-64 overflow-y-auto">
                    <table className="data-table text-xs">
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
                              ) : h.result.boundaryBlocked ? (
                                <span className="text-t15">4/6→3</span>
                              ) : h.result.zeroBlocked ? (
                                <span className="text-lobby">0→1</span>
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
                  <strong>Batter chooses 0:</strong> scores 0 runs (dot ball). Can't choose 0 more than 3 times consecutively — the 4th attempt scores 1 run instead.
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
                      <strong>Boundary limit:</strong> 1 per batter per over (2 after the batter has faced 15 balls in that over).
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
              { batter: 0, bowler: 4, desc: "Dot ball → 0 runs. Three dots in a row → next 0 scores 1", format: "both" },
              { batter: 4, bowler: 2, desc: "Boundary limit reached → 4 becomes 3 runs", format: "both" },
              { batter: 1, bowler: 0, desc: "Quick single → 1 run. Good for rotating strike", format: "both" },
              { batter: 2, bowler: 4, desc: "Two runs → good for strike rotation in death overs", format: "t15" },
              { batter: 3, bowler: 0, desc: "Three runs → rare but valuable in Test cricket", format: "test" },
            ].filter((s) => s.format === "both" || s.format === state.format).map((scenario, i) => (
              <div key={i} className="panel p-4">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="btn btn-solid w-10 h-10 px-0">{scenario.batter}</span>
                    <span className="label text-paper-mute">vs</span>
                    <span className="btn btn-quiet w-10 h-10 px-0">{scenario.bowler}</span>
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