import { Helmet } from "react-helmet-async"
import { useEffect, useState } from "react"

const TEAM_MEMBERS = [
  {
    userId: "759713678013890560",
    name: "Lead Developer",
    username: "@92.97",
    role: "Creator & Lead Developer",
    avatarUrl: "https://cdn.discordapp.com/avatars/759713678013890560/2a996d48677d0c921786f3250859697c.png?size=1024"
  },
  {
    userId: "882228764237508628",
    name: "Zuhair Asif",
    username: "@zuhair_asif",
    role: "Graphic Designer & Moderator",
    avatarUrl: "https://cdn.discordapp.com/avatars/882228764237508628/47ff74cdc7fd0e5c0075672057fae9ae.webp?size=4096"
  },
  {
    userId: "1244979225924993094",
    name: "Dani",
    username: "@no._.one15",
    role: "Moderator and STUMPEX Developer",
    avatarUrl: "https://cdn.discordapp.com/avatars/1244979225924993094/2fcc2cddd62c0cb3f4f7031e5c950de3.webp?size=1024"
  },
  {
    userId: "707195158864855112",
    name: "SLAYER",
    username: "@slay3r699",
    role: "Moderator",
    avatarUrl: "https://cdn.discordapp.com/avatars/707195158864855112/b976343b71ede81998b9dada19403ded.webp?size=4096"
  },
  {
    userId: "700032580744904754",
    name: "Hamza",
    username: "@hamzaaalalala",
    role: "Moderator",
    avatarUrl: "https://cdn.discordapp.com/avatars/700032580744904754/f041b68c32fe2d06069cebe28b2e6e0d.webp?size=4096"
  },
  {
    userId: "915415308565622874",
    name: "Aatiq",
    username: "@.aatiq_",
    role: "Moderator",
    avatarUrl: "https://cdn.discordapp.com/avatars/915415308565622874/d86dafcf4c208eeedef02ab67ae70c26.webp?size=4096"
  },
  {
    userId: "1269703650494644387",
    name: "Bondu Khan",
    username: "@kondubhan",
    role: "Moderator",
    avatarUrl: "https://cdn.discordapp.com/avatars/915415308565622874/d86dafcf4c208eeedef02ab67ae70c26.webp?size=4096"
  }
]

export const hydrateTeamMembers = () => {
  const ids = TEAM_MEMBERS.map(m => m.userId).filter(Boolean).join(",")
  debugger;
  const url = new URL("/api/users", window.location.origin)
  url.searchParams.append("userIds", ids)

  return fetch(url.toString())
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch users")
      return res.json()
    })
    .then(data => {
      console.log(data)
      return TEAM_MEMBERS.map(member => {
        const apiUser = data[member.userId]
        if (!apiUser) return member
        return {
          ...member,
          name: apiUser.displayName || member.name,
          avatarUrl: apiUser.avatar || member.avatarUrl
        }
      })
    })
}

export function Home() {
  const [members, setMembers] = useState(TEAM_MEMBERS)

  useEffect(() => {
    hydrateTeamMembers().then(setMembers)
  }, [])

  return (
    <>
      <Helmet>
        <title>Ashes · Discord Cricket Bot</title>
        <meta name="description" content="Ashes is the ultimate test cricket bot for Discord. Host matches, Enjoy the intensity of ultimate form of cricket." />
        <meta property="og:title" content="Ashes · Discord Cricket Bot" />
        <meta property="og:description" content="Ashes is the ultimate cricket simulation bot for Discord." />
      </Helmet>

      <div className="flex flex-col items-center justify-center py-8 md:py-16 px-2 text-center relative">
        <div className="absolute inset-0 bg-ashes-red/20 blur-[120px] rounded-full z-0 h-48 w-48 md:h-64 md:w-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

        <h2 className="font-bebas text-4xl sm:text-5xl md:text-7xl text-white leading-tight mb-4 tracking-wider relative z-10 font-medium">
          THE <span className="text-ashes-red italic">ULTIMATE</span> CRICKET EXPERIENCE
        </h2>

        <p className="max-w-2xl text-ashes-muted text-lg mb-10 relative z-10 leading-relaxed text-zinc-400">
          Ashes brings real-time cricket simulation directly to your Discord server.
          Track stats, follow live games, and compete on global leaderboards.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16 relative z-10 w-full sm:w-auto px-4">
          <a href="https://top.gg/bot/1443165621100740668" target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none uppercase tracking-[0.2em] font-mono text-xs font-bold bg-ashes-red hover:bg-ashes-red-hover text-white px-8 py-4 transition-colors rounded-sm shadow-[0_0_20px_rgba(202,62,71,0.3)]">
            Invite Bot
          </a>
          <a href="https://discord.gg/7fXmznW9sB" target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none uppercase tracking-[0.2em] font-mono text-xs font-bold bg-ashes-card-light hover:bg-ashes-card-light/50 border border-ashes-border text-white px-8 py-4 transition-colors rounded-sm">
            Support Server
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-16 relative z-10">
          <div className="bg-ashes-card border border-ashes-border hover:border-ashes-red/30 transition-colors p-6 text-left">
            <h3 className="font-bebas text-2xl text-white tracking-wide mb-2">Live Matches</h3>
            <p className="text-ashes-muted text-sm">Follow ball-by-ball commentary and real-time scorecards as matches unfold in your Discord channels.</p>
          </div>

          <div className="bg-ashes-card border border-ashes-border hover:border-ashes-red/30 transition-colors p-6 text-left">
            <h3 className="font-bebas text-2xl text-white tracking-wide mb-2">Detailed Scorecards</h3>
            <p className="text-ashes-muted text-sm">Every match is recorded with deep statistical data, giving you a complete overview of team and player performance.</p>
          </div>

          <div className="bg-ashes-card border border-ashes-border hover:border-ashes-red/30 transition-colors p-6 text-left">
            <h3 className="font-bebas text-2xl text-white tracking-wide mb-2">Global Leaderboards</h3>
            <p className="text-ashes-muted text-sm">Compete across all servers to become the top run scorer, wicket taker, or most valuable player globally.</p>
          </div>
        </div>

        <div className="w-full max-w-4xl bg-ashes-card border border-ashes-border p-6 md:p-8 text-left relative z-10 mb-16">
          <h3 className="font-bebas text-3xl tracking-wider mb-6 border-b border-ashes-border pb-4 text-white">How To Play</h3>

          <div className="space-y-8 text-zinc-300">
            <section>
              <h4 className="font-bebas text-2xl text-ashes-red mb-3">Basics</h4>
              <p className="mb-4 leading-relaxed">
                Bot will ask for a number from both batter & bowler, numbers may only be chosen from 0, 1, 2, 3, 4, and 6. If both put same number then it's out, otherwise, the batter is safe, and the number the batter chose is added to the score.
              </p>
              <div className="bg-ashes-card-light/30 border border-ashes-border p-4 rounded-sm">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-[0.1em] mb-2 block">Examples</span>
                <ul className="list-disc pl-5 space-y-2 text-sm font-sans text-zinc-400">
                  <li>
                    <strong className="text-zinc-200">The batter chose 2, and the bowler chose 3:</strong>
                    <br />Batter scored 2 runs.
                  </li>
                  <li>
                    <strong className="text-zinc-200">The batter chose 3, and the bowler chose 3:</strong>
                    <br />The batter is out.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h4 className="font-bebas text-2xl text-ashes-red mb-3">Advance Rules</h4>
              <p className="mb-4 leading-relaxed">
                <strong className="text-white">Ashes</strong> has special set of rules which are different from basics which follow as these:
              </p>
              <ul className="list-disc pl-5 space-y-3 text-zinc-300">
                <li>Each game has 4 innings (if a team wins by an inning then 3).</li>
                <li>Bowlers can't do <code className="bg-white/10 px-1 py-0.5 rounded text-sm font-mono text-white">0</code>.</li>
                <li>The number <code className="bg-white/10 px-1 py-0.5 rounded text-sm font-mono text-white">5</code> doesn't exist.</li>
                <li>
                  Batter may only use boundary numbers (4/6) once per over.
                  <ul className="list-circle pl-5 mt-1 text-sm text-zinc-400 mt-2">
                    <li>This applies to one batter per over, e.g if striker does 4 and then rotates the strike, non striker can hit another boundary.</li>
                  </ul>
                </li>
                <li>
                  Batter can only do 3 consecutive 0s.
                  <ul className="list-circle pl-5 mt-1 text-sm text-zinc-400 mt-2">
                    <li>This applies regardless of overs, eg. Khawi did 000 on 4.4, 4.5, 4.6 and then gets strike on 5.3, he will have to do a number (can't do 0)</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h4 className="font-bebas text-2xl text-ashes-red mb-3">How To Start A Game</h4>
              <p className="leading-relaxed mb-4">
                To start a game you need 4 players. Start by creating a lobby with <code className="bg-white/10 px-1 py-0.5 rounded text-sm font-mono text-white">create</code> command, you can now ask other players to join via <code className="bg-white/10 px-1 py-0.5 rounded text-sm font-mono text-white">join</code> command. Once you have enough players (That can be viewed through <code className="bg-white/10 px-1 py-0.5 rounded text-sm font-mono text-white">pl</code> command) you are ready to initiate toss by <code className="bg-white/10 px-1 py-0.5 rounded text-sm font-mono text-white">toss</code> command. After that you can start the game by using <code className="bg-white/10 px-1 py-0.5 rounded text-sm font-mono text-white">start</code> command.
              </p>
              <div className="bg-ashes-card-light/20 border border-white/5 p-4 rounded-sm flex flex-wrap gap-2 items-center justify-center font-mono text-xs font-bold text-white mb-4">
                <span className="bg-ashes-red/20 text-ashes-red px-2 py-1 rounded">create</span>
                <span className="text-zinc-600">→</span>
                <span className="bg-ashes-red/20 text-ashes-red px-2 py-1 rounded">join</span>
                <span className="text-zinc-600">→</span>
                <span className="bg-ashes-red/20 text-ashes-red px-2 py-1 rounded">toss</span>
                <span className="text-zinc-600">→</span>
                <span className="bg-ashes-red/20 text-ashes-red px-2 py-1 rounded">start</span>
              </div>
              <p className="leading-relaxed">
                If you can't find the players you can always play in the <a href="https://discord.gg/7fXmznW9sB" target="_blank" rel="noopener noreferrer" className="text-white hover:text-ashes-red transition-colors font-bold underline decoration-ashes-red/50 decoration-2 underline-offset-4">Official Server</a>.
                <br /><span className="text-zinc-500 text-sm italic mt-1 inline-block">you can ping 'regular players' role there.</span>
              </p>
            </section>
          </div>
        </div>

        <div className="w-full max-w-4xl bg-ashes-card border border-ashes-border p-6 md:p-8 text-left relative z-10">
          <h3 className="font-bebas text-3xl tracking-wider mb-6 border-b border-ashes-border pb-4 text-white">Meet the Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {members.map((member, i) => (
              <div key={member.userId || i} className="flex items-center gap-4 bg-ashes-card-light/30 border border-ashes-border p-4 rounded-sm hover:border-ashes-red/30 transition-colors">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="w-12 h-12 rounded-full border border-ashes-border shadow-md object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-ashes-card border border-ashes-border flex items-center justify-center font-bebas text-xl text-white">
                    {member.name[0]}
                  </div>
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-white truncate leading-tight">{member.name}</span>
                  <span className="font-mono text-[10px] text-zinc-500 truncate leading-tight mt-0.5">{member.username}</span>
                  <span className="font-mono text-[9px] text-ashes-red uppercase tracking-[0.2em] mt-1.5 font-bold">{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}