import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default admin user
  const hashedPassword = await bcrypt.hash("Admin1234!", 12);
  const user = await prisma.user.upsert({
    where: { email: "admin@paypricing.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@paypricing.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", user.email);

  // Seed sample pricing templates
  const templates = [
    { name: "Visa/MC Standard", country: "SG", paymentMethod: "VISA_MASTERCARD", currency: "SGD", mdr: 2.5, txnFee: 0, settlement: 3 },
    { name: "Visa/MC Standard", country: "MY", paymentMethod: "VISA_MASTERCARD", currency: "MYR", mdr: 2.8, txnFee: 0, settlement: 3 },
    { name: "Visa/MC Standard", country: "TH", paymentMethod: "VISA_MASTERCARD", currency: "THB", mdr: 2.8, txnFee: 0, settlement: 3 },
    { name: "Visa/MC Standard", country: "PH", paymentMethod: "VISA_MASTERCARD", currency: "PHP", mdr: 3.0, txnFee: 0, settlement: 3 },
    { name: "AmEx Standard", country: "SG", paymentMethod: "AMEX", currency: "SGD", mdr: 3.5, txnFee: 0, settlement: 3 },
    { name: "Bank Transfer", country: "SG", paymentMethod: "BANK_TRANSFER", currency: "SGD", mdr: 0.8, txnFee: 0.5, settlement: 1 },
    { name: "e-Wallet", country: "SG", paymentMethod: "EWALLET", currency: "SGD", mdr: 1.5, txnFee: 0, settlement: 1 },
    { name: "QR Payment", country: "SG", paymentMethod: "QR_CODE", currency: "SGD", mdr: 1.0, txnFee: 0, settlement: 1 },
    { name: "GrabPay/PayNow", country: "MY", paymentMethod: "EWALLET", currency: "MYR", mdr: 1.8, txnFee: 0, settlement: 1 },
  ];

  for (const t of templates) {
    await prisma.pricingTemplate.upsert({
      where: { id: `seed_${t.country}_${t.paymentMethod}` },
      update: {},
      create: {
        id: `seed_${t.country}_${t.paymentMethod}`,
        name: t.name,
        country: t.country,
        paymentMethod: t.paymentMethod,
        currency: t.currency,
        data: JSON.stringify({
          mdr: t.mdr,
          transactionFee: t.txnFee,
          minFee: 0,
          maxFee: 0,
          settlementDays: t.settlement,
        }),
        isActive: true,
      },
    });
  }

  console.log(`Created ${templates.length} pricing templates`);

  // Create a sample client and proposal
  const client = await prisma.client.upsert({
    where: { id: "sample_client" },
    update: {},
    create: {
      id: "sample_client",
      name: "Jane Doe",
      company: "TechMart Pte Ltd",
      email: "jane@techmart.sg",
      phone: "+65 9123 4567",
      country: "SG",
      industry: "E-Commerce",
    },
  });

  const proposal = await prisma.proposal.upsert({
    where: { id: "sample_proposal" },
    update: {},
    create: {
      id: "sample_proposal",
      title: "Payment Processing Proposal - TechMart",
      clientId: client.id,
      createdById: user.id,
      notes: "Initial proposal for TechMart e-commerce platform",
      versions: {
        create: [
          {
            versionNumber: 1,
            label: "v1 — Initial",
            status: "AGREED",
            agreedAt: new Date("2025-03-01"),
            sentAt: new Date("2025-02-25"),
            viewedAt: new Date("2025-02-26"),
            pricingData: JSON.stringify({
              country: "SG",
              currency: "SGD",
              validityDays: 30,
              paymentMethods: [
                { method: "VISA_MASTERCARD", displayName: "Visa / Mastercard", mdr: 2.8, transactionFee: 0, currency: "SGD", settlementDays: 3 },
                { method: "AMEX", displayName: "American Express", mdr: 3.5, transactionFee: 0, currency: "SGD", settlementDays: 3 },
                { method: "EWALLET", displayName: "e-Wallet", mdr: 1.5, transactionFee: 0, currency: "SGD", settlementDays: 1 },
              ],
            }),
          },
          {
            versionNumber: 2,
            label: "v2 — Revised",
            status: "SENT",
            sentAt: new Date("2025-04-01"),
            shareToken: "sample-share-token-12345",
            shareExpiry: new Date("2025-05-01"),
            pricingData: JSON.stringify({
              country: "SG",
              currency: "SGD",
              validityDays: 30,
              paymentMethods: [
                { method: "VISA_MASTERCARD", displayName: "Visa / Mastercard", mdr: 2.5, transactionFee: 0, currency: "SGD", settlementDays: 3 },
                { method: "AMEX", displayName: "American Express", mdr: 3.2, transactionFee: 0, currency: "SGD", settlementDays: 3 },
                { method: "EWALLET", displayName: "e-Wallet", mdr: 1.2, transactionFee: 0, currency: "SGD", settlementDays: 1 },
                { method: "QR_CODE", displayName: "QR Code Payment", mdr: 0.9, transactionFee: 0, currency: "SGD", settlementDays: 1 },
              ],
            }),
          },
        ],
      },
    },
  });

  console.log("Created sample client and proposal:", proposal.title);
  console.log("\n=== SEED COMPLETE ===");
  console.log("Login: admin@paypricing.com / Admin1234!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
