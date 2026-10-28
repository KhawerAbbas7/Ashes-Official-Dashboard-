import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { ClipboardList, Radio, RefreshCw } from "lucide-react";
import { fetchLiveMatch } from "../api";
import { getScoreString } from "../utils";
import { FormatBadge } from "../components/MatchFormat";
import { InningsTables } from "../components/InningsTables";

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
                    <li
                      key={index}
                      className="flex items-baseline justify-between gap-3 border-b border-rule-soft py-2.5"
                    >
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
                    <li
                      key={index}
                      className="flex items-baseline justify-between gap-3 border-b border-rule-soft py-2.5"
                    >
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
