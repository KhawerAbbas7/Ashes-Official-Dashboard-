import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { fetchLeaderboard } from "../api";
import { PageHeader } from "../components/PageHeader";

const CATEGORIES: Record<string, string> = {
  "Most Runs": "most_runs",
  "Most Wickets": "most_wickets",
  "Most Matches": "most_matches",
  "Most MVPs": "most_mvps",
  "Highest Batting AVG": "highest_bat_avg",
  "Highest Batting SR": "highest_bat_sr",
  "Best Bowling AVG": "best_bowl_avg",
  "Best Bowling ECO": "best_bowl_eco",
  "Best Bowling SR": "best_bowl_sr",
  "Most 30s": "most_30s",
  "Most 50s": "most_50s",
  "Most 4s": "most_4s",
  "Most 6s": "most_6s",
  "Most 3-fers": "most_3fers",
  "Most 5-fers": "most_5fers",
  "Most Hattricks": "most_hattricks",
  "Fastest 50s": "fastest_50s",
  "Fastest 30s": "fastest_30s",
  "Best Batting Inning": "best_bat_inning",
  "Best Bowling Inning": "best_bowl_inning",
  "Highest SR in an Inning": "highest_sr_inning",
  "Best Partnerships (Inning)": "best_partnerships_inning",
  "Best Partnerships (Overall)": "best_partnerships_overall",
  "Highest Match Aggregates": "highest_match_aggregate",
  "Lowest Deviation As A Bowler": "lowest_deviation_as_a_bowler",
};

const formatColumn = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const HIDDEN_COLUMNS = ["rank", "player", "player2", "playerAvatar", "player2Avatar", "matchId"];

export function Leaderboard() {
  const [selectedCategory, setSelectedCategory] = useState("Most Runs");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(CATEGORIES[selectedCategory])
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setLoading(false);
      });
  }, [selectedCategory]);

  const rows = data?.data || [];
  const columns = rows.length > 0 ? Object.keys(rows[0]).filter((key) => !HIDDEN_COLUMNS.includes(key)) : [];

  return (
    <>
      <Helmet>
        <title>Leaderboard · Ashes</title>
        <meta name="description" content="View global cricket leaderboards across all Discord servers." />
      </Helmet>

      <PageHeader
        title="Leaderboard"
        description="The best individual performances across every Ashes server."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
        <aside className="min-w-0">
          <label htmlFor="leaderboard-category" className="label">
            Category
          </label>
          <div className="relative mt-2">
            <select
              id="leaderboard-category"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="select"
            >
              {Object.keys(CATEGORIES).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-mute"
              aria-hidden="true"
            />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-paper-mute">
            All formats are included. Every category is drawn from completed matches on record.
          </p>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-rule pb-3">
            <h2 className="display text-3xl">{data?.title || selectedCategory}</h2>
            {data?.note && <span className="label text-ball">{data.note}</span>}
          </div>

          {loading && <p className="label py-12 text-center">Reading the record book…</p>}

          {!loading && rows.length === 0 && (
            <p className="label py-12 text-center">No data available</p>
          )}

          {!loading && rows.length > 0 && (
            <div className="scroll-x mt-4 border-y border-rule">
              <table className="data-table min-w-[640px]">
                <thead>
                  <tr>
                    <th scope="col" className="w-14">#</th>
                    <th scope="col">
                      {rows[0].player2 ? "Batters" : rows[0].matchId ? "Match" : "Player"}
                    </th>
                    {columns.map((column) => (
                      <th key={column} scope="col" className="text-right">
                        {formatColumn(column)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((entry: any, index: number) => {
                    const isPartnership = Boolean(entry.player2);
                    const isMatch = Boolean(entry.matchId);

                    return (
                      <tr key={index}>
                        <td className={`num text-xs ${index < 3 ? "text-ball" : "text-paper-mute"}`}>
                          {entry.rank}
                        </td>
                        <td className="text-sm font-medium text-paper">
                          {isPartnership ? (
                            `${entry.player || "—"} & ${entry.player2 || "—"}`
                          ) : isMatch ? (
                            <Link to={`/match/${entry.matchId}`} className="link">
                              {String(entry.matchId).substring(0, 12)}…
                            </Link>
                          ) : (
                            entry.player || "—"
                          )}
                        </td>
                        {columns.map((column) => (
                          <td key={column} className="num text-right text-sm">
                            {entry[column]}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
