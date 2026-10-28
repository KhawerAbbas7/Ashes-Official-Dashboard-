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
  const [searched, setSearched] = useState(false);

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchPlayers(query);
      setResults(data.players || []);
    } catch (error) {
      console.error(error);
      setResults([]);
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

      <div className="max-w-3xl">
        <PageHeader
          title="Player index"
          description="Search by Discord username or ID to open a full career profile."
        />

        <form onSubmit={handleSearch} role="search">
          <label htmlFor="player-search" className="label">
            Search by Discord name or ID
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="player-search"
              type="search"
              placeholder="Name or ID"
              className="field min-w-0 flex-1"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit" className="btn btn-solid sm:shrink-0">
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              Search
            </button>
          </div>
        </form>

        {loading && <p className="label py-12 text-center">Searching the register…</p>}

        {!loading && searched && results.length === 0 && (
          <p className="label py-12 text-center">No players found for “{query}”</p>
        )}

        {!loading && results.length > 0 && (
          <ul className="mt-8 border-t border-rule">
            {results.map((player) => (
              <li key={player.id}>
                <Link
                  to={`/player/${player.id}`}
                  className="group flex items-center gap-4 border-b border-rule py-4 transition-colors hover:bg-ink-raised"
                >
                  <img
                    src={player.avatar}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    className="h-10 w-10 shrink-0 border border-rule object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="display text-xl leading-none transition-colors group-hover:text-ball">
                      {player.name}
                    </p>
                    <p className="label mt-1.5">{player.id}</p>
                  </div>
                  <span className="label transition-colors group-hover:text-paper">Profile →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
