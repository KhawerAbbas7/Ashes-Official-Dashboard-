import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronDown } from "lucide-react";
import { fetchLeaderboard } from "../api";

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
};

export function Leaderboard() {
  const [selectedCategory, setSelectedCategory] = useState("Most Runs");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <>
      <Helmet>
        <title>Leaderboard · Ashes</title>
        <meta name="description" content="View global cricket leaderboards across all Discord servers." />
      </Helmet>
      
      <div className="mb-6 w-full max-w-xs relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between bg-ashes-card border border-ashes-border text-white font-sans text-sm rounded-sm px-4 py-2.5 outline-none focus:border-ashes-red hover:border-ashes-red transition-colors cursor-pointer"
        >
          <span>{selectedCategory}</span>
          <ChevronDown className={`w-4 h-4 text-ashes-very-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-ashes-card border border-ashes-border rounded-sm shadow-xl max-h-72 overflow-y-auto">
            {Object.keys(CATEGORIES).map((cat) => (
              <div
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  selectedCategory === cat
                    ? "bg-ashes-card-light text-white font-medium"
                    : "text-ashes-muted hover:bg-ashes-card-light hover:text-white"
                }`}
              >
                {cat}
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && <div className="text-ashes-muted font-mono text-[10px] uppercase tracking-[0.2em] text-center mt-12">Loading...</div>}

      {!loading && (!data || !data.data || data.data.length === 0) && (
        <div className="text-ashes-muted font-mono text-[10px] uppercase tracking-[0.2em] text-center mt-12">No data available.</div>
      )}

      {!loading && data && data.data && data.data.length > 0 && (
        <div>
          <div className="mb-6 flex justify-between items-end">
            <div className="space-y-1">
              {data.note && <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-ashes-red font-bold">{data.note}</div>}
              <h2 className="font-bebas text-3xl text-white tracking-wide leading-none">{data.title || selectedCategory}</h2>
            </div>
          </div>

          <div className="overflow-x-auto shadow-2xl rounded-sm">
            <table className="w-full text-left border-collapse bg-ashes-card">
              <thead>
                <tr>
                  <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em]">#</th>
                  <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em]">
                    {data.data[0].player2 ? "Batters" : data.data[0].matchId ? "Match" : "Player"}
                  </th>
                  {Object.keys(data.data[0])
                    .filter((k) => !["rank", "player", "player2", "playerAvatar", "player2Avatar", "matchId"].includes(k))
                    .map((col) => (
                      <th key={col} className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right">
                        {col}
                      </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.data.map((entry: any, i: number) => {
                  const isPartnership = !!entry.player2;
                  const isMatch = !!entry.matchId;
                  const name = isPartnership ? `${entry.player || "—"} & ${entry.player2 || "—"}` : isMatch ? entry.matchId.substring(0, 12) + "…" : entry.player || "—";
                  
                  return (
                    <tr key={i} className="hover:bg-ashes-card-light transition-colors group">
                      <td className="border-b border-ashes-border p-4 font-mono text-xs text-ashes-very-muted">{entry.rank}</td>
                      <td className="border-b border-ashes-border p-4 font-medium text-white text-sm">{name}</td>
                      {Object.keys(entry)
                        .filter((k) => !["rank", "player", "player2", "playerAvatar", "player2Avatar", "matchId"].includes(k))
                        .map((col) => (
                          <td key={col} className="border-b border-ashes-border p-4 text-sm text-ashes-muted text-right">{entry[col]}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}