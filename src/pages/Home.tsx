import { Helmet } from "react-helmet-async"
import { useEffect, useState } from "react"

const TEAM_MEMBERS = [
  {
    userId: 759713678013890560,
    name: "Lead Developer",
    username: "@92.97",
    role: "Creator & Lead Developer",
    avatarUrl: "https://cdn.discordapp.com/avatars/759713678013890560/2a996d48677d0c921786f3250859697c.png?size=1024"
  },
  {
    userId: 882228764237508628,
    name: "Zuhair Asif",
    username: "@zuhair_asif",
    role: "Moderator",
    avatarUrl: "https://cdn.discordapp.com/avatars/882228764237508628/47ff74cdc7fd0e5c0075672057fae9ae.webp?size=4096"
  },
  {
    userId: 1244979225924993094,
    name: "Dani",
    username: "@no._.one15",
    role: "Moderator and STUMPEX Developer",
    avatarUrl: "https://cdn.discordapp.com/avatars/1244979225924993094/2fcc2cddd62c0cb3f4f7031e5c950de3.webp?size=1024"
  },
  {
    userId: 707195158864855112,
    name: "SLAYER",
    username: "@slay3r699",
    role: "Moderator",
    avatarUrl: "https://cdn.discordapp.com/avatars/707195158864855112/b976343b71ede81998b9dada19403ded.webp?size=4096"
  },
  {
    userId: 700032580744904754,
    name: "Hamza",
    username: "@hamzaaalalala",
    role: "Moderator",
    avatarUrl: "https://cdn.discordapp.com/avatars/700032580744904754/f041b68c32fe2d06069cebe28b2e6e0d.webp?size=4096"
  },
  {
    userId: 915415308565622874,
    name: "Aatiq",
    username: "@.aatiq_",
    role: "Moderator",
    avatarUrl: "https://cdn.discordapp.com/avatars/915415308565622874/d86dafcf4c208eeedef02ab67ae70c26.webp?size=4096"
  }
]

export const hydrateTeamMembers = () => {
  const ids = TEAM_MEMBERS.map(m => m.userId).filter(Boolean).join(",")

  const url = new URL("/api/users", window.location.origin)
  url.searchParams.append("userIds", ids)

  return fetch(url.toString())
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch users")
      return res.json()
    })
    .then(data => {
      return TEAM_MEMBERS.map(member => {
        const apiUser = data[String(member.userId)]
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