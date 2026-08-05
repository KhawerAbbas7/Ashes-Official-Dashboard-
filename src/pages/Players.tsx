import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { searchPlayers } from "../api";

export function Players() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchPlayers(query);
      setResults(data.players || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Search Players · Ashes</title>
        <meta name="description" content="Search for player profiles and view their detailed career statistics." />
      </Helmet>
      
      <div className="max-w-2xl mx-auto mt-8">
        <h2 className="font-bebas text-4xl text-white tracking-wide mb-6 text-center">Player Search</h2>
        
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search by Discord Name or ID..." 
              className="flex-1 bg-ashes-card border border-ashes-border text-white px-4 py-3 rounded-sm outline-none focus:border-ashes-red transition-colors text-sm font-sans"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-ashes-red hover:bg-red-700 text-white font-bebas tracking-widest px-6 py-3 rounded-sm transition-colors text-xl"
            >
              Search
            </button>
          </div>
        </form>

        {loading && <div className="text-ashes-muted font-mono text-[10px] uppercase tracking-[0.2em] text-center mt-12">Searching...</div>}

        {!loading && results.length > 0 && (
          <div className="grid gap-3">
            {results.map((player) => (
              <Link 
                key={player.id} 
                to={`/player/${player.id}`}
                className="bg-ashes-card border border-ashes-border p-4 rounded-sm flex items-center gap-4 hover:border-ashes-red transition-colors group"
              >
                <img src={player.avatar} alt={player.name} className="w-12 h-12 rounded-full bg-ashes-card-light" />
                <div>
                  <h3 className="text-white font-medium text-lg group-hover:text-ashes-red transition-colors">{player.name}</h3>
                  <p className="text-ashes-very-muted font-mono text-[10px] uppercase tracking-wider">{player.id}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-ashes-muted font-mono text-[10px] uppercase tracking-[0.2em] text-center mt-12">No players found matching "{query}"</div>
        )}
      </div>
    </>
  );
}