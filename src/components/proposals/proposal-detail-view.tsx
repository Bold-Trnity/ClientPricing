"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Plus, Download, Share2, Building2, Mail, Phone, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VersionCard } from "@/components/proposals/version-card";
import { ProposalPDFContent } from "@/components/proposals/proposal-pdf";
import { PricingBuilder } from "@/components/proposals/pricing-builder";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type PricingConfig } from "@/types";
import { formatDate } from "@/lib/utils";

interface Activity {
  id: string;
  action: string;
  createdAt: string;
  user: { id: string; name: string | null } | null;
}

interface Version {
  id: string;
  versionNumber: number;
  label: string | null;
  status: string;
  pricingData: string;
  shareToken: string | null;
  shareExpiry: string | null;
  viewedAt: string | null;
  viewCount: number;
  sentAt: string | null;
  agreedAt: string | null;
  rejectedAt: string | null;
  rejectedNote: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  activities: Activity[];
}

interface Proposal {
  id: string;
  title: string;
  notes: string | null;
  createdAt: string;
  client: {
    id: string;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    country: string | null;
  };
  versions: Version[];
  createdBy: { id: string; name: string | null; email: string };
}

export function ProposalDetailView({ proposal: initial }: { proposal: Proposal }) {
  const router = useRouter();
  const [proposal, setProposal] = useState(initial);
  const [showPDF, setShowPDF] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [newVersionPricing, setNewVersionPricing] = useState<PricingConfig | null>(null);
  const [newVersionLabel, setNewVersionLabel] = useState("");
  const [newVersionNotes, setNewVersionNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  function handleStatusChange(versionId: string, newStatus: string) {
    setProposal(p => ({
      ...p,
      versions: p.versions.map(v =>
        v.id === versionId ? { ...v, status: newStatus } : v
      ),
    }));
  }

  function handleViewPDF(version: Version) {
    setSelectedVersion(version);
    setShowPDF(true);
  }

  function handleNewVersion() {
    // Clone latest version pricing as starting point
    const latest = proposal.versions[0];
    if (latest) {
      setNewVersionPricing(JSON.parse(latest.pricingData));
      setNewVersionLabel(`v${latest.versionNumber + 1}`);
    } else {
      setNewVersionPricing({ country: "SG", currency: "SGD", paymentMethods: [], validityDays: 30 });
      setNewVersionLabel("v1");
    }
    setShowNewVersion(true);
  }

  async function saveNewVersion() {
    if (!newVersionPricing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricingData: JSON.stringify(newVersionPricing),
          label: newVersionLabel,
          notes: newVersionNotes,
        }),
      });
      if (!res.ok) throw new Error("Failed to create version");
      router.refresh();
      setShowNewVersion(false);
    } finally {
      setSaving(false);
    }
  }

  async function downloadPDF() {
    if (!selectedVersion) return;
    // Dynamic import to avoid SSR issues
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    const el = document.getElementById("proposal-pdf-content");
    if (!el) return;

    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = (canvas.height * pageWidth) / canvas.width;

    let yPosition = 0;
    const a4Height = pdf.internal.pageSize.getHeight();

    while (yPosition < pageHeight) {
      if (yPosition > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, -yPosition, pageWidth, pageHeight);
      yPosition += a4Height;
    }

    const filename = `${proposal.title}-${selectedVersion.label ?? `v${selectedVersion.versionNumber}`}.pdf`;
    pdf.save(filename);
  }

  const latestVersion = proposal.versions[0];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link href="/proposals" className="mt-1 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {proposal.client.company || proposal.client.name} · Created {formatDate(proposal.createdAt)}
            </p>
          </div>
        </div>
        <Button onClick={handleNewVersion}>
          <Plus className="h-4 w-4" />
          New Version
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Versions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Versions ({proposal.versions.length})
          </h2>

          {proposal.versions.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
              <p className="text-sm text-gray-500">No versions yet.</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={handleNewVersion}>
                Create first version
              </Button>
            </div>
          ) : (
            proposal.versions.map(version => (
              <VersionCard
                key={version.id}
                version={version}
                proposalId={proposal.id}
                onStatusChange={handleStatusChange}
                onViewPDF={handleViewPDF}
              />
            ))
          )}
        </div>

        {/* Right: Client info + Activity */}
        <div className="space-y-4">
          {/* Client card */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              Client
            </h3>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{proposal.client.company || proposal.client.name}</p>
              {proposal.client.company && (
                <p className="text-sm text-gray-500">{proposal.client.name}</p>
              )}
              {proposal.client.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  {proposal.client.email}
                </div>
              )}
              {proposal.client.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  {proposal.client.phone}
                </div>
              )}
              {proposal.client.country && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="h-3.5 w-3.5 text-gray-400" />
                  {proposal.client.country}
                </div>
              )}
            </div>
            <Link href={`/clients/${proposal.client.id}`} className="mt-3 text-xs text-blue-600 hover:underline block">
              View client profile →
            </Link>
          </div>

          {/* Activity log */}
          {latestVersion?.activities && latestVersion.activities.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {latestVersion.activities.map(a => (
                  <div key={a.id} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-700">
                        {a.action.replace(/_/g, " ").toLowerCase()}
                        {a.user && ` by ${a.user.name}`}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(a.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Preview Dialog */}
      <Dialog open={showPDF} onOpenChange={setShowPDF}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <DialogTitle>
                Proposal Preview — {selectedVersion?.label ?? `v${selectedVersion?.versionNumber}`}
              </DialogTitle>
              <Button size="sm" onClick={downloadPDF}>
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </DialogHeader>
          {selectedVersion && (
            <div ref={pdfRef}>
              <ProposalPDFContent
                proposal={{
                  title: proposal.title,
                  client: proposal.client,
                  createdBy: proposal.createdBy,
                }}
                version={selectedVersion}
                pricingConfig={JSON.parse(selectedVersion.pricingData)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Version Dialog */}
      <Dialog open={showNewVersion} onOpenChange={setShowNewVersion}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Version Label"
                value={newVersionLabel}
                onChange={(e) => setNewVersionLabel(e.target.value)}
                placeholder="v2"
              />
            </div>
            <Textarea
              label="Notes (internal)"
              value={newVersionNotes}
              onChange={(e) => setNewVersionNotes(e.target.value)}
              placeholder="Why was this version created? e.g., Revised MDR from 7% to 6.5%"
            />
            {newVersionPricing && (
              <PricingBuilder value={newVersionPricing} onChange={setNewVersionPricing} />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewVersion(false)}>Cancel</Button>
            <Button onClick={saveNewVersion} disabled={saving}>
              {saving ? "Saving..." : "Create Version"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
