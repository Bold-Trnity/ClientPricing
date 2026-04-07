"use client";

import { Users, FileText, CheckCircle, TrendingUp, Clock, Eye, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS, type ProposalStatus } from "@/types";
import Link from "next/link";

interface Props {
  stats: { clients: number; proposals: number };
  statusCounts: { status: string; _count: number }[];
  recentVersions: {
    id: string;
    versionNumber: number;
    status: string;
    label: string | null;
    updatedAt: Date;
    proposal: {
      id: string;
      title: string;
      client: { id: string; name: string; company: string | null };
    };
  }[];
  userName: string;
}

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info" | "purple"> = {
  DRAFT: "default",
  SENT: "info",
  VIEWED: "purple",
  UNDER_REVIEW: "warning",
  AGREED: "success",
  REJECTED: "danger",
  EXPIRED: "warning",
};

export function DashboardContent({ stats, statusCounts, recentVersions, userName }: Props) {
  const agreed = statusCounts.find(s => s.status === "AGREED")?._count ?? 0;
  const pending = statusCounts
    .filter(s => ["SENT", "VIEWED", "UNDER_REVIEW"].includes(s.status))
    .reduce((sum, s) => sum + s._count, 0);

  const statCards = [
    { label: "Total Clients", value: stats.clients, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Proposals", value: stats.proposals, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Pending Response", value: pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Agreed", value: agreed, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good morning, {userName}!</h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s your pricing proposal overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Proposals</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentVersions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No proposals yet</p>
                  <Link
                    href="/proposals/new"
                    className="mt-3 text-sm text-blue-600 font-medium hover:underline"
                  >
                    Create your first proposal
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentVersions.map((v) => (
                    <Link
                      key={v.id}
                      href={`/proposals/${v.proposal.id}`}
                      className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {v.proposal.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {v.proposal.client.company ?? v.proposal.client.name} · {v.label ?? `v${v.versionNumber}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PROPOSAL_STATUS_COLORS[v.status as ProposalStatus]}`}>
                          {PROPOSAL_STATUS_LABELS[v.status as ProposalStatus] ?? v.status}
                        </span>
                        <span className="text-xs text-gray-400">{formatDateTime(v.updatedAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>By Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(PROPOSAL_STATUS_LABELS).map(([status, label]) => {
                  const count = statusCounts.find(s => s.status === status)?._count ?? 0;
                  const total = statusCounts.reduce((sum, s) => sum + s._count, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <Badge variant={statusVariant[status] ?? "default"}>
                        {label}
                      </Badge>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/proposals/new"
                className="flex items-center gap-2 w-full rounded-lg bg-blue-50 hover:bg-blue-100 px-4 py-2.5 text-sm font-medium text-blue-700 transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                New Pricing Proposal
              </Link>
              <Link
                href="/clients/new"
                className="flex items-center gap-2 w-full rounded-lg bg-gray-50 hover:bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors"
              >
                <Users className="h-4 w-4" />
                Add New Client
              </Link>
              <Link
                href="/proposals?status=SENT"
                className="flex items-center gap-2 w-full rounded-lg bg-gray-50 hover:bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                View Sent Proposals
              </Link>
              <Link
                href="/proposals?status=VIEWED"
                className="flex items-center gap-2 w-full rounded-lg bg-gray-50 hover:bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
                View Opened Proposals
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
