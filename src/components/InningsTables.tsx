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
          <p className="label mb-2">Batting</p>
          <div className="scroll-x border-y border-rule">
            <table className="data-table min-w-[560px]">
              <caption className="sr-only">Batting figures</caption>
              <thead>
                <tr>
                  <th scope="col">Batter</th>
                  <th scope="col" className="text-right">R</th>
                  <th scope="col" className="text-right">B</th>
                  <th scope="col" className="text-right">4s</th>
                  <th scope="col" className="text-right">6s</th>
                  <th scope="col" className="text-right">SR</th>
                </tr>
              </thead>
              <tbody>
                {batters.map((batter: any, index: number) => (
                  <tr key={index}>
                    <td>
                      <span className="block text-sm font-medium text-paper">{batter.playerName || "—"}</span>
                      {batter.dismissedBy && (
                        <span className="mt-0.5 block font-mono text-[10px] text-paper-mute">{batter.dismissedBy}</span>
                      )}
                    </td>
                    <td className="num text-right text-sm font-medium text-paper">{batter.runs || 0}</td>
                    <td className="num text-right text-sm">{batter.balls || 0}</td>
                    <td className="num text-right text-sm">{batter.fours || 0}</td>
                    <td className="num text-right text-sm">{batter.sixes || 0}</td>
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
