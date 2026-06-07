import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { fetchLiveMatch } from "../api";
import { getScoreString } from "../utils";

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
      .then((mData) => {
        if (!mData || mData.error) setError(true);
        else setMatch(mData);
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
    return <div className="text-ashes-muted font-mono text-[10px] uppercase tracking-[0.2em] text-center mt-12">Loading live data...</div>;
  }

  if (error || !match) {
    return <div className="text-red-400 font-mono text-[10px] uppercase tracking-[0.2em] text-center mt-12">Live match unavailable</div>;
  }

  const teamA = match.teamAName || "Team A";
  const teamB = match.teamBName || "Team B";
  const channel = match.channelName || "—";
  const guild = match.guildName || "—";
  
  const inningsSummary = match.innings || [];
  const taScores: string[] = [];
  const tbScores: string[] = [];
  
  inningsSummary.forEach((inn: any) => {
    const scoreStr = getScoreString(inn);
    if (inn.battingTeam === teamA) taScores.push(scoreStr);
    else if (inn.battingTeam === teamB) tbScores.push(scoreStr);
  });

  return (
    <>
      <Helmet>
        <title>🔴 {teamA} vs {teamB} · Live</title>
        <meta name="description" content={`Live coverage for ${teamA} vs ${teamB}.`} />
      </Helmet>

      <div className="flex justify-between items-center mb-10">
        <Link to="/matches" className="text-ashes-muted hover:text-white font-mono text-[10px] uppercase tracking-[0.2em] transition-colors border-b border-transparent hover:border-ashes-red font-bold">
          ← Live Matches
        </Link>
        <button onClick={loadData} className="font-mono text-[10px] text-zinc-400 border border-ashes-border bg-ashes-card px-4 py-2 hover:text-white hover:border-ashes-red/50 transition-colors uppercase tracking-[0.2em] rounded-sm">
          ⟳ Refresh
        </button>
      </div>

      <div className="mt-5 pb-8 md:pb-12 border-b border-ashes-border relative">
        <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full z-0 h-32 w-full md:w-1/2 left-0 md:left-1/4 top-0 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10 relative z-10 w-full px-4 md:px-6 py-8 bg-ashes-card shadow-2xl border border-ashes-border rounded-xl">
          <div className="text-center md:text-right w-full md:flex-1 md:min-w-[200px] order-1 md:order-1">
            <div className="font-bebas text-4xl md:text-6xl text-white tracking-wide leading-none">{teamA}</div>
            <div className="font-mono text-xl md:text-2xl font-bold text-ashes-red mt-2 md:mt-3">{taScores.join(" & ") || "—"}</div>
          </div>
          <div className="flex flex-col items-center flex-shrink-0 order-3 md:order-2 w-full md:w-auto mt-4 md:mt-0">
            <div className="inline-flex items-center gap-[8px] bg-[#10b981]/10 border border-[#10b981]/20 rounded-md px-4 py-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block animate-pulse"></span>
              <span className="font-mono text-[10px] text-[#10b981] font-bold uppercase tracking-[0.2em]">Live</span>
            </div>
            <div className="font-mono text-[10px] text-ashes-very-muted uppercase tracking-[0.2em] text-center mt-4 border-t border-ashes-border pt-4 min-w-[120px]">
              {guild} <br/><span className="text-zinc-500">{channel}</span>
            </div>
          </div>
          <div className="text-center md:text-left w-full md:flex-1 md:min-w-[200px] order-2 md:order-3 mt-4 md:mt-0">
            <div className="font-bebas text-4xl md:text-6xl text-white tracking-wide leading-none">{teamB}</div>
            <div className="font-mono text-xl md:text-2xl font-bold text-ashes-red mt-2 md:mt-3">{tbScores.join(" & ") || "—"}</div>
          </div>
        </div>
      </div>

      <div className="flex w-full mt-6 md:mt-8 border-b border-white/5">
        <button
          onClick={() => setActiveRootTab("live")}
          className={`flex-1 md:flex-none font-mono text-[10px] uppercase tracking-[0.2em] transition-colors py-3 px-4 ${
            activeRootTab === "live"
              ? "text-ashes-red font-bold border-b-2 border-ashes-red bg-white/5"
              : "text-ashes-muted hover:text-white hover:bg-white/5"
          }`}
        >
          🔴 Live
        </button>
        <button
          onClick={() => setActiveRootTab("scorecard")}
          className={`flex-1 md:flex-none font-mono text-[10px] uppercase tracking-[0.2em] transition-colors py-3 px-4 ${
            activeRootTab === "scorecard"
              ? "text-ashes-red font-bold border-b-2 border-ashes-red bg-white/5"
              : "text-ashes-muted hover:text-white hover:bg-white/5"
          }`}
        >
          📋 Scorecard
        </button>
      </div>

      {activeRootTab === "live" && (
        <div className="pt-6">
          {(() => {
            const currentInning = match.currentInning || {};
            const batters = currentInning.currentBatters || match.currentBatters || [];
            const bowlers = currentInning.currentBowlers || match.currentBowlers || [];
            const commentary = match.commentary || [];

            return (
              <>
                {batters.length > 0 && (
                  <div>
                    <div className="font-mono text-[10px] text-ashes-red font-bold uppercase tracking-[0.3em] mb-4 mt-2">Batting</div>
                    <div className="overflow-x-auto mb-8 shadow-2xl rounded-sm border border-ashes-border">
                      <table className="w-full text-left border-collapse bg-ashes-card">
                        <thead>
                          <tr>
                            <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] bg-ashes-card-light/50">Batter</th>
                            <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right bg-ashes-card-light/50">R</th>
                            <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right bg-ashes-card-light/50">B</th>
                            <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right bg-ashes-card-light/50">SR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batters.map((b: any, i: number) => {
                            const name = b.playerName || b.name || "—";
                            const runs = b.runs || 0;
                            const balls = b.balls || 0;
                            const sr = b.strikeRate || (balls ? (runs / balls * 100) : 0);
                            return (
                              <tr key={i} className="hover:bg-ashes-card-light transition-colors group">
                                <td className="border-b border-ashes-border p-4 font-medium text-white text-sm">
                                  {name} {b.onStrike && <span className="text-[#CC0000] text-lg leading-none ml-1">*</span>}
                                </td>
                                <td className="border-b border-ashes-border p-4 text-right font-bold text-white text-sm">{runs}</td>
                                <td className="border-b border-ashes-border p-4 text-right text-zinc-400 text-sm">{balls}</td>
                                <td className="border-b border-ashes-border p-4 text-right text-zinc-400 text-sm">{sr.toFixed(1)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {bowlers.length > 0 && (
                  <div>
                    <div className="font-mono text-[10px] text-ashes-red font-bold uppercase tracking-[0.3em] mb-4 mt-6">Bowling</div>
                    <div className="overflow-x-auto shadow-2xl rounded-sm border border-ashes-border">
                      <table className="w-full text-left border-collapse bg-ashes-card">
                        <thead>
                          <tr>
                            <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] bg-ashes-card-light/50">Bowler</th>
                            <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right bg-ashes-card-light/50">O</th>
                            <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right bg-ashes-card-light/50">R</th>
                            <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right bg-ashes-card-light/50">W</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bowlers.map((b: any, i: number) => {
                            const name = b.playerName || b.name || "—";
                            return (
                              <tr key={i} className="hover:bg-ashes-card-light transition-colors group">
                                <td className="border-b border-ashes-border p-4 font-medium text-white text-sm flex items-center gap-2">
                                  {name} {b.isBowling && <span className="text-[#10b981] text-xs">●</span>}
                                </td>
                                <td className="border-b border-ashes-border p-4 text-right text-zinc-400 text-sm">{b.overs || "0.0"}</td>
                                <td className="border-b border-ashes-border p-4 text-right text-zinc-400 text-sm">{b.runs || 0}</td>
                                <td className="border-b border-ashes-border p-4 text-right font-bold text-white text-sm">{b.wickets || 0}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {batters.length === 0 && bowlers.length === 0 && (
                  <p className="text-zinc-500 text-xs text-center mt-12 font-mono tracking-[0.2em] uppercase">Awaiting play</p>
                )}
                {commentary.length > 0 && (
                  <div>
                    <div className="font-mono text-[10px] text-ashes-red font-bold uppercase tracking-[0.3em] mb-6 mt-12 pt-8 border-t border-ashes-border">Recent Commentary</div>
                    <div className="flex flex-col gap-3">
                      {commentary.slice(0, 10).map((entry: any, i: number) => {
                        const ball = entry.ball || entry.over || "";
                        const text = entry.text || entry.commentary || String(entry);
                        const isWicket = text.toLowerCase().includes("wicket") || text.toLowerCase().includes("out") || text.toLowerCase().includes("wkt");
                        const isBoundary = ["four", "six", "boundary", "4!", "6!"].some(x => text.toLowerCase().includes(x));
                        const accent = isWicket ? "#ef4444" : isBoundary ? "#eab308" : "var(--color-ashes-border)";
                        const textColor = isWicket ? "#fca5a5" : isBoundary ? "#fde047" : "var(--color-ashes-text)";
                        const bgOpacity = isWicket ? "bg-[#ef4444]/10" : isBoundary ? "bg-[#eab308]/10" : "bg-ashes-card/50";

                        return (
                          <div key={i} className={`flex md:gap-6 gap-4 items-start px-5 py-4 border border-ashes-border/50 rounded-sm shadow-md ${bgOpacity}`} style={{ borderLeftWidth: '3px', borderLeftColor: accent }}>
                            {ball && <span className="font-mono text-xs text-zinc-400 shrink-0 min-w-[3.5rem] mt-0.5">{ball}</span>}
                            <span className="text-sm leading-relaxed" style={{ color: textColor }}>{text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {activeRootTab === "scorecard" && (
        <div className="pt-6">
           {match.innings && match.innings.length > 0 ? (
             <div>
               <div className="flex gap-4 mb-6 border-b border-ashes-border overflow-x-auto pb-2">
                 {match.innings.map((inning: any, i: number) => {
                   const bt = inning.battingTeam || "Team";
                   const w = inning.wickets || 0;
                   let score = `${inning.total || inning.runs || 0}/${w}`;
                   if (inning.isDeclared) score += "d";
                   const isActive = i === activeScorecardTab;
                   return (
                     <button
                       key={i}
                       onClick={() => setActiveScorecardTab(i)}
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
                 {renderCustomInning(match.innings[activeScorecardTab])}
               </div>
             </div>
           ) : (
             <p className="text-ashes-muted mt-12 text-center font-bold uppercase font-mono text-[10px] tracking-[0.2em]">Innings not yet started.</p>
           )}
        </div>
      )}
    </>
  );
}
