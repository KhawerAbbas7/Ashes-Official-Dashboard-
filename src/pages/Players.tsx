import { useState } from "react";
import type { FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { searchPlayers } from "../api";
import { PageHeader } from "../components/PageHeader";

export function Players() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: FormEvent) => {
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
      
      <div className="max-w-2xl mx-auto">
        <PageHeader
          eyebrow="Player directory"
          title="Find a player"
          description="Search by Discord username or ID to open a full career profile."
        />

        <form onSubmit={handleSearch} className="mb-8" role="search">
          <div className="flex gap-2">
            <label htmlFor="player-search" className="sr-only">Search players</label>
            <input
              id="player-search"
              type="search"
              placeholder="Search by Discord name or ID..."
              className="flex-1 bg-ashes-card border border-ashes-border text-white px-4 py-3 rounded-sm outline-none focus:border-ashes-red transition-colors text-sm font-sans"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-ashes-red hover:bg-ashes-red-hover text-white font-mono text-[10px] font-bold uppercase tracking-[0.18em] px-6 py-3 rounded-sm transition-colors"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
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