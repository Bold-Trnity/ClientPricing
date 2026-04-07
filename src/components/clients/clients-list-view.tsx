"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Users, Building2, Mail, Globe, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES, INDUSTRIES } from "@/types";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  country: string | null;
  industry: string | null;
  notes: string | null;
  createdAt: string;
  proposals: { id: string; title: string; versions: { status: string }[] }[];
}

export function ClientsListView({ clients: initial }: { clients: Client[] }) {
  const router = useRouter();
  const [clients, setClients] = useState(initial);
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", country: "", industry: "", notes: "",
  });

  const filtered = clients.filter(c =>
    search === "" ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate() {
    setSaving(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      const client = await res.json();
      setClients(prev => [{ ...client, proposals: [] }, ...prev]);
      setShowNew(false);
      setForm({ name: "", email: "", phone: "", company: "", country: "", industry: "", notes: "" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-16 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            {search ? "No clients match your search" : "No clients yet"}
          </p>
          {!search && (
            <Button className="mt-4" onClick={() => setShowNew(true)}>Add your first client</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(client => {
            const activeProposals = client.proposals.length;
            const agreedCount = client.proposals.filter(p =>
              p.versions[0]?.status === "AGREED"
            ).length;
            const countryLabel = COUNTRIES.find(c => c.value === client.country)?.label ?? client.country;

            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-lg">
                    {(client.company || client.name)[0].toUpperCase()}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                </div>

                <h3 className="font-semibold text-gray-900">{client.company || client.name}</h3>
                {client.company && <p className="text-sm text-gray-500">{client.name}</p>}

                <div className="mt-3 space-y-1">
                  {client.email && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Mail className="h-3 w-3" /> {client.email}
                    </div>
                  )}
                  {countryLabel && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Globe className="h-3 w-3" /> {countryLabel}
                    </div>
                  )}
                  {client.industry && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Building2 className="h-3 w-3" /> {client.industry}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FileText className="h-3.5 w-3.5" />
                    {activeProposals} proposal{activeProposals !== 1 ? "s" : ""}
                  </div>
                  {agreedCount > 0 && (
                    <Badge variant="success">{agreedCount} agreed</Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Add Client Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Contact Name *"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="John Smith"
              />
              <Input
                label="Company Name"
                value={form.company}
                onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
                placeholder="Acme Corp"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="john@acme.com"
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+65 9123 4567"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <Select value={form.country} onValueChange={(v) => setForm(f => ({ ...f, country: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Industry</label>
                <Select value={form.industry} onValueChange={(v) => setForm(f => ({ ...f, industry: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any notes about this client..."
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name || saving}>
              {saving ? "Saving..." : "Add Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
