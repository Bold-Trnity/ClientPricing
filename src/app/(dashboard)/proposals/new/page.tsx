"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Users, Settings, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PricingBuilder } from "@/components/proposals/pricing-builder";
import { type PricingConfig } from "@/types";

const STEPS = [
  { id: 1, label: "Client", icon: Users },
  { id: 2, label: "Details", icon: FileText },
  { id: 3, label: "Pricing", icon: Settings },
  { id: 4, label: "Review", icon: Check },
];

const DEFAULT_PRICING: PricingConfig = {
  country: "SG",
  currency: "SGD",
  paymentMethods: [],
  validityDays: 30,
};

export default function NewProposalPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string; company: string | null }[]>([]);
  const [form, setForm] = useState({
    clientId: "",
    newClientName: "",
    newClientCompany: "",
    newClientEmail: "",
    createNewClient: false,
    title: "",
    notes: "",
    versionLabel: "v1",
  });
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients).catch(console.error);
  }, []);

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      let clientId = form.clientId;

      if (form.createNewClient) {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.newClientName,
            company: form.newClientCompany,
            email: form.newClientEmail,
          }),
        });
        if (!res.ok) throw new Error("Failed to create client");
        const client = await res.json();
        clientId = client.id;
      }

      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          clientId,
          notes: form.notes,
          pricingData: JSON.stringify(pricing),
          versionLabel: form.versionLabel,
        }),
      });

      if (!res.ok) throw new Error("Failed to create proposal");
      const proposal = await res.json();
      router.push(`/proposals/${proposal.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const canProceed = () => {
    if (step === 1) return form.createNewClient ? !!form.newClientName : !!form.clientId;
    if (step === 2) return !!form.title;
    if (step === 3) return pricing.paymentMethods.length > 0;
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">New Pricing Proposal</h1>
        </div>

        <div className="flex items-center">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  step > s.id ? "bg-blue-600 text-white" :
                  step === s.id ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  {step > s.id ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </div>
                <span className={`text-xs mt-1 font-medium ${step >= s.id ? "text-blue-600" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 mx-2 ${step > s.id ? "bg-blue-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Client */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Select Client</h2>
              <p className="text-sm text-gray-500 mt-1">Choose an existing client or create a new one.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setForm(f => ({ ...f, createNewClient: false }))}
                className={`flex-1 rounded-xl border-2 p-4 text-left transition-colors ${
                  !form.createNewClient ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-medium text-gray-900 text-sm">Existing Client</p>
                <p className="text-xs text-gray-500 mt-0.5">Select from your client list</p>
              </button>
              <button
                onClick={() => setForm(f => ({ ...f, createNewClient: true }))}
                className={`flex-1 rounded-xl border-2 p-4 text-left transition-colors ${
                  form.createNewClient ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-medium text-gray-900 text-sm">New Client</p>
                <p className="text-xs text-gray-500 mt-0.5">Create a new client profile</p>
              </button>
            </div>

            {!form.createNewClient ? (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Client</label>
                <Select value={form.clientId} onValueChange={(v) => setForm(f => ({ ...f, clientId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.company ? `${c.company} (${c.name})` : c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {clients.length === 0 && (
                  <p className="text-xs text-gray-500">No clients yet. Create a new one above.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Contact Name *"
                  value={form.newClientName}
                  onChange={(e) => setForm(f => ({ ...f, newClientName: e.target.value }))}
                  placeholder="John Smith"
                />
                <Input
                  label="Company Name"
                  value={form.newClientCompany}
                  onChange={(e) => setForm(f => ({ ...f, newClientCompany: e.target.value }))}
                  placeholder="Acme Corp"
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.newClientEmail}
                  onChange={(e) => setForm(f => ({ ...f, newClientEmail: e.target.value }))}
                  placeholder="john@acme.com"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Proposal Details</h2>
              <p className="text-sm text-gray-500 mt-1">Give your proposal a descriptive title.</p>
            </div>
            <Input
              label="Proposal Title *"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g., Payment Processing Proposal - Q2 2025"
            />
            <Input
              label="Version Label"
              value={form.versionLabel}
              onChange={(e) => setForm(f => ({ ...f, versionLabel: e.target.value }))}
              placeholder="v1"
            />
            <Textarea
              label="Internal Notes (not shown to client)"
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Add any internal notes about this proposal..."
              rows={3}
            />
          </div>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Configure Pricing</h2>
              <p className="text-sm text-gray-500 mt-1">Add payment methods and set rates for this proposal.</p>
            </div>
            <PricingBuilder value={pricing} onChange={setPricing} />
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Review Proposal</h2>
              <p className="text-sm text-gray-500 mt-1">Review your proposal before creating it.</p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 p-4 space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</h4>
                <p className="text-sm font-medium text-gray-900">
                  {form.createNewClient
                    ? `${form.newClientCompany || form.newClientName} (new)`
                    : clients.find(c => c.id === form.clientId)?.company ?? clients.find(c => c.id === form.clientId)?.name ?? "—"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4 space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Proposal</h4>
                <p className="text-sm font-medium text-gray-900">{form.title}</p>
                <p className="text-xs text-gray-500">Version: {form.versionLabel}</p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4 space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Pricing — {pricing.country} ({pricing.currency})
                </h4>
                {pricing.paymentMethods.map((pm, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-200 last:border-0">
                    <span className="text-sm text-gray-700">{pm.displayName}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-blue-600">{pm.mdr}% MDR</span>
                      {pm.transactionFee ? (
                        <span className="text-xs text-gray-500 ml-2">+ {pm.currency} {pm.transactionFee}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => step > 1 ? setStep(s => s - 1) : router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 1 ? "Cancel" : "Back"}
        </Button>

        {step < 4 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Proposal"}
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
