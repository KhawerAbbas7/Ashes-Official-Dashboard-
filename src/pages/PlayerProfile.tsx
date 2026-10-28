import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { fetchPlayerStats } from "../api";

const BAT_STATS = (batting: any) => [
  ["Mat", batting.matches],
  ["Inns", batting.innings],
  ["NO", batting.notOuts],
  ["Runs", batting.runs],
  ["HS", batting.highestScore],
  ["Ave", batting.average],
  ["BF", batting.balls],
  ["SR", batting.strikeRate],
  ["200s", batting.twoHundreds],
  ["100s", batting.hundreds],
  ["50s", batting.fifties],
  ["30s", batting.thirties],
  ["4s", batting.fours],
  ["6s", batting.sixes],
  ["Ducks", batting.ducks],
  ["AFK %", `${batting.afkPct}%`],
];

const BOWL_STATS = (bowling: any) => [
  ["Mat", bowling.matches],
  ["Inns", bowling.innings],
  ["Balls", bowling.balls],
  ["Runs", bowling.runs],
  ["Wkts", bowling.wickets],
  ["BBI", bowling.bbi],
  ["Ave", bowling.average],
  ["Econ", bowling.economy],
  ["SR", bowling.strikeRate],
  ["3w", bowling.threeWickets],
  ["5w", bowling.fiveWickets],
  ["10w", bowling.tenWickets],
  ["Hattricks", bowling.hattricks],
  ["4s", bowling.foursConceded],
  ["6s", bowling.sixesConceded],
  ["AFK %", `${bowling.afkPct}%`],
];

export function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentCount, setRecentCount] = useState(5);

  useEffect(() => {
    if (!id) return;
    if (!data) setLoading(true);
    fetchPlayerStats(id, recentCount)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, recentCount]);

  if (loading && !data) {
    return <p className="label py-16 text-center">Loading profile…</p>;
  }

  if (!data || !data.player) {
    return <p className="label py-16 text-center text-ball">Player not found</p>;
  }

  const { player, batting, bowling, general, recentPerformances, rankings } = data;
  const batStats = BAT_STATS(batting);
  const bowlStats = BOWL_STATS(bowling);

  return (
    <>
      <Helmet>
        <title>{player.name} Profile &amp; Stats · Ashes</title>
      </Helmet>

      <div className="grid gap-6 border-b border-rule pb-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-end">
        <img
          src={player.avatar}
          alt=""
          width={128}
          height={128}
          className="h-24 w-24 border border-rule object-cover md:h-32 md:w-32"
        />
        <div className="min-w-0">
          <p className="label">Player dossier</p>
          <h1 className="display mt-2 text-4xl leading-[0.95] sm:text-5xl md:text-6xl">{player.name}</h1>
          <p className="label mt-2">ID {player.id}</p>

          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            {rankings?.batting?.rank && (
              <div>
                <dt className="label">Batting rank</dt>
                <dd className="num mt-1 text-xl leading-none text-paper">#{rankings.batting.rank}</dd>
              </div>
            )}
            {rankings?.bowling?.rank && (
              <div>
                <dt className="label">Bowling rank</dt>
                <dd className="num mt-1 text-xl leading-none text-paper">#{rankings.bowling.rank}</dd>
              </div>
            )}
            {rankings?.allrounder?.rank && (
              <div>
                <dt className="label">All-rounder rank</dt>
                <dd className="num mt-1 text-xl leading-none text-test">#{rankings.allrounder.rank}</dd>
              </div>
            )}
            {general.mvps > 0 && (
              <div>
                <dt className="label">MVP awards</dt>
                <dd className="num mt-1 text-xl leading-none text-test">{general.mvps}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-10 space-y-12">
        <section aria-labelledby="batting-heading">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-rule pb-3">
            <h2 id="batting-heading" className="display text-3xl">Batting &amp; fielding</h2>
            <span className="label sm:hidden">Scroll table →</span>
          </div>
          <div className="scroll-x mt-4 border-y border-rule">
            <table className="data-table min-w-[980px]">
              <caption className="sr-only">Career batting and fielding figures</caption>
              <thead>
                <tr>
                  <th scope="col" className="text-left">Scope</th>
                  {batStats.map(([label]) => (
                    <th key={String(label)} scope="col" className="whitespace-nowrap text-right">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="whitespace-nowrap text-sm font-medium text-paper">All formats</td>
                  {batStats.map(([label, value]) => (
                    <td key={String(label)} className="num whitespace-nowrap text-right text-sm">
                      {value}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="bowling-heading">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-rule pb-3">
            <h2 id="bowling-heading" className="display text-3xl">Bowling</h2>
            <span className="label sm:hidden">Scroll table →</span>
          </div>
          <div className="scroll-x mt-4 border-y border-rule">
            <table className="data-table min-w-[980px]">
              <caption className="sr-only">Career bowling figures</caption>
              <thead>
                <tr>
                  <th scope="col" className="text-left">Scope</th>
                  {bowlStats.map(([label]) => (
                    <th key={String(label)} scope="col" className="whitespace-nowrap text-right">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="whitespace-nowrap text-sm font-medium text-paper">All formats</td>
                  {bowlStats.map(([label, value]) => (
                    <td key={String(label)} className="num whitespace-nowrap text-right text-sm">
                      {value}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {recentPerformances && recentPerformances.length > 0 && (
          <section aria-labelledby="recent-heading">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-rule pb-3">
              <h2 id="recent-heading" className="display text-3xl">Recent performances</h2>
              <div className="flex items-center gap-2">
                <label htmlFor="recent-count" className="label">Show</label>
                <select
                  id="recent-count"
                  value={recentCount}
                  onChange={(event) => setRecentCount(Number(event.target.value))}
                  className="select w-28 py-1.5 text-xs"
                >
                  {[5, 10, 15, 20].map((count) => (
                    <option key={count} value={count}>Last {count}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-rule">
              {recentPerformances.map((performance: any, index: number) => (
                <Link
                  key={index}
                  to={`/match/${performance.matchId}`}
                  className="grid gap-2 border-b border-rule py-3 transition-colors hover:bg-ink-raised sm:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)] sm:items-baseline"
                >
                  <span className="label">
                    {new Date(performance.timestamp * 1000).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="min-w-0 text-sm">
                    <span className="label mr-2">Bat</span>
                    <span className="num text-paper">{performance.bat}</span>
                  </span>
                  <span className="min-w-0 text-sm">
                    <span className="label mr-2">Bowl</span>
                    <span className="num text-paper-soft">{performance.bowl}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
