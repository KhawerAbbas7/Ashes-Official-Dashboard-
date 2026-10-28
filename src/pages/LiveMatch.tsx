import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { ClipboardList, Radio, RefreshCw } from "lucide-react";
import { fetchLiveMatch } from "../api";
import { getScoreString } from "../utils";
import { FormatBadge } from "../components/MatchFormat";
import { InningsTables } from "../components/InningsTables";
import { StateTag } from "../components/StateTag";

function commentaryTone(text: string) {
  const lower = text.toLowerCase();
  const isWicket = lower.includes("wicket") || lower.includes("out") || lower.includes("wkt");
  const isBoundary = ["four", "six", "boundary", "4!", "6!"].some((token) => lower.includes(token));

  if (isWicket) {
    return {
      label: "Wicket",
      border: "border-l-ball",
      background: "bg-ball/5",
      labelClass: "text-ball",
      text: "text-paper",
    };
  }

  if (isBoundary) {
    return {
      label: "Boundary",
      border: "border-l-test",
      background: "bg-test/5",
      labelClass: "text-test",
      text: "text-paper-soft",
    };
  }

  return {
    label: null,
    border: "border-l-rule",
    background: "",
    labelClass: "",
    text: "text-paper-soft",
  };
}

export function LiveMatch() {
  const { id } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeRootTab, setActiveRootTab] = useState<"live" | "scorecard">("live");
  const [activeScorecardTab, setActiveScorecardTab] = useState<number>(0);

  const loadData = () => {
    if (!id) return;
    fetchLiveMatch(id)
      .then((matchData) => {
        if (!matchData || matchData.error) setError(true);
        else setMatch(matchData);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading && !match) {
    return <p className="label py-16 text-center">Loading live data…</p>;
  }

  if (error || !match) {
    return (
      <div className="border-b border-rule py-16 text-center">
        <p className="label text-ball">Live match unavailable</p>
        <Link to="/matches" className="btn btn-quiet mt-6">
          Back to matches
        </Link>
      </div>
    );
  }

  const teamA = match.teamAName || "Team A";
  const teamB = match.teamBName || "Team B";
  const channel = match.channelName || "—";
  const guild = match.guildName || "—";
  const isLive = match.state === "live";

  const inningsSummary = match.innings || [];
  const taScores: string[] = [];
  const tbScores: string[] = [];

  inningsSummary.forEach((inning: any) => {
    const score = getScoreString(inning);
    if (inning.battingTeam === teamA) taScores.push(score);
    else if (inning.battingTeam === teamB) tbScores.push(score);
  });

  const currentInning = match.currentInning || {};
  const batters = currentInning.currentBatters || match.currentBatters || [];
  const bowlers = currentInning.currentBowlers || match.currentBowlers || [];
  const commentary = match.commentary || [];
  const phase = match.phase || currentInning.phase || null;
  const partnership = currentInning.partnership || match.partnership || null;
  const fmt = (value: any, digits = 2) =>
    typeof value === "number" && Number.isFinite(value) ? value.toFixed(digits) : "—";
  const num = (value: any) => (typeof value === "number" && Number.isFinite(value) ? value : null);

  const statusText = match.statusText || "Waiting in Lobby";
  const isT15 = String(match.format ?? "").toLowerCase() === "t15";
  const tossStatus = match.tossStatus || null;
  const maxOvers = typeof match.maxBalls === "number" ? match.maxBalls / 6 : null;
  const repLimit = num(match.repLimit);
  const followOnLimit = num(match.followOnLimit);
  const inningNo = num(currentInning.inningNo);
  const battingTeam = currentInning.battingTeam || null;
  const runRate = num(currentInning.runRate);
  const target = num(currentInning.target);
  const runsNeeded = num(currentInning.runsNeeded);
  const ballsRemaining = num(currentInning.ballsRemaining);
  const requiredRate = num(currentInning.requiredRate);
  const currentOverRuns = num(currentInning.currentOverRuns);
  const lastOverRuns = num(currentInning.lastOverRuns);
  const partnershipRuns = num(partnership?.runs);
  const partnershipBalls = num(partnership?.balls);
  const timeline: string[] = currentInning.timeline || match.timeline || [];
  const fallOfWickets: string[] = currentInning.fallOfWickets || [];

  return (
    <>
      <Helmet>
        <title>Live · {teamA} vs {teamB} · Ashes</title>
        <meta name="description" content={`Live coverage for ${teamA} vs ${teamB}.`} />
      </Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/matches" className="label transition-colors hover:text-paper">
          ← Matches
        </Link>
        <button type="button" onClick={loadData} className="btn btn-quiet py-2">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh
        </button>
      </div>

      <section className="mt-6 border-y border-rule py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${isLive ? "animate-pulse bg-live" : "bg-lobby"}`}
              />
              <span className={`label ${isLive ? "text-live" : "text-lobby"}`}>
                {isLive ? "Live" : "Lobby"}
              </span>
            </span>
            <FormatBadge match={match} detail />
          </div>
          <p className="label">
            {guild} · {channel}
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
          <div className="min-w-0 sm:text-right">
            <p className="display text-2xl leading-none sm:text-3xl">{teamA}</p>
            <p className="num mt-1 text-xl leading-none text-ball sm:text-2xl">
              {taScores.join(" & ") || "—"}
            </p>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-paper-mute sm:block">
            v
          </span>
          <div className="min-w-0">
            <p className="display text-2xl leading-none sm:text-3xl">{teamB}</p>
            <p className="num mt-1 text-xl leading-none text-ball sm:text-2xl">
              {tbScores.join(" & ") || "—"}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="match-state-heading" className="border-b border-rule py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="match-state-heading" className="label-strong">
            Match state
          </h2>
          {isLive && <span className="label">Refreshes every 10s</span>}
        </div>
        <p className="display mt-2 break-words text-xl leading-snug sm:text-2xl">{statusText}</p>

        {phase && (
          <div className="mt-4 border-y border-rule bg-ink-raised px-3 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="label-strong text-t15">
                Phase {phase.number} · {phase.name}
              </p>
              <p className="label">
                {phase.boundaries} {phase.boundaries === 1 ? "boundary" : "boundaries"} per over ·{" "}
                {phase.oversLeft} overs left in phase
              </p>
            </div>
          </div>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
          <div>
            <dt className="label">Innings</dt>
            <dd className="mt-1 break-words text-sm leading-snug text-paper">
              {inningNo ? `${inningNo} · ${battingTeam || "—"}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="label">Run rate</dt>
            <dd className="num mt-1 text-sm text-paper">{fmt(runRate)}</dd>
          </div>
          {target !== null && (
            <div>
              <dt className="label">Target</dt>
              <dd className="num mt-1 text-sm text-paper">{target}</dd>
            </div>
          )}
          {runsNeeded !== null && (
            <div>
              <dt className="label">To win</dt>
              <dd className="num mt-1 text-sm text-paper">
                {runsNeeded}
                {ballsRemaining !== null && (
                  <span className="text-paper-mute"> from {ballsRemaining} balls</span>
                )}
              </dd>
            </div>
          )}
          {requiredRate !== null && (
            <div>
              <dt className="label">Required rate</dt>
              <dd className="num mt-1 text-sm text-paper">{fmt(requiredRate)}</dd>
            </div>
          )}
          {currentOverRuns !== null && (
            <div>
              <dt className="label">This over</dt>
              <dd className="num mt-1 text-sm text-paper">{currentOverRuns}</dd>
            </div>
          )}
          {lastOverRuns !== null && (
            <div>
              <dt className="label">Last over</dt>
              <dd className="num mt-1 text-sm text-paper">{lastOverRuns}</dd>
            </div>
          )}
          {partnershipRuns !== null && (
            <div>
              <dt className="label">Partnership</dt>
              <dd className="num mt-1 text-sm text-paper">
                {partnershipRuns}
                {partnershipBalls !== null && (
                  <span className="text-paper-mute"> ({partnershipBalls})</span>
                )}
              </dd>
            </div>
          )}
          {isLive && !isT15 && match.day && (
            <div>
              <dt className="label">Day / session</dt>
              <dd className="num mt-1 text-sm text-paper">
                {match.day} · {match.session ?? "—"}
              </dd>
            </div>
          )}
          {tossStatus && (
            <div className="col-span-2 sm:col-span-1">
              <dt className="label">Toss</dt>
              <dd className="mt-1 break-words text-sm leading-snug text-paper">{tossStatus}</dd>
            </div>
          )}
          {maxOvers !== null && (
            <div>
              <dt className="label">Max overs</dt>
              <dd className="num mt-1 text-sm text-paper">{maxOvers}</dd>
            </div>
          )}
          {repLimit !== null && (
            <div>
              <dt className="label">Rep limit</dt>
              <dd className="num mt-1 text-sm text-paper">{repLimit}</dd>
            </div>
          )}
          {!isT15 && followOnLimit !== null && (
            <div>
              <dt className="label">Follow-on limit</dt>
              <dd className="num mt-1 text-sm text-paper">{followOnLimit}</dd>
            </div>
          )}
        </dl>

        {timeline.length > 0 && (
          <div className="mt-5 border-t border-rule pt-3">
            <p className="label">Recent balls</p>
            <ol className="mt-2 flex flex-wrap gap-1.5">
              {timeline.map((ball, index) => {
                const isWicket = String(ball).startsWith("W");
                return (
                  <li
                    key={`${ball}-${index}`}
                    className={`num inline-flex h-7 min-w-7 items-center justify-center border px-1.5 text-xs ${
                      isWicket
                        ? "border-ball/50 bg-ball/10 text-ball"
                        : "border-rule text-paper-soft"
                    }`}
                  >
                    {ball}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {fallOfWickets.length > 0 && (
          <p className="mt-4 text-sm leading-snug text-paper-mute">
            <span className="label mr-2">Fall of wickets</span>
            {fallOfWickets.map((score, index) => `${score}/${index + 1}`).join(" · ")}
          </p>
        )}
      </section>

      <div className="mt-6 flex gap-6 border-b border-rule">
        <button
          type="button"
          onClick={() => setActiveRootTab("live")}
          aria-pressed={activeRootTab === "live"}
          className="tab inline-flex items-center gap-2"
        >
          <Radio className="h-3.5 w-3.5" aria-hidden="true" />
          Wire
        </button>
        <button
          type="button"
          onClick={() => setActiveRootTab("scorecard")}
          aria-pressed={activeRootTab === "scorecard"}
          className="tab inline-flex items-center gap-2"
        >
          <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
          Scorecard
        </button>
      </div>

      {activeRootTab === "live" && (
        <div className="grid gap-10 pt-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,0.85fr)]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="display text-2xl">Commentary</h2>
              <span className="label">Latest {Math.min(commentary.length, 12)} balls</span>
            </div>
            <div className="mt-3 border-t border-rule">
              {commentary.length === 0 ? (
                <p className="py-6 text-sm text-paper-mute">No deliveries logged yet.</p>
              ) : (
                commentary.slice(0, 12).map((entry: any, index: number) => {
                  const ball = entry.ball || entry.over || "";
                  const text = entry.text || entry.commentary || String(entry);
                  const tone = commentaryTone(text);

                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-b border-l-2 border-b-rule-soft py-3 pl-4 ${tone.border} ${tone.background}`}
                    >
                      <span className="num text-xs leading-relaxed text-paper-mute">{ball || "—"}</span>
                      <div className="min-w-0">
                        {tone.label && <p className={`label mb-1 ${tone.labelClass}`}>{tone.label}</p>}
                        <p className={`text-sm leading-relaxed ${tone.text}`}>{text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <aside className="min-w-0 border-t border-rule pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <h2 className="display text-2xl">At the crease</h2>
            {batters.length === 0 ? (
              <p className="mt-3 border-t border-rule py-4 text-sm text-paper-mute">Awaiting play.</p>
            ) : (
              <ul className="mt-3 border-t border-rule">
                {batters.map((batter: any, index: number) => {
                  const name = batter.playerName || batter.name || "—";
                  const runs = batter.runs || 0;
                  const balls = batter.balls || 0;
                  return (
                    <li key={index} className="border-b border-rule-soft py-2.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 truncate text-sm text-paper">
                          {name}
                          {batter.onStrike && (
                            <span className="ml-1 text-ball" aria-label="on strike">
                              *
                            </span>
                          )}
                        </span>
                        <span className="num shrink-0 text-sm text-paper-soft">
                          {runs} <span className="text-paper-mute">({balls})</span>
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {typeof batter.canDo0 === "boolean" && (
                          <StateTag tone={batter.canDo0 ? "quiet" : "alert"}>
                            {batter.canDo0 ? "Can do 0" : "Can't do 0"}
                          </StateTag>
                        )}
                        {typeof batter.canDoBoundary === "boolean" && (
                          <StateTag tone={batter.canDoBoundary ? "quiet" : "alert"}>
                            {batter.canDoBoundary ? "Can hit 4/6" : "Can't hit 4/6"}
                          </StateTag>
                        )}
                        {typeof batter.boundaryLimit === "number" && (
                          <StateTag
                            tone={
                              (batter.boundaryThisOver || 0) >= batter.boundaryLimit
                                ? "alert"
                                : "quiet"
                            }
                          >
                            4/6 this over {batter.boundaryThisOver || 0}/{batter.boundaryLimit}
                          </StateTag>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <h2 className="display mt-8 text-2xl">Bowling</h2>
            {bowlers.length === 0 ? (
              <p className="mt-3 border-t border-rule py-4 text-sm text-paper-mute">Awaiting play.</p>
            ) : (
              <ul className="mt-3 border-t border-rule">
                {bowlers.map((bowler: any, index: number) => {
                  const name = bowler.playerName || bowler.name || "—";
                  return (
                    <li key={index} className="border-b border-rule-soft py-2.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 truncate text-sm text-paper">
                          {name}
                          {bowler.isBowling && (
                            <span className="ml-1 text-live" aria-label="bowling">
                              ●
                            </span>
                          )}
                        </span>
                        <span className="num shrink-0 text-sm text-paper-soft">
                          {bowler.wickets || 0}/{bowler.runs || 0}{" "}
                          <span className="text-paper-mute">({bowler.overs || "0.0"})</span>
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {bowler.isOnHattrick && <StateTag tone="alert">On a hattrick</StateTag>}
                        {bowler.lastOverMaiden && (
                          <StateTag tone="accent">Maiden last over</StateTag>
                        )}
                        {typeof bowler.canDo0 === "boolean" && (
                          <StateTag tone={bowler.canDo0 ? "alert" : "quiet"}>
                            {bowler.canDo0 ? "Bowler can do 0" : "Bowler can't do 0"}
                          </StateTag>
                        )}
                        {typeof bowler.maidens === "number" && bowler.maidens > 0 && (
                          <StateTag>Maidens {bowler.maidens}</StateTag>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>
        </div>
      )}

      {activeRootTab === "scorecard" && (
        <div className="pt-6">
          {match.innings && match.innings.length > 0 ? (
            <div>
              <div className="flex gap-6 overflow-x-auto border-b border-rule">
                {match.innings.map((inning: any, index: number) => {
                  const battingTeam = inning.battingTeam || "Team";
                  const wickets = inning.wickets || 0;
                  let score = `${inning.total || inning.runs || 0}/${wickets}`;
                  if (inning.isDeclared) score += "d";

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveScorecardTab(index)}
                      aria-pressed={index === activeScorecardTab}
                      className="tab"
                    >
                      <span className="text-paper">{battingTeam}</span>{" "}
                      <span className="num">{score}</span>
                    </button>
                  );
                })}
              </div>
              <div className="pt-6">
                <InningsTables inning={match.innings[activeScorecardTab]} />
              </div>
            </div>
          ) : (
            <p className="label py-16 text-center">Innings not yet started</p>
          )}
        </div>
      )}
    </>
  );
}
