import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronDown } from "lucide-react";
import { fetchRankings } from "../api";
const TYPES: Record<string, string> = {
  "Batting": "batting",
  "Bowling": "bowling",
  "All-Rounder": "allrounder",
};
export function Rankings() {
  const [selectedType, setSelectedType] = useState("Batting");
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
  return (
    <>
      <Helmet>
        <title>Rankings · Ashes</title>
        <meta name="description" content="View global player rankings across all servers." />
      </Helmet>
      <div className="mb-6 w-full max-w-xs relative" ref={dropdownRef}>
        <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between bg-ashes-card border border-ashes-border text-white font-sans text-sm rounded-sm px-4 py-2.5 outline-none focus:border-ashes-red hover:border-ashes-red transition-colors cursor-pointer">
          <span>{selectedType}</span>
          <ChevronDown className={`w-4 h-4 text-ashes-very-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-ashes-card border border-ashes-border rounded-sm shadow-xl max-h-72 overflow-y-auto">
            {Object.keys(TYPES).map((type) => (
              <div key={type} onClick={() => { setSelectedType(type); setIsOpen(false); }} className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${selectedType === type ? "bg-ashes-card-light text-white font-medium" : "text-ashes-muted hover:bg-ashes-card-light hover:text-white"}`}>
                {type}
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
              <h2 className="font-bebas text-3xl text-white tracking-wide leading-none">{selectedType} Rankings</h2>
              {data.cutoff && (
                <p className="text-ashes-muted font-mono text-xs uppercase tracking-widest mt-2">
                  Last Updated: {new Date(data.cutoff * 1000).toLocaleString(undefined, { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
          <div className="overflow-x-auto shadow-2xl rounded-sm">
            <table className="w-full text-left border-collapse bg-ashes-card">
              <thead>
                <tr>
                  <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] w-16">Rank</th>
                  <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em]">Player</th>
                  <th className="border-b border-ashes-border p-4 text-ashes-very-muted font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-right">Rating</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((player: any, i: number) => (
                  <tr key={i} className="hover:bg-ashes-card-light transition-colors group">
                    <td className="border-b border-ashes-border p-4 font-mono text-xs text-ashes-very-muted">{i + 1 + (data.page - 1) * data.limit}</td>
                    <td className="border-b border-ashes-border p-4 font-medium text-white text-sm flex items-center gap-3">
                      <img src={player.profileImageUrl} alt={player.playerName} className="w-8 h-8 rounded-full bg-ashes-card-light" />
                      {player.playerName}
                    </td>
                    <td className="border-b border-ashes-border p-4 text-sm text-ashes-muted text-right font-mono">{player.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}