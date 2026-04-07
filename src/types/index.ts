export type ProposalStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "UNDER_REVIEW"
  | "AGREED"
  | "REJECTED"
  | "EXPIRED";

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  UNDER_REVIEW: "Under Review",
  AGREED: "Agreed",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

export const PROPOSAL_STATUS_COLORS: Record<ProposalStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  VIEWED: "bg-purple-100 text-purple-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  AGREED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-orange-100 text-orange-700",
};

export interface PricingConfig {
  paymentMethods: PaymentMethodPricing[];
  country: string;
  currency: string;
  settlementCurrency?: string;
  validityDays?: number;
  customTerms?: string;
}

export interface PaymentMethodPricing {
  method: string;
  displayName: string;
  mdr: number; // Merchant Discount Rate %
  transactionFee?: number;
  minFee?: number;
  maxFee?: number;
  settlementDays?: number;
  currency: string;
  notes?: string;
}

export const PAYMENT_METHODS = [
  { value: "VISA_MASTERCARD", label: "Visa / Mastercard" },
  { value: "AMEX", label: "American Express" },
  { value: "LOCAL_DEBIT", label: "Local Debit Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "EWALLET", label: "e-Wallet" },
  { value: "QR_CODE", label: "QR Code Payment" },
  { value: "BNPL", label: "Buy Now Pay Later" },
  { value: "CRYPTO", label: "Cryptocurrency" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "ALIPAY", label: "Alipay" },
  { value: "WECHAT_PAY", label: "WeChat Pay" },
] as const;

export const COUNTRIES = [
  { value: "SG", label: "Singapore", currency: "SGD" },
  { value: "MY", label: "Malaysia", currency: "MYR" },
  { value: "TH", label: "Thailand", currency: "THB" },
  { value: "PH", label: "Philippines", currency: "PHP" },
  { value: "ID", label: "Indonesia", currency: "IDR" },
  { value: "VN", label: "Vietnam", currency: "VND" },
  { value: "HK", label: "Hong Kong", currency: "HKD" },
  { value: "AU", label: "Australia", currency: "AUD" },
  { value: "US", label: "United States", currency: "USD" },
  { value: "GB", label: "United Kingdom", currency: "GBP" },
  { value: "AE", label: "UAE", currency: "AED" },
] as const;

export const INDUSTRIES = [
  "E-Commerce",
  "Retail",
  "Travel & Hospitality",
  "Food & Beverage",
  "Healthcare",
  "Education",
  "Financial Services",
  "Gaming",
  "Marketplace",
  "SaaS / Subscription",
  "Logistics",
  "Other",
] as const;

export interface ClientWithProposals {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  country: string | null;
  industry: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  proposals: ProposalWithVersions[];
}

export interface ProposalWithVersions {
  id: string;
  title: string;
  clientId: string;
  createdById: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  versions: ProposalVersionSummary[];
}

export interface ProposalVersionSummary {
  id: string;
  proposalId: string;
  versionNumber: number;
  label: string | null;
  status: ProposalStatus;
  pricingData: string;
  pdfUrl: string | null;
  shareToken: string | null;
  shareExpiry: Date | null;
  viewedAt: Date | null;
  viewCount: number;
  sentAt: Date | null;
  agreedAt: Date | null;
  rejectedAt: Date | null;
  rejectedNote: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
