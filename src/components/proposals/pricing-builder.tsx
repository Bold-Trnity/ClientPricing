"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Info } from "lucide-react";
import { PAYMENT_METHODS, COUNTRIES, type PricingConfig, type PaymentMethodPricing } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Props {
  value: PricingConfig;
  onChange: (config: PricingConfig) => void;
}

const DEFAULT_METHOD: Omit<PaymentMethodPricing, "method" | "displayName"> = {
  mdr: 2.5,
  transactionFee: 0,
  minFee: 0,
  maxFee: 0,
  settlementDays: 3,
  currency: "USD",
  notes: "",
};

export function PricingBuilder({ value, onChange }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const selectedCountry = COUNTRIES.find(c => c.value === value.country);

  function updateField(field: keyof PricingConfig, val: unknown) {
    const updated = { ...value, [field]: val };
    // Auto-update currency when country changes
    if (field === "country") {
      const country = COUNTRIES.find(c => c.value === val);
      updated.currency = country?.currency ?? value.currency;
      // Update all payment method currencies
      updated.paymentMethods = value.paymentMethods.map(pm => ({
        ...pm,
        currency: country?.currency ?? pm.currency,
      }));
    }
    onChange(updated);
  }

  function addPaymentMethod() {
    const newMethod: PaymentMethodPricing = {
      method: "VISA_MASTERCARD",
      displayName: "Visa / Mastercard",
      ...DEFAULT_METHOD,
      currency: selectedCountry?.currency ?? "USD",
    };
    onChange({
      ...value,
      paymentMethods: [...value.paymentMethods, newMethod],
    });
    setExpandedIndex(value.paymentMethods.length);
  }

  function removePaymentMethod(index: number) {
    const updated = value.paymentMethods.filter((_, i) => i !== index);
    onChange({ ...value, paymentMethods: updated });
    setExpandedIndex(null);
  }

  function updateMethod(index: number, field: keyof PaymentMethodPricing, val: unknown) {
    const updated = value.paymentMethods.map((pm, i) => {
      if (i !== index) return pm;
      const patch = { ...pm, [field]: val };
      if (field === "method") {
        const found = PAYMENT_METHODS.find(m => m.value === val);
        patch.displayName = found?.label ?? val as string;
      }
      return patch;
    });
    onChange({ ...value, paymentMethods: updated });
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">General Settings</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <Select value={value.country} onValueChange={(v) => updateField("country", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Transaction Currency</label>
            <Input
              value={value.currency}
              onChange={(e) => updateField("currency", e.target.value.toUpperCase())}
              placeholder="USD"
              maxLength={3}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Settlement Currency</label>
            <Input
              value={value.settlementCurrency ?? ""}
              onChange={(e) => updateField("settlementCurrency", e.target.value.toUpperCase())}
              placeholder="Same as transaction"
              maxLength={3}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Proposal Validity (days)</label>
            <Input
              type="number"
              value={value.validityDays ?? 30}
              onChange={(e) => updateField("validityDays", parseInt(e.target.value) || 30)}
              min={1}
              max={365}
            />
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Payment Methods & Rates</h3>
          <Button size="sm" onClick={addPaymentMethod}>
            <Plus className="h-4 w-4" />
            Add Method
          </Button>
        </div>

        {value.paymentMethods.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">No payment methods added yet.</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={addPaymentMethod}>
              <Plus className="h-4 w-4" />
              Add Payment Method
            </Button>
          </div>
        )}

        {value.paymentMethods.map((pm, index) => (
          <div key={index} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-xs font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{pm.displayName || pm.method}</p>
                  <p className="text-xs text-gray-500">
                    MDR: <span className="font-semibold text-blue-600">{pm.mdr}%</span>
                    {pm.transactionFee ? ` + ${pm.currency} ${pm.transactionFee} per txn` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); removePaymentMethod(index); }}
                  className="rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {expandedIndex === index ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Expanded form */}
            {expandedIndex === index && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <Select value={pm.method} onValueChange={(v) => updateMethod(index, "method", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      MDR (%)
                      <span className="text-xs text-gray-400 font-normal">Merchant Discount Rate</span>
                    </label>
                    <input
                      type="number"
                      value={pm.mdr}
                      onChange={(e) => updateMethod(index, "mdr", parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      max="100"
                      className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Transaction Fee</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={pm.transactionFee ?? 0}
                        onChange={(e) => updateMethod(index, "transactionFee", parseFloat(e.target.value) || 0)}
                        step="0.01"
                        min="0"
                        className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <Input
                        value={pm.currency}
                        onChange={(e) => updateMethod(index, "currency", e.target.value.toUpperCase())}
                        className="w-20"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Min Fee</label>
                    <input
                      type="number"
                      value={pm.minFee ?? 0}
                      onChange={(e) => updateMethod(index, "minFee", parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Max Fee</label>
                    <input
                      type="number"
                      value={pm.maxFee ?? 0}
                      onChange={(e) => updateMethod(index, "maxFee", parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Settlement (days)</label>
                    <input
                      type="number"
                      value={pm.settlementDays ?? 3}
                      onChange={(e) => updateMethod(index, "settlementDays", parseInt(e.target.value) || 3)}
                      min="0"
                      max="90"
                      className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                    <input
                      type="text"
                      value={pm.notes ?? ""}
                      onChange={(e) => updateMethod(index, "notes", e.target.value)}
                      placeholder="e.g., Domestic cards only, 3D Secure required..."
                      className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Terms */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Custom Terms & Conditions</h3>
        <textarea
          value={value.customTerms ?? ""}
          onChange={(e) => updateField("customTerms", e.target.value)}
          rows={4}
          placeholder="Add any custom terms, conditions, or notes to include in the proposal..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}
