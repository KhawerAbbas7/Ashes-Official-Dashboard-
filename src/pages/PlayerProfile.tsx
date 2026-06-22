import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { fetchPlayerStats } from "../api";
import { Trophy } from "lucide-react";

export function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentCount, setRecentCount] = useState(5);

  useEffect(() => {
    if (!id) return;
    if (!data) setLoading(true);
    fetchPlayerStats(id, recentCount).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [id, recentCount]);

  if (loading && !data) return <div className="text-ashes-muted font-mono text-[10px] uppercase tracking-[0.2em] text-center mt-12">Loading Profile...</div>;
  if (!data || !data.player) return <div className="text-ashes-muted font-mono text-[10px] uppercase tracking-[0.2em] text-center mt-12">Player Not Found</div>;

  const { player, batting, bowling, general, recentPerformances, rankings } = data;

  return (
    <>
      <Helmet>
        <title>{player.name} Profile & Stats · Ashes</title>
      </Helmet>
      
      <div className="mt-4 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-ashes-card border border-ashes-border p-6 md:p-8 rounded-sm">
        <div className="flex items-center gap-6">
          <img src={player.avatar} alt={player.name} className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-ashes-border" />
          <div>
            <h1 className="font-bebas text-4xl md:text-5xl text-white tracking-wide mb-1">{player.name}</h1>
            <p className="text-ashes-very-muted font-mono text-xs uppercase tracking-[0.2em]">ID: {player.id}</p>
          </div>
        </div>
        
                <div className="flex flex-wrap items-center justify-end gap-3 self-stretch md:self-auto">
          {rankings?.batting?.rank && (
            <div className="flex flex-col items-center justify-center bg-ashes-dark border border-ashes-border px-4 py-2 rounded-sm min-w-[80px]">
              <div className="font-bebas text-2xl text-white leading-none">#{rankings.batting.rank}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ashes-muted mt-1">Batting</div>
            </div>
          )}
          
          {rankings?.bowling?.rank && (
            <div className="flex flex-col items-center justify-center bg-ashes-dark border border-ashes-border px-4 py-2 rounded-sm min-w-[80px]">
              <div className="font-bebas text-2xl text-white leading-none">#{rankings.bowling.rank}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ashes-muted mt-1">Bowling</div>
            </div>
          )}

          {rankings?.allrounder?.rank && (
            <div className="flex flex-col items-center justify-center bg-ashes-dark border border-[#E9C46A]/20 px-4 py-2 rounded-sm min-w-[80px]">
              <div className="font-bebas text-2xl text-[#E9C46A] leading-none">#{rankings.allrounder.rank}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#E9C46A]/80 mt-1">All-Rounder</div>
            </div>
          )}

          {general.mvps > 0 && (
            <div className="flex items-center gap-3 bg-ashes-dark border border-[#E9C46A]/20 text-[#E9C46A] px-5 py-3 rounded-sm">
              <Trophy className="w-6 h-6" />
              <div>
                <div className="font-bebas text-2xl leading-none">{general.mvps}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-80">MVP Awards</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-10">
        <div>
          <h2 className="font-bebas text-3xl text-white tracking-wide mb-4">Batting & Fielding</h2>
          <div className="overflow-x-auto shadow-2xl rounded-sm border border-ashes-border">
            <table className="w-full text-right border-collapse bg-ashes-card">
              <thead>
                <tr>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider text-left min-w-[80px]">Format</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">Mat</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">Inns</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">NO</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">Runs</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">HS</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">Ave</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">BF</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">SR</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">200s</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">100s</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">50s</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">30s</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">4s</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">6s</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">Ducks</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-ashes-card-light transition-colors">
                  <td className="border-b border-ashes-border p-3 font-medium text-white text-sm text-left">Test</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{batting.matches}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{batting.innings}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{batting.notOuts}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-white font-medium">{batting.runs}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{batting.highestScore}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-white font-medium">{batting.average}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{batting.balls}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{batting.strikeRate}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{batting.twoHundreds}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{batting.hundreds}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{batting.fifties}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{batting.thirties}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{batting.fours}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{batting.sixes}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{batting.ducks}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="font-bebas text-3xl text-white tracking-wide mb-4">Bowling</h2>
          <div className="overflow-x-auto shadow-2xl rounded-sm border border-ashes-border">
            <table className="w-full text-right border-collapse bg-ashes-card">
              <thead>
                <tr>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider text-left min-w-[80px]">Format</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">Mat</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">Inns</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">Balls</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">Runs</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">Wkts</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">BBI</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">Ave</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">Econ</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">SR</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">3w</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">5w</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">10w</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">Hattricks</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">4s</th>
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">6s</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-ashes-card-light transition-colors">
                  <td className="border-b border-ashes-border p-3 font-medium text-white text-sm text-left">Test</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{bowling.matches}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{bowling.innings}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{bowling.balls}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{bowling.runs}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-white font-medium">{bowling.wickets}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{bowling.bbi}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-white font-medium">{bowling.average}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{bowling.economy}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{bowling.strikeRate}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{bowling.threeWickets}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{bowling.fiveWickets}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{bowling.tenWickets}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{bowling.hattricks}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{bowling.foursConceded}</td>
                  <td className="border-b border-ashes-border p-3 text-sm text-ashes-muted">{bowling.sixesConceded}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {recentPerformances && recentPerformances.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bebas text-3xl text-white tracking-wide">Recent Performances</h2>
              <select value={recentCount} onChange={(e) => setRecentCount(Number(e.target.value))} className="bg-ashes-card border border-ashes-border text-white text-sm font-mono uppercase tracking-widest rounded-sm px-3 py-1.5 outline-none focus:border-ashes-red cursor-pointer">
                {[5, 10, 15, 20].map(num => (
                  <option key={num} value={num}>Last {num}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-4">
              {recentPerformances.map((perf: any, i: number) => (
                <Link to={`/match/${perf.matchId}`} key={i} className="bg-ashes-card border border-ashes-border p-4 pt-8 rounded-sm min-w-[200px] flex flex-col gap-2 shadow-xl relative group hover:border-ashes-red transition-colors block">
                  <div className="text-[10px] font-mono text-ashes-very-muted absolute top-2 right-3 group-hover:text-white transition-colors">
                    {new Date(perf.timestamp * 1000).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </div>
                  <div className="flex items-start gap-2 text-white font-mono text-sm">
                    <span className="opacity-50">🏏</span>
                    <span className="font-medium tracking-wide">{perf.bat}</span>
                  </div>
                  <div className="flex items-start gap-2 text-ashes-muted font-mono text-sm group-hover:text-zinc-300 transition-colors">
                    <span className="opacity-50">🥎</span>
                    <span className="font-medium tracking-wide">{perf.bowl}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
