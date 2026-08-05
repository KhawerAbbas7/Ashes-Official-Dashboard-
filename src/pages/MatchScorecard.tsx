import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { fetchMatch, fetchScorecard } from "../api";
import { getResultText, getScoreString } from "../utils";

function renderCustomInning(inning: any) {
  const batters = inning.batters || [];
  const bowlers = inning.bowlers || [];
  
  return (
    <div className="mt-6">
      {batters.length > 0 && (
        <div className="overflow-x-auto mb-8 shadow-2xl rounded-sm border border-ashes-border">
          <table className="w-full text-left border-collapse bg-ashes-card">
            <thead>
              <tr>
                <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] bg-ashes-card-light/50">Batters</th>
                <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right bg-ashes-card-light/50">R</th>
                <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right bg-ashes-card-light/50">B</th>
                <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right bg-ashes-card-light/50">4s</th>
                <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right bg-ashes-card-light/50">6s</th>
                <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right bg-ashes-card-light/50">SR</th>
              </tr>
            </thead>
            <tbody>
              {batters.map((b: any, idx: number) => (
                <tr key={idx} className="hover:bg-ashes-card-light transition-colors group">
                  <td className="border-b border-ashes-border p-4">
                    <div className="font-medium text-white text-sm">{b.playerName || "—"}</div>
                    <div className="text-[10px] text-ashes-very-muted uppercase font-mono tracking-widest mt-1">{b.dismissedBy || ""}</div>
                  </td>
                  <td className="border-b border-ashes-border p-4 text-right font-bold text-white text-sm">{b.runs || 0}</td>
                  <td className="border-b border-ashes-border p-4 text-right text-sm text-zinc-400">{b.balls || 0}</td>
                  <td className="border-b border-ashes-border p-4 text-right text-sm text-zinc-400">{b.fours || 0}</td>
                  <td className="border-b border-ashes-border p-4 text-right text-sm text-zinc-400">{b.sixes || 0}</td>
                  <td className="border-b border-ashes-border p-4 text-right text-sm text-zinc-400">{(b.strikeRate || 0).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {bowlers.length > 0 && (
        <div className="overflow-x-auto shadow-2xl rounded-sm border border-ashes-border">
          <table className="w-full text-left border-collapse bg-ashes-card">
            <thead>
              <tr>
                <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] bg-ashes-card-light/50">Bowlers</th>
                <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right bg-ashes-card-light/50">O</th>
                <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right bg-ashes-card-light/50">R</th>
                <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right bg-ashes-card-light/50">W</th>
                <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right bg-ashes-card-light/50">ECON</th>
              </tr>
            </thead>
            <tbody>
              {bowlers.map((b: any, idx: number) => (
                <tr key={idx} className="hover:bg-ashes-card-light transition-colors group">
                  <td className="border-b border-ashes-border p-4">
                    <div className="font-medium text-white text-sm">{b.playerName || "—"}</div>
                  </td>
                  <td className="border-b border-ashes-border p-4 text-right text-sm text-zinc-400">{b.overs || "0.0"}</td>
                  <td className="border-b border-ashes-border p-4 text-right text-sm text-zinc-400">{b.runs || 0}</td>
                  <td className="border-b border-ashes-border p-4 text-right font-bold text-white text-sm">{b.wickets || 0}</td>
                  <td className="border-b border-ashes-border p-4 text-right text-sm text-zinc-400">{(b.economy || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function MatchScorecard() {
  const { id } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [scorecard, setScorecard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchMatch(id), fetchScorecard(id)])
      .then(([mData, sData]) => {
        if (!mData || mData.error) setError(true);
        else {
          setMatch(mData);
          setScorecard(sData);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="text-ashes-muted font-mono text-[10px] uppercase tracking-[0.2em] text-center mt-12">Loading scorecard...</div>;
  }

  if (error || !match) {
    return <div className="text-red-400 font-mono text-[10px] uppercase tracking-[0.2em] text-center mt-12">Match data unavailable</div>;
  }

  const teamA = match.teamAName || "Team A";
  const teamB = match.teamBName || "Team B";
  const channel = match.channelName || "—";
  const guild = match.guildName || "—";
  const mvp = match.mvp;
  
  const inningsSummary = match.innings || [];
  const taScores: string[] = [];
  const tbScores: string[] = [];
  
  inningsSummary.forEach((inn: any) => {
    const scoreStr = getScoreString(inn);
    if (inn.battingTeam === teamA) taScores.push(scoreStr);
    else if (inn.battingTeam === teamB) tbScores.push(scoreStr);
  });

  const inningsData = scorecard?.innings || [];

  return (
    <>
      <Helmet>
        <title>{teamA} vs {teamB} · Scorecard</title>
        <meta name="description" content={`Full scorecard for ${teamA} vs ${teamB} on ${guild}.`} />
      </Helmet>

      <div className="mb-8">
        <Link to="/matches" className="text-ashes-muted hover:text-white font-mono text-[10px] uppercase tracking-[0.2em] transition-colors border-b border-transparent hover:border-ashes-red font-bold">
          ← Back to Matches
        </Link>
      </div>

      <div className="text-center border-b border-ashes-border pb-8 md:pb-12 mb-8 md:mb-10 relative">
        <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full z-0 h-32 w-full md:w-1/2 left-0 md:left-1/4 top-0 pointer-events-none"></div>
        <div className="font-mono text-[10px] font-bold text-ashes-very-muted uppercase tracking-[0.3em] mb-4 md:mb-6 relative z-10 flex flex-wrap justify-center items-center gap-2">
          <span>{guild}</span> <span className="hidden sm:inline text-zinc-500">·</span> <span>{channel}</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-10 flex-wrap relative z-10 w-full px-4 sm:px-6 py-8 sm:py-10 bg-ashes-card shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-ashes-border rounded-xl">
          <div className="text-center sm:text-right w-full sm:flex-1 sm:min-w-[150px] md:min-w-[200px]">
            <div className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wide leading-none">{teamA}</div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-ashes-red mt-2 md:mt-3">{taScores.join(" & ") || "—"}</div>
          </div>
          <div className="font-bebas text-2xl md:text-3xl text-zinc-600 tracking-[0.2em] italic mx-2 md:mx-4">VS</div>
          <div className="text-center sm:text-left w-full sm:flex-1 sm:min-w-[150px] md:min-w-[200px]">
            <div className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wide leading-none">{teamB}</div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-ashes-red mt-2 md:mt-3">{tbScores.join(" & ") || "—"}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-ashes-card border border-ashes-border border-t-2 border-t-[#10b981] p-6 h-full shadow-lg rounded-sm hover:-translate-y-1 transition-transform">
          <div className="font-mono text-[10px] font-bold text-ashes-muted uppercase tracking-[0.3em] mb-3">Result</div>
          <div className="font-sans text-lg font-bold text-white">🏆 {getResultText(match)}</div>
        </div>
        
        <div className="bg-ashes-card border border-ashes-border border-t-2 border-t-ashes-red p-6 h-full shadow-lg rounded-sm hover:-translate-y-1 transition-transform">
          <div className="font-mono text-[10px] font-bold text-ashes-muted uppercase tracking-[0.3em] mb-3">Player of the Match</div>
          <div className="flex items-center gap-4 mt-2">
            {mvp?.avatar && <img src={mvp.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-ashes-border-light object-cover shadow-md" />}
            <span className="font-sans text-xl font-bold text-white truncate">{mvp?.name || "—"}</span>
          </div>
        </div>

        <div className="bg-ashes-card border border-ashes-border p-4 flex flex-col justify-center h-full shadow-lg rounded-sm overflow-hidden">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {inningsSummary.map((inn: any, i: number) => {
              const bt = inn.battingTeam || "Team";
              const isFirst = inningsSummary.findIndex((x:any) => x.battingTeam === bt) === i;
              return (
                <div key={i} className="flex-none min-w-[100px] bg-ashes-card-light/50 border border-ashes-border p-4 rounded-sm flex flex-col items-center">
                  <div className="font-mono text-[10px] font-bold text-ashes-muted uppercase tracking-[0.2em] mb-2 text-center">{bt} {isFirst ? "1ST" : "2ND"}</div>
                  <div className="font-bebas text-3xl font-medium text-white mb-1">{getScoreString(inn)}</div>
                  <div className="font-mono text-[10px] text-zinc-500 tracking-[0.2em] mt-1">{inn.overs || "0.0"} OV</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {inningsData.length === 0 ? (
        <p className="text-ashes-muted mt-12 text-center font-bold uppercase font-mono text-[10px] tracking-[0.2em]">Scorecard data pending.</p>
      ) : (
        <div>
          <div className="flex gap-4 mb-6 border-b border-ashes-border overflow-x-auto pb-2">
            {inningsData.map((inning: any, i: number) => {
              const bt = inning.battingTeam || "Team";
              const w = inning.wickets || 0;
              let score = `${inning.total || 0}/${w}`;
              if (inning.isDeclared) score += "d";
              const isActive = i === activeTab;
              return (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`font-mono font-bold text-[10px] whitespace-nowrap uppercase tracking-[0.2em] border-b-[2px] transition-all px-2 pb-2 ${
                    isActive ? "text-ashes-red border-ashes-red" : "text-ashes-muted border-transparent hover:text-white"
                  }`}
                >
                  <span className="text-white mr-2">{bt}</span> {score}
                </button>
              );
            })}
          </div>
          <div className="pt-2">
            {renderCustomInning(inningsData[activeTab])}
          </div>
        </div>
      )}
    </>
  );
}
