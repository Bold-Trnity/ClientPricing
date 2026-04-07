"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Building2, Mail, Phone, Globe, Tag, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS, type ProposalStatus, COUNTRIES } from "@/types";
import { formatDate } from "@/lib/utils";

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
  proposals: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
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
  }[];
}

const badgeVariant: Record<string, "default" | "success" | "warning" | "danger" | "info" | "purple"> = {
  DRAFT: "default", SENT: "info", VIEWED: "purple",
  UNDER_REVIEW: "warning", AGREED: "success", REJECTED: "danger", EXPIRED: "warning",
};

export function ClientDetailView({ client }: { client: Client }) {
  const countryLabel = COUNTRIES.find(c => c.value === client.country)?.label ?? client.country;
  const totalProposals = client.proposals.length;
  const agreedProposals = client.proposals.filter(p => p.versions[0]?.status === "AGREED").length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link href="/clients" className="mt-1 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {client.company || client.name}
            </h1>
            {client.company && (
              <p className="text-sm text-gray-500">{client.name}</p>
            )}
          </div>
        </div>
        <Button asChild>
          <Link href={`/proposals/new?clientId=${client.id}`}>
            <Plus className="h-4 w-4" />
            New Proposal
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Client info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {client.phone}
                </div>
              )}
              {countryLabel && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Globe className="h-4 w-4 text-gray-400" />
                  {countryLabel}
                </div>
              )}
              {client.industry && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Tag className="h-4 w-4 text-gray-400" />
                  {client.industry}
                </div>
              )}
              {client.notes && (
                <p className="text-sm text-gray-500 border-t border-gray-100 pt-3 mt-3">
                  {client.notes}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="p-4 grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalProposals}</p>
                <p className="text-xs text-gray-500">Proposals</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{agreedProposals}</p>
                <p className="text-xs text-gray-500">Agreed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proposals */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Proposals ({totalProposals})
          </h2>

          {client.proposals.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
              <p className="text-sm text-gray-500">No proposals for this client yet.</p>
              <Button asChild size="sm" className="mt-3">
                <Link href={`/proposals/new?clientId=${client.id}`}>Create first proposal</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {client.proposals.map(p => {
                const latest = p.versions[0];
                const pricing = latest ? JSON.parse(latest.pricingData) : null;
                return (
                  <Link
                    key={p.id}
                    href={`/proposals/${p.id}`}
                    className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{p.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {p.versions.length} version(s) · Last updated {formatDate(p.updatedAt)}
                        </p>
                      </div>
                      {latest && (
                        <Badge variant={badgeVariant[latest.status] ?? "default"}>
                          {PROPOSAL_STATUS_LABELS[latest.status as ProposalStatus] ?? latest.status}
                        </Badge>
                      )}
                    </div>
                    {pricing && (
                      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                        <span>{COUNTRIES.find(c => c.value === pricing.country)?.label ?? pricing.country}</span>
                        <span>·</span>
                        <span>{pricing.paymentMethods?.length ?? 0} payment method(s)</span>
                        {pricing.paymentMethods?.length > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-blue-600 font-medium">
                              MDR from {Math.min(...pricing.paymentMethods.map((m: { mdr: number }) => m.mdr))}%
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
