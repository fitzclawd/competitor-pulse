"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Eye, Zap, BarChart3, Lock } from "lucide-react";

const GATE_KEY = "cp_access";
const GATE_PASSWORD = "1286";

export default function LandingPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(GATE_KEY) === "true") {
      setHasAccess(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === GATE_PASSWORD) {
      localStorage.setItem(GATE_KEY, "true");
      setHasAccess(true);
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/80 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-indigo-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-zinc-100">CompetitorPulse</CardTitle>
            <CardDescription className="text-zinc-400">
              Enter the access code to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Access code"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                autoFocus
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500">
                Enter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <nav className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-400" />
            <span className="text-xl font-bold text-zinc-100">CompetitorPulse</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push("/login")} className="text-zinc-300 hover:text-zinc-100">
              Log in
            </Button>
            <Button onClick={() => router.push("/login?tab=signup")} className="bg-indigo-600 hover:bg-indigo-500">
              Get Started
            </Button>
          </div>
        </nav>

        <div className="text-center max-w-3xl mx-auto space-y-6 mb-20">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            AI-Powered Competitive Intelligence
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-zinc-100 leading-tight">
            Know what your competitors do{" "}
            <span className="text-indigo-400">before they announce it</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            CompetitorPulse monitors your competitors&apos; pricing pages, changelogs, blogs, and careers pages — then delivers
            AI-summarized weekly digests of what changed and why it matters.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => router.push("/login?tab=signup")} className="bg-indigo-600 hover:bg-indigo-500 text-lg px-8">
              Start Tracking Free
            </Button>
          </div>
          <p className="text-sm text-zinc-500">Free tier: 1 competitor, 1 user. No credit card required.</p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: Eye,
              title: "Competitor Watchlist",
              desc: "Add competitor URLs — pricing, changelog, blog, careers. We scrape daily and detect every change.",
            },
            {
              icon: Zap,
              title: "AI Weekly Digest",
              desc: "Every Monday: \"Here's what your competitors did this week\" with plain-language summaries of all changes.",
            },
            {
              icon: BarChart3,
              title: "Change Dashboard",
              desc: "Timeline view of all detected changes, filterable by competitor and change type. Never miss a move.",
            },
          ].map((f) => (
            <Card key={f.title} className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <CardTitle className="text-lg text-zinc-100">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing preview */}
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold text-zinc-100">Simple pricing</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { plan: "Free", price: "$0", features: ["1 competitor", "1 user", "Weekly digest"] },
              { plan: "Pro", price: "$49/mo", features: ["5 competitors", "3 users", "Weekly digest", "Dashboard"], highlight: true },
              { plan: "Team", price: "$149/mo", features: ["15 competitors", "10 users", "Daily digest", "Slack integration"] },
            ].map((p) => (
              <Card
                key={p.plan}
                className={`border-zinc-800 ${p.highlight ? "bg-indigo-600/10 border-indigo-500/30 ring-1 ring-indigo-500/20" : "bg-zinc-900/50"}`}
              >
                <CardHeader>
                  <CardTitle className="text-zinc-100">{p.plan}</CardTitle>
                  <p className="text-3xl font-bold text-zinc-100">{p.price}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="text-sm text-zinc-400 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <footer className="text-center text-zinc-600 text-sm mt-20 pb-8">
          &copy; 2026 CompetitorPulse. Built for B2B SaaS teams.
        </footer>
      </div>
    </div>
  );
}
