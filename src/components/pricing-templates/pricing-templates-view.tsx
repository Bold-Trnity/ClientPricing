"use client";

import { useState } from "react";
import { Plus, Database, Edit2, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES, PAYMENT_METHODS } from "@/types";

interface Template {
  id: string;
  name: string;
  country: string;
  paymentMethod: string;
  currency: string;
  data: string;
  isActive: boolean;
  createdAt: string;
}

export function PricingTemplatesView({ templates: initial }: { templates: Template[] }) {
  const [templates, setTemplates] = useState(initial);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState({
    name: "", country: "SG", paymentMethod: "VISA_MASTERCARD", currency: "SGD",
    mdr: "2.5", transactionFee: "0", minFee: "0", maxFee: "0", settlementDays: "3", notes: "",
  });

  async function handleCreate() {
    setSaving(true);
    try {
      const data = JSON.stringify({
        mdr: parseFloat(form.mdr),
        transactionFee: parseFloat(form.transactionFee),
        minFee: parseFloat(form.minFee),
        maxFee: parseFloat(form.maxFee),
        settlementDays: parseInt(form.settlementDays),
        notes: form.notes,
      });

      const res = await fetch("/api/pricing-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          country: form.country,
          paymentMethod: form.paymentMethod,
          currency: form.currency,
          data,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const template = await res.json();
      setTemplates(prev => [template, ...prev]);
      setShowNew(false);
    } finally {
      setSaving(false);
    }
  }

  const groupedByCountry = templates.reduce((acc, t) => {
    if (!acc[t.country]) acc[t.country] = [];
    acc[t.country].push(t);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing Templates</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Your base pricing rates by country and payment method. Synced from Google Sheets.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={syncing} onClick={() => setSyncing(true)}>
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            Sync from Sheets
          </Button>
          <Button onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" />
            Add Rate
          </Button>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800">
        <strong>Google Sheets Integration:</strong> Connect your pricing sheet to auto-populate rates.
        Go to Settings to configure your Google Sheets API credentials, then click &quot;Sync from Sheets&quot;.
      </div>

      {templates.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-16 text-center">
          <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No pricing templates yet</p>
          <p className="text-sm text-gray-400 mt-1">Add rates manually or sync from Google Sheets</p>
          <Button className="mt-4" onClick={() => setShowNew(true)}>Add first rate</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByCountry).map(([country, countryTemplates]) => {
            const countryLabel = COUNTRIES.find(c => c.value === country)?.label ?? country;
            return (
              <div key={country}>
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="text-base">{countryLabel}</span>
                  <Badge variant="default">{countryTemplates.length} rate(s)</Badge>
                </h2>
                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Name</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Payment Method</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">MDR</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Txn Fee</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Settlement</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {countryTemplates.map(t => {
                        const d = JSON.parse(t.data);
                        const pmLabel = PAYMENT_METHODS.find(m => m.value === t.paymentMethod)?.label ?? t.paymentMethod;
                        return (
                          <tr key={t.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{pmLabel}</td>
                            <td className="px-4 py-3 text-sm text-center font-bold text-blue-600">{d.mdr}%</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">
                              {d.transactionFee ? `${t.currency} ${d.transactionFee}` : "—"}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">
                              {d.settlementDays ? `T+${d.settlementDays}` : "—"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant={t.isActive ? "success" : "default"}>
                                {t.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Template Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Pricing Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              label="Rate Name"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Standard Visa Rate"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <Select
                  value={form.country}
                  onValueChange={(v) => {
                    const c = COUNTRIES.find(x => x.value === v);
                    setForm(f => ({ ...f, country: v, currency: c?.currency ?? f.currency }));
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <Select value={form.paymentMethod} onValueChange={(v) => setForm(f => ({ ...f, paymentMethod: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="MDR %" value={form.mdr} onChange={(e) => setForm(f => ({ ...f, mdr: e.target.value }))} type="number" step="0.01" />
              <Input label="Txn Fee" value={form.transactionFee} onChange={(e) => setForm(f => ({ ...f, transactionFee: e.target.value }))} type="number" step="0.01" />
              <Input label="Settlement (days)" value={form.settlementDays} onChange={(e) => setForm(f => ({ ...f, settlementDays: e.target.value }))} type="number" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name || saving}>
              {saving ? "Saving..." : "Add Rate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
