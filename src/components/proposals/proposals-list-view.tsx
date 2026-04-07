"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, FileText, Building2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS, type ProposalStatus } from "@/types";
import { formatDate } from "@/lib/utils";

interface Proposal {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string; company: string | null; country: string | null };
  versions: {
    id: string;
    versionNumber: number;
    label: string | null;
    status: string;
    pricingData: string;
    sentAt: string | null;
    agreedAt: string | null;
  }[];
  createdBy: { name: string | null; email: string };
}

const badgeVariant: Record<string, "default" | "success" | "warning" | "danger" | "info" | "purple"> = {
  DRAFT: "default", SENT: "info", VIEWED: "purple",
  UNDER_REVIEW: "warning", AGREED: "success", REJECTED: "danger", EXPIRED: "warning",
};

export function ProposalsListView({ proposals }: { proposals: Proposal[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = proposals.filter(p => {
    const matchSearch = search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.client.company ?? p.client.name).toLowerCase().includes(search.toLowerCase());
    const latestStatus = p.versions[0]?.status ?? "DRAFT";
    const matchStatus = statusFilter === "ALL" || latestStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
          <p className="text-sm text-gray-500 mt-0.5">{proposals.length} total proposal{proposals.length !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild>
          <Link href="/proposals/new">
            <Plus className="h-4 w-4" />
            New Proposal
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search proposals..."
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {["ALL", ...Object.keys(PROPOSAL_STATUS_LABELS)].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status === "ALL" ? "All" : PROPOSAL_STATUS_LABELS[status as ProposalStatus]}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-16 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            {search || statusFilter !== "ALL" ? "No proposals match your filters" : "No proposals yet"}
          </p>
          {!search && statusFilter === "ALL" && (
            <Button asChild className="mt-4">
              <Link href="/proposals/new">Create your first proposal</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Proposal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Latest Version</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Updated</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => {
                const latest = p.versions[0];
                const pricing = latest ? JSON.parse(latest.pricingData) : null;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/proposals/${p.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                        {p.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">{p.versions.length} version(s)</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-700">{p.client.company || p.client.name}</p>
                          {p.client.company && (
                            <p className="text-xs text-gray-400">{p.client.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {latest ? (
                        <div>
                          <p className="text-sm text-gray-700">{latest.label ?? `v${latest.versionNumber}`}</p>
                          {pricing && (
                            <p className="text-xs text-gray-400">
                              {pricing.country} · {pricing.paymentMethods?.length ?? 0} method(s)
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {latest ? (
                        <Badge variant={badgeVariant[latest.status] ?? "default"}>
                          {PROPOSAL_STATUS_LABELS[latest.status as ProposalStatus] ?? latest.status}
                        </Badge>
                      ) : (
                        <Badge variant="default">Draft</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(p.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/proposals/${p.id}`} className="text-gray-400 hover:text-gray-600">
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
