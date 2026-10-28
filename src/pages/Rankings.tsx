import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { fetchRankings } from "../api";
import { PageHeader } from "../components/PageHeader";

const TYPES: Record<string, string> = {
  Batting: "batting",
  Bowling: "bowling",
  "All-Rounder": "allrounder",
};

export function Rankings() {
  const [selectedType, setSelectedType] = useState("Batting");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchRankings(TYPES[selectedType])
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setLoading(false);
      });
  }, [selectedType]);

  const rows = data?.data || [];

  return (
    <>
      <Helmet>
        <title>Rankings · Ashes</title>
        <meta name="description" content="View global player rankings across all servers." />
      </Helmet>

      <PageHeader
        title="Rankings"
        description="Batting, bowling and all-rounder ratings, calculated from Test match results."
      />

      <div className="scroll-x flex gap-6 border-b border-rule">
        {Object.keys(TYPES).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            aria-pressed={selectedType === type}
            className="tab"
          >
            {type}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-2">
        <h2 className="display text-3xl">{selectedType} rankings</h2>
        {data?.cutoff && (
          <p className="label">
            As of{" "}
            {new Date(data.cutoff * 1000).toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>

      {loading && <p className="label py-12 text-center">Calculating ratings…</p>}

      {!loading && rows.length === 0 && (
        <p className="label py-12 text-center">No data available</p>
      )}

      {!loading && rows.length > 0 && (
        <div className="scroll-x mt-4 border-y border-rule">
          <table className="data-table min-w-[520px]">
            <thead>
              <tr>
                <th scope="col" className="w-16">Rank</th>
                <th scope="col">Player</th>
                <th scope="col" className="text-right">Rating</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((player: any, index: number) => {
                const rank = index + 1 + (data.page - 1) * data.limit;
                return (
                  <tr key={player.playerId || index}>
                    <td className={`num text-xs ${rank <= 3 ? "text-ball" : "text-paper-mute"}`}>{rank}</td>
                    <td>
                      <Link
                        to={`/player/${player.playerId}`}
                        className="flex min-w-0 items-center gap-3 text-sm font-medium text-paper transition-colors hover:text-ball"
                      >
                        {player.profileImageUrl && (
                          <img
                            src={player.profileImageUrl}
                            alt=""
                            width={32}
                            height={32}
                            loading="lazy"
                            className="h-8 w-8 shrink-0 border border-rule object-cover"
                          />
                        )}
                        <span className="min-w-0 truncate">{player.playerName}</span>
                      </Link>
                    </td>
                    <td className="num text-right text-base text-paper">{player.rating}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
