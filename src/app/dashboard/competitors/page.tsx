"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Globe, ExternalLink, Users } from "lucide-react";
import { toast } from "sonner";

interface MonitoredUrl {
  id: string;
  url: string;
  url_type: string;
  last_checked_at: string | null;
}

interface Competitor {
  id: string;
  name: string;
  website: string | null;
  created_at: string;
  monitored_urls: MonitoredUrl[];
}

const URL_TYPES = ["pricing", "changelog", "blog", "careers", "homepage", "other"];

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [newUrlType, setNewUrlType] = useState("homepage");
  const supabase = createClient();

  const loadCompetitors = useCallback(async () => {
    const { data } = await supabase
      .from("competitors")
      .select("*, monitored_urls(*)")
      .order("created_at", { ascending: false });
    setCompetitors((data || []) as Competitor[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCompetitors();
  }, [loadCompetitors]);

  const addCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("competitors").insert({
      name: newName,
      website: newWebsite || null,
      user_id: user.id,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Added ${newName}`);
      setNewName("");
      setNewWebsite("");
      setDialogOpen(false);
      loadCompetitors();
    }
  };

  const deleteCompetitor = async (id: string, name: string) => {
    if (!confirm(`Delete ${name} and all its monitored URLs?`)) return;
    const { error } = await supabase.from("competitors").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Deleted ${name}`);
      loadCompetitors();
    }
  };

  const addUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompetitor) return;

    const { error } = await supabase.from("monitored_urls").insert({
      competitor_id: selectedCompetitor,
      url: newUrl,
      url_type: newUrlType,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("URL added");
      setNewUrl("");
      setNewUrlType("homepage");
      setUrlDialogOpen(false);
      loadCompetitors();
    }
  };

  const deleteUrl = async (id: string) => {
    const { error } = await supabase.from("monitored_urls").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("URL removed");
      loadCompetitors();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Users className="w-6 h-6 text-indigo-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Competitors</h1>
          <p className="text-zinc-400 mt-1">Manage your competitor watchlist and monitored URLs</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white h-9 px-4 py-2">
            <Plus className="w-4 h-4 mr-2" />
            Add Competitor
          </DialogTrigger>
          <DialogContent className="border-zinc-800 bg-zinc-900">
            <DialogHeader>
              <DialogTitle className="text-zinc-100">Add Competitor</DialogTitle>
            </DialogHeader>
            <form onSubmit={addCompetitor} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Company Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Website (optional)</Label>
                <Input
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  placeholder="https://acme.com"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500">
                Add Competitor
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {competitors.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="text-center py-16 space-y-4">
            <Users className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-medium text-zinc-300">No competitors yet</h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              Add your first competitor to start tracking their changes. You can monitor their pricing page, changelog, blog, and more.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-500">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Competitor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {competitors.map((comp) => (
            <Card key={comp.id} className="border-zinc-800 bg-zinc-900/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-indigo-400">
                      {comp.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg text-zinc-100">{comp.name}</CardTitle>
                    {comp.website && (
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-400 hover:text-indigo-400 flex items-center gap-1"
                      >
                        {comp.website} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:text-zinc-100"
                    onClick={() => {
                      setSelectedCompetitor(comp.id);
                      setUrlDialogOpen(true);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add URL
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-zinc-500 hover:text-red-400"
                    onClick={() => deleteCompetitor(comp.id, comp.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              {comp.monitored_urls.length > 0 && (
                <CardContent>
                  <Separator className="bg-zinc-800 mb-4" />
                  <div className="space-y-2">
                    {comp.monitored_urls.map((url) => (
                      <div
                        key={url.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-800/50 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Globe className="w-4 h-4 text-zinc-500 shrink-0" />
                          <span className="text-sm text-zinc-300 truncate">{url.url}</span>
                          <Badge variant="outline" className="border-zinc-700 text-zinc-400 shrink-0">
                            {url.url_type}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteUrl(url.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add URL Dialog */}
      <Dialog open={urlDialogOpen} onOpenChange={setUrlDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Add Monitored URL</DialogTitle>
          </DialogHeader>
          <form onSubmit={addUrl} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">URL</Label>
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://acme.com/pricing"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Page Type</Label>
              <Select value={newUrlType} onValueChange={(v) => v && setNewUrlType(v)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {URL_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-zinc-100">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500">
              Add URL
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
