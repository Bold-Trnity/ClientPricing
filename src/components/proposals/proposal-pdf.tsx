"use client";

import { type PricingConfig, COUNTRIES } from "@/types";
import { formatDate } from "@/lib/utils";

interface Props {
  proposal: {
    title: string;
    client: { name: string; company: string | null; country: string | null };
    createdBy: { name: string | null; email: string };
  };
  version: {
    versionNumber: number;
    label: string | null;
    createdAt: Date | string;
  };
  pricingConfig: PricingConfig;
}

export function ProposalPDFContent({ proposal, version, pricingConfig }: Props) {
  const countryLabel = COUNTRIES.find(c => c.value === pricingConfig.country)?.label ?? pricingConfig.country;
  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + (pricingConfig.validityDays ?? 30));

  return (
    <div id="proposal-pdf-content" className="bg-white font-sans" style={{ width: "794px", minHeight: "1123px" }}>
      {/* Cover slide */}
      <div className="relative bg-gradient-to-br from-blue-900 to-blue-700 text-white p-16 min-h-[400px] flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold tracking-widest text-blue-200 uppercase mb-2">CONFIDENTIAL</div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Payment Processing<br />Pricing Proposal
          </h1>
          <p className="text-xl text-blue-200">
            Prepared for: <span className="text-white font-semibold">
              {proposal.client.company || proposal.client.name}
            </span>
          </p>
        </div>
        <div className="flex items-end justify-between">
          <div className="text-sm text-blue-200">
            <p>Date: {formatDate(today)}</p>
            <p>Valid Until: {formatDate(validUntil)}</p>
            <p>Version: {version.label ?? `v${version.versionNumber}`}</p>
          </div>
          <div className="text-right text-sm text-blue-200">
            <p className="font-semibold text-white">Prepared by</p>
            <p>{proposal.createdBy.name || proposal.createdBy.email}</p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="p-12 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
        <p className="text-gray-600 leading-relaxed">
          Thank you for the opportunity to present our payment processing solutions to{" "}
          <strong>{proposal.client.company || proposal.client.name}</strong>. This document outlines
          our competitive pricing structure for {countryLabel} market, designed to help you
          optimize your payment acceptance costs while ensuring a seamless customer experience.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-blue-50 p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{pricingConfig.paymentMethods.length}</p>
            <p className="text-xs text-gray-500 mt-1">Payment Methods</p>
          </div>
          <div className="rounded-xl bg-green-50 p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{countryLabel}</p>
            <p className="text-xs text-gray-500 mt-1">Market</p>
          </div>
          <div className="rounded-xl bg-purple-50 p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{pricingConfig.currency}</p>
            <p className="text-xs text-gray-500 mt-1">Currency</p>
          </div>
        </div>
      </div>

      {/* Pricing Table — replaces slides 7-10 */}
      <div className="p-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pricing Structure</h2>
        <p className="text-gray-500 text-sm mb-6">
          The following rates apply for {countryLabel} ({pricingConfig.currency}) transactions.
        </p>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="text-left px-4 py-3 text-sm font-semibold rounded-tl-lg">Payment Method</th>
              <th className="text-center px-4 py-3 text-sm font-semibold">MDR</th>
              <th className="text-center px-4 py-3 text-sm font-semibold">Transaction Fee</th>
              <th className="text-center px-4 py-3 text-sm font-semibold">Min Fee</th>
              <th className="text-center px-4 py-3 text-sm font-semibold">Settlement</th>
              <th className="text-left px-4 py-3 text-sm font-semibold rounded-tr-lg">Notes</th>
            </tr>
          </thead>
          <tbody>
            {pricingConfig.paymentMethods.map((pm, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b border-gray-100">
                  {pm.displayName}
                </td>
                <td className="px-4 py-3 text-sm text-center font-bold text-blue-600 border-b border-gray-100">
                  {pm.mdr}%
                </td>
                <td className="px-4 py-3 text-sm text-center text-gray-600 border-b border-gray-100">
                  {pm.transactionFee ? `${pm.currency} ${pm.transactionFee.toFixed(2)}` : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-center text-gray-600 border-b border-gray-100">
                  {pm.minFee ? `${pm.currency} ${pm.minFee.toFixed(2)}` : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-center text-gray-600 border-b border-gray-100">
                  {pm.settlementDays ? `T+${pm.settlementDays}` : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 border-b border-gray-100">
                  {pm.notes || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Example calculation */}
        {pricingConfig.paymentMethods.length > 0 && (
          <div className="mt-8 rounded-xl bg-blue-50 border border-blue-100 p-6">
            <h3 className="text-base font-semibold text-blue-900 mb-3">Example Calculation</h3>
            <p className="text-sm text-gray-600 mb-3">
              For a transaction of {pricingConfig.currency} 100.00 using {pricingConfig.paymentMethods[0].displayName}:
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction Amount</span>
                <span className="font-medium">{pricingConfig.currency} 100.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">MDR ({pricingConfig.paymentMethods[0].mdr}%)</span>
                <span className="font-medium text-red-600">
                  - {pricingConfig.currency} {(100 * pricingConfig.paymentMethods[0].mdr / 100).toFixed(2)}
                </span>
              </div>
              {pricingConfig.paymentMethods[0].transactionFee ? (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Fee</span>
                  <span className="font-medium text-red-600">
                    - {pricingConfig.currency} {pricingConfig.paymentMethods[0].transactionFee.toFixed(2)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-blue-200 pt-1 mt-1">
                <span className="font-semibold text-gray-900">Net Settlement</span>
                <span className="font-bold text-blue-700">
                  {pricingConfig.currency} {(100 - (100 * pricingConfig.paymentMethods[0].mdr / 100) - (pricingConfig.paymentMethods[0].transactionFee ?? 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Terms */}
        {pricingConfig.customTerms && (
          <div className="mt-8">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Terms & Conditions</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{pricingConfig.customTerms}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <p>This proposal is valid for {pricingConfig.validityDays ?? 30} days from the date of issue.</p>
            <p>Confidential — {proposal.client.company || proposal.client.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
