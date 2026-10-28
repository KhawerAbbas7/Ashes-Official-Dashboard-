import { ChevronDown } from "lucide-react";
import { StateTag } from "./StateTag";

function dismissalAfkLabel(side: string | null) {
  if (side === "both") return "Both players AFK";
  if (side === "batter") return "Batter AFK";
  if (side === "bowler") return "Bowler AFK";
  return "AFK dismissal";
}

type InningsTablesProps = {
  inning: any;
};

export function InningsTables({ inning }: InningsTablesProps) {
  if (!inning) return null;

  const batters = inning.batters || [];
  const bowlers = inning.bowlers || [];

  return (
    <div className="space-y-8">
      {batters.length > 0 && (
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="label">Batting</p>
            {inning.isFollowOn && <StateTag tone="accent">Follow-on</StateTag>}
          </div>
          <div className="scroll-x border-y border-rule">
            <table className="data-table min-w-[620px]">
              <caption className="sr-only">Batting figures</caption>
              <thead>
                <tr>
                  <th scope="col">Batter</th>
                  <th scope="col" className="text-right">R</th>
                  <th scope="col" className="text-right">B</th>
                  <th scope="col" className="text-right">4s</th>
                  <th scope="col" className="text-right">6s</th>
                  <th scope="col" className="text-right">0s</th>
                  <th scope="col" className="text-right">SR</th>
                </tr>
              </thead>
              <tbody>
                {batters.map((batter: any, index: number) => (
                  <tr key={index}>
                    <td>
                      <span className="block text-sm font-medium text-paper">{batter.playerName || "—"}</span>
                      {batter.dismissedBy && (
                        batter.dismissal ? (
                          <details className="group mt-0.5">
                            <summary className="details-summary flex items-center gap-1 font-mono text-[10px] text-paper-mute transition-colors hover:text-paper">
                              <span>{batter.dismissedBy}</span>
                              <ChevronDown
                                className="h-3 w-3 shrink-0 transition-transform group-open:rotate-180"
                                aria-hidden="true"
                              />
                            </summary>
                            <div className="mt-2 max-w-[18rem] space-y-1.5 border-l border-rule pl-2.5">
                              <p className="label flex flex-wrap items-baseline gap-x-1.5">
                                <span>{batter.dismissal.isAfk ? "AFK after" : "Ball"} {batter.dismissal.ball}</span>
                                {batter.dismissal.inningScore && (
                                  <>
                                    <span className="text-paper-mute" aria-hidden="true">·</span>
                                    <span className="num text-paper">{batter.dismissal.inningScore}</span>
                                  </>
                                )}
                              </p>
                              {batter.dismissal.isAfk ? (
                                <p className="text-xs leading-snug text-paper-soft">
                                  {dismissalAfkLabel(batter.dismissal.afkSide)}
                                </p>
                              ) : (
                                <p className="text-xs leading-snug text-paper-soft">
                                  Batter <span className="num text-paper">{batter.dismissal.batterNum}</span>
                                  <span className="text-paper-mute"> · </span>
                                  Bowler <span className="num text-paper">{batter.dismissal.bowlerNum}</span>
                                  <span className="text-paper-mute"> · </span>
                                  <span className="num text-paper">{batter.dismissal.runs}</span> runs
                                </p>
                              )}
                              {!batter.dismissal.isAfk && (
                                <div className="flex flex-wrap gap-1">
                                  <StateTag tone={batter.dismissal.batterCanDo0 ? "quiet" : "alert"}>
                                    {batter.dismissal.batterCanDo0 ? "Can do 0" : "Can't do 0"}
                                  </StateTag>
                                  <StateTag tone={batter.dismissal.batterCanDoBoundary ? "quiet" : "alert"}>
                                    {batter.dismissal.batterCanDoBoundary ? "Can hit 4/6" : "Can't hit 4/6"}
                                  </StateTag>
                                </div>
                              )}
                              {batter.dismissal.matchStatus && (
                                <p className="text-xs leading-snug text-paper-mute">{batter.dismissal.matchStatus}</p>
                              )}
                            </div>
                          </details>
                        ) : (
                          <span className="mt-0.5 block font-mono text-[10px] text-paper-mute">{batter.dismissedBy}</span>
                        )
                      )}
                    </td>
                    <td className="num text-right text-sm font-medium text-paper">{batter.runs || 0}</td>
                    <td className="num text-right text-sm">{batter.balls || 0}</td>
                    <td className="num text-right text-sm">{batter.fours || 0}</td>
                    <td className="num text-right text-sm">{batter.sixes || 0}</td>
                    <td className="num text-right text-sm">{batter.dots || 0}</td>
                    <td className="num text-right text-sm">{(batter.strikeRate || 0).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {bowlers.length > 0 && (
        <div>
          <p className="label mb-2">Bowling</p>
          <div className="scroll-x border-y border-rule">
            <table className="data-table min-w-[480px]">
              <caption className="sr-only">Bowling figures</caption>
              <thead>
                <tr>
                  <th scope="col">Bowler</th>
                  <th scope="col" className="text-right">O</th>
                  <th scope="col" className="text-right">R</th>
                  <th scope="col" className="text-right">W</th>
                  <th scope="col" className="text-right">Econ</th>
                </tr>
              </thead>
              <tbody>
                {bowlers.map((bowler: any, index: number) => (
                  <tr key={index}>
                    <td className="text-sm font-medium text-paper">{bowler.playerName || "—"}</td>
                    <td className="num text-right text-sm">{bowler.overs || "0.0"}</td>
                    <td className="num text-right text-sm">{bowler.runs || 0}</td>
                    <td className="num text-right text-sm font-medium text-paper">{bowler.wickets || 0}</td>
                    <td className="num text-right text-sm">{(bowler.economy || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
