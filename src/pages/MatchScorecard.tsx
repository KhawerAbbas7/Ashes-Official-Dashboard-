import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { fetchMatch, fetchScorecard } from "../api";
import { getResultText, getScoreString } from "../utils";
import { FormatBadge } from "../components/MatchFormat";
import { InningsTables } from "../components/InningsTables";
import { DeliveryFeed } from "../components/DeliveryFeed";

export function MatchScorecard() {
  const { id } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [scorecard, setScorecard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeView, setActiveView] = useState<"scorecard" | "balls">("scorecard");

  useEffect(() => {
    if (!id) return;
    setActiveTab(0);
    setActiveView("scorecard");
    setLoading(true);
    Promise.all([fetchMatch(id), fetchScorecard(id)])
      .then(([matchData, scorecardData]) => {
        if (!matchData || matchData.error) {
          setError(true);
        } else {
          setMatch(matchData);
          setScorecard(scorecardData);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p className="label py-16 text-center">Loading scorecard…</p>;
  }

  if (error || !match) {
    return (
      <div className="border-b border-rule py-16 text-center">
        <p className="label text-ball">Match data unavailable</p>
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
  const mvp = match.mvp;

  const inningsSummary = match.innings || [];
  const taScores: string[] = [];
  const tbScores: string[] = [];

  inningsSummary.forEach((inning: any) => {
    const score = getScoreString(inning);
    if (inning.battingTeam === teamA) taScores.push(score);
    else if (inning.battingTeam === teamB) tbScores.push(score);
  });

  const inningsData = scorecard?.innings || [];

  return (
    <>
      <Helmet>
        <title>{teamA} vs {teamB} · Scorecard</title>
        <meta name="description" content={`Full scorecard for ${teamA} vs ${teamB} on ${guild}.`} />
      </Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/matches" className="label transition-colors hover:text-paper">
          ← Matches
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <FormatBadge match={match} detail />
          <span className="label">{guild}</span>
          <span className="label">{channel}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-8 border-b border-rule pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.45fr)]">
        <div className="min-w-0">
          <h1 className="display text-4xl leading-[0.95] sm:text-5xl md:text-6xl">
            {teamA} <span className="text-paper-mute">v</span> {teamB}
          </h1>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="min-w-0 border-t border-rule pt-3">
              <p className="label">{teamA}</p>
              <p className="num mt-1 text-3xl leading-none text-paper sm:text-4xl">
                {taScores.join(" & ") || "—"}
              </p>
            </div>
            <div className="min-w-0 border-t border-rule pt-3">
              <p className="label">{teamB}</p>
              <p className="num mt-1 text-3xl leading-none text-paper sm:text-4xl">
                {tbScores.join(" & ") || "—"}
              </p>
            </div>
          </div>
        </div>

        <dl className="border-t border-rule pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="border-b border-rule-soft py-3">
            <dt className="label">Result</dt>
            <dd className="mt-1 text-sm leading-snug text-paper">{getResultText(match)}</dd>
          </div>
          <div className="border-b border-rule-soft py-3">
            <dt className="label">Player of the match</dt>
            <dd className="mt-1 flex items-center gap-2.5">
              {mvp?.avatar && (
                <img
                  src={mvp.avatar}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 border border-rule object-cover"
                />
              )}
              <span className="min-w-0 truncate text-sm font-medium text-paper">{mvp?.name || "—"}</span>
            </dd>
          </div>
          <div className="py-3">
            <dt className="label">Innings</dt>
            <dd className="mt-1.5 flex flex-wrap gap-2">
              {inningsSummary.length === 0 && <span className="text-sm text-paper-mute">—</span>}
              {inningsSummary.map((inning: any, index: number) => (
                <span key={index} className="border border-rule px-2 py-1 font-mono text-[10px] text-paper-soft">
                  {inning.battingTeam || "Team"} {getScoreString(inning)}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      {inningsData.length === 0 ? (
        <p className="label py-16 text-center">Scorecard data pending</p>
      ) : (
        <div className="mt-8">
          <div className="flex gap-6 overflow-x-auto border-b border-rule">
            {inningsData.map((inning: any, index: number) => {
              const battingTeam = inning.battingTeam || "Team";
              const wickets = inning.wickets || 0;
              let score = `${inning.total || 0}/${wickets}`;
              if (inning.isDeclared) score += "d";

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveTab(index)}
                  aria-pressed={index === activeTab}
                  className="tab"
                >
                  <span className="text-paper">{battingTeam}</span>{" "}
                  <span className="num">{score}</span>
                  {inning.isFollowOn && (
                    <span className="ml-1.5 text-test" title="Follow-on innings">
                      f/o
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex gap-6 border-b border-rule">
            <button
              type="button"
              onClick={() => setActiveView("scorecard")}
              aria-pressed={activeView === "scorecard"}
              className="tab"
            >
              Scorecard
            </button>
            <button
              type="button"
              onClick={() => setActiveView("balls")}
              aria-pressed={activeView === "balls"}
              className="tab"
            >
              Ball by ball
            </button>
          </div>
          <div className="pt-6">
            {activeView === "scorecard" ? (
              <InningsTables inning={inningsData[activeTab]} />
            ) : id ? (
              <DeliveryFeed
                key={`${id}-${inningsData[activeTab]?.inningNo ?? activeTab}`}
                matchId={id}
                inningNo={inningsData[activeTab]?.inningNo ?? activeTab + 1}
                format={String(scorecard?.format || match.format || "test").toLowerCase()}
                batters={inningsData[activeTab]?.batters || []}
                bowlers={inningsData[activeTab]?.bowlers || []}
              />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
