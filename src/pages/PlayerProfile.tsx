import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { fetchPlayerStats } from "../api";
import { Trophy } from "lucide-react";

export function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchPlayerStats(id).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-ashes-muted font-mono text-[10px] uppercase tracking-[0.2em] text-center mt-12">Loading Profile...</div>;
  if (!data || !data.player) return <div className="text-ashes-muted font-mono text-[10px] uppercase tracking-[0.2em] text-center mt-12">Player Not Found</div>;

  const { player, batting, bowling, general } = data;

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
        
        {general.mvps > 0 && (
          <div className="flex items-center gap-3 bg-ashes-dark border border-[#E9C46A]/20 text-[#E9C46A] px-5 py-3 rounded-sm self-stretch md:self-auto">
            <Trophy className="w-6 h-6" />
            <div>
              <div className="font-bebas text-2xl leading-none">{general.mvps}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-80">MVP Awards</div>
            </div>
          </div>
        )}
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
                  <th className="border-b border-ashes-border p-3 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-wider">0s</th>
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
      </div>
    </>
  );
}