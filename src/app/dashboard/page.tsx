"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, Users, Globe, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Change {
  id: string;
  change_type: string;
  summary: string;
  details: string | null;
  severity: string;
  detected_at: string;
  competitor_id: string;
  competitors?: { name: string; website: string | null };
}

interface Stats {
  competitors: number;
  urls: number;
  changes: number;
  criticalChanges: number;
}

const severityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const changeTypeIcons: Record<string, string> = {
  pricing: "💰",
  feature: "🚀",
  content: "📝",
  hiring: "👥",
  other: "📌",
};

export default function DashboardPage() {
  const [changes, setChanges] = useState<Change[]>([]);
  const [stats, setStats] = useState<Stats>({ competitors: 0, urls: 0, changes: 0, criticalChanges: 0 });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const [competitorsRes, urlsRes, changesRes] = await Promise.all([
        supabase.from("competitors").select("id", { count: "exact" }),
        supabase.from("monitored_urls").select("id", { count: "exact" }),
        supabase
          .from("changes")
          .select("*, competitors(name, website)")
          .order("detected_at", { ascending: false })
          .limit(20),
      ]);

      const allChanges = (changesRes.data || []) as Change[];
      setChanges(allChanges);
      setStats({
        competitors: competitorsRes.count || 0,
        urls: urlsRes.count || 0,
        changes: allChanges.length,
        criticalChanges: allChanges.filter((c) => c.severity === "critical" || c.severity === "high").length,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-6 h-6 text-indigo-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Your competitive intelligence at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Competitors", value: stats.competitors, icon: Users, color: "text-indigo-400" },
          { label: "Monitored URLs", value: stats.urls, icon: Globe, color: "text-emerald-400" },
          { label: "Changes Detected", value: stats.changes, icon: TrendingUp, color: "text-amber-400" },
          { label: "High Priority", value: stats.criticalChanges, icon: AlertTriangle, color: "text-red-400" },
        ].map((s) => (
          <Card key={s.label} className="border-zinc-800 bg-zinc-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">{s.label}</p>
                  <p className="text-3xl font-bold text-zinc-100 mt-1">{s.value}</p>
                </div>
                <s.icon className={`w-8 h-8 ${s.color} opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Change timeline */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Recent Changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {changes.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Activity className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-zinc-400">No changes detected yet</p>
              <p className="text-sm text-zinc-500">
                Add competitors and their URLs to start tracking changes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {changes.map((change, i) => (
                <div key={change.id}>
                  <div className="flex items-start gap-4 py-3">
                    <div className="text-2xl mt-0.5">{changeTypeIcons[change.change_type] || "📌"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-zinc-100">
                          {change.competitors?.name || "Unknown"}
                        </span>
                        <Badge variant="outline" className={severityColors[change.severity]}>
                          {change.severity}
                        </Badge>
                        <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                          {change.change_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-300 mt-1">{change.summary}</p>
                      {change.details && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{change.details}</p>
                      )}
                      <p className="text-xs text-zinc-600 mt-2">
                        {formatDistanceToNow(new Date(change.detected_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {i < changes.length - 1 && <Separator className="bg-zinc-800" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
