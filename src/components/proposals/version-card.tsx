"use client";

import { useState } from "react";
import {
  Send, Eye, CheckCircle, XCircle, Copy, Download, MoreHorizontal,
  Clock, AlertCircle, RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatDate } from "@/lib/utils";
import { PROPOSAL_STATUS_LABELS, type ProposalStatus } from "@/types";

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
  activities: { id: string; action: string; createdAt: string; user: { id: string; name: string | null } | null }[];
}

interface Props {
  version: Version;
  proposalId: string;
  onStatusChange: (versionId: string, newStatus: string) => void;
  onViewPDF: (version: Version) => void;
}

const badgeVariant: Record<string, "default" | "success" | "warning" | "danger" | "info" | "purple"> = {
  DRAFT: "default",
  SENT: "info",
  VIEWED: "purple",
  UNDER_REVIEW: "warning",
  AGREED: "success",
  REJECTED: "danger",
  EXPIRED: "warning",
};

export function VersionCard({ version, proposalId, onStatusChange, onViewPDF }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const pricing = JSON.parse(version.pricingData);

  async function updateStatus(status: string, extra?: Record<string, unknown>) {
    setLoading(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/versions/${version.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, generateShareLink: status === "SENT", shareExpiryDays: 30, ...extra }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      onStatusChange(version.id, updated.status);
    } finally {
      setLoading(false);
      setMenuOpen(false);
    }
  }

  function copyShareLink() {
    if (version.shareToken) {
      navigator.clipboard.writeText(
        `${window.location.origin}/share/${version.shareToken}`
      );
    }
  }

  const statusIcons: Record<string, React.ReactNode> = {
    DRAFT: <Clock className="h-3.5 w-3.5" />,
    SENT: <Send className="h-3.5 w-3.5" />,
    VIEWED: <Eye className="h-3.5 w-3.5" />,
    AGREED: <CheckCircle className="h-3.5 w-3.5" />,
    REJECTED: <XCircle className="h-3.5 w-3.5" />,
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold text-sm">
            {version.label ?? `v${version.versionNumber}`}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                {version.label ?? `Version ${version.versionNumber}`}
              </span>
              <Badge variant={badgeVariant[version.status] ?? "default"}>
                {statusIcons[version.status]}
                <span className="ml-1">{PROPOSAL_STATUS_LABELS[version.status as ProposalStatus] ?? version.status}</span>
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Created {formatDateTime(version.createdAt)}
              {version.viewCount > 0 && ` · ${version.viewCount} view${version.viewCount > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => { onViewPDF(version); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" /> View / Download PDF
                </button>
                {version.status === "DRAFT" && (
                  <button
                    onClick={() => updateStatus("SENT")}
                    disabled={loading}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    <Send className="h-4 w-4" /> Mark as Sent
                  </button>
                )}
                {version.shareToken && (
                  <button
                    onClick={copyShareLink}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4" /> Copy Share Link
                  </button>
                )}
                {(version.status === "SENT" || version.status === "VIEWED") && (
                  <>
                    <button
                      onClick={() => updateStatus("UNDER_REVIEW")}
                      disabled={loading}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                    >
                      <AlertCircle className="h-4 w-4" /> Mark Under Review
                    </button>
                    <button
                      onClick={() => updateStatus("AGREED")}
                      disabled={loading}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4" /> Mark as Agreed
                    </button>
                    <button
                      onClick={() => updateStatus("REJECTED")}
                      disabled={loading}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" /> Mark as Rejected
                    </button>
                  </>
                )}
                {version.status === "UNDER_REVIEW" && (
                  <>
                    <button
                      onClick={() => updateStatus("AGREED")}
                      disabled={loading}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4" /> Mark as Agreed
                    </button>
                    <button
                      onClick={() => updateStatus("REJECTED")}
                      disabled={loading}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" /> Mark as Rejected
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pricing summary */}
      <div className="px-4 pb-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">
              {pricing.country} · {pricing.currency}
            </span>
            <span className="text-xs text-gray-400">{pricing.paymentMethods.length} method(s)</span>
          </div>
          <div className="space-y-1">
            {pricing.paymentMethods.slice(0, 3).map((pm: { displayName: string; mdr: number; currency: string; transactionFee?: number }, i: number) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-gray-600">{pm.displayName}</span>
                <span className="font-semibold text-blue-600">
                  {pm.mdr}% MDR{pm.transactionFee ? ` + ${pm.currency} ${pm.transactionFee}` : ""}
                </span>
              </div>
            ))}
            {pricing.paymentMethods.length > 3 && (
              <p className="text-xs text-gray-400">+{pricing.paymentMethods.length - 3} more...</p>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          {version.sentAt && (
            <span>Sent: {formatDate(version.sentAt)}</span>
          )}
          {version.viewedAt && (
            <span>Viewed: {formatDate(version.viewedAt)}</span>
          )}
          {version.agreedAt && (
            <span className="text-green-600 font-medium">Agreed: {formatDate(version.agreedAt)}</span>
          )}
          {version.rejectedAt && (
            <span className="text-red-600 font-medium">Rejected: {formatDate(version.rejectedAt)}</span>
          )}
        </div>

        {version.rejectedNote && (
          <div className="mt-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
            Rejection note: {version.rejectedNote}
          </div>
        )}

        {version.shareToken && version.status !== "AGREED" && version.status !== "REJECTED" && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={copyShareLink}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
            >
              <Copy className="h-3 w-3" />
              Copy share link
            </button>
            {version.shareExpiry && (
              <span className="text-xs text-gray-400">
                · Expires {formatDate(version.shareExpiry)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
