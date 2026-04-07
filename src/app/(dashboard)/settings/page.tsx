"use client";

import { useState } from "react";
import { Key, Database, Bell, Shield, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your integrations and preferences.</p>
      </div>

      {/* Google Sheets Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            Google Sheets Integration
          </CardTitle>
          <CardDescription>
            Connect your pricing Google Sheet to automatically sync rates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
            <strong>Setup Required:</strong> To enable Google Sheets sync, you need to:
            <ol className="mt-2 space-y-1 list-decimal list-inside">
              <li>Create a Google Cloud project and enable Sheets API & Slides API</li>
              <li>Create a Service Account and download the JSON key</li>
              <li>Share your spreadsheet with the service account email</li>
              <li>Add the credentials to your <code className="bg-yellow-100 px-1 rounded">.env</code> file</li>
            </ol>
          </div>

          <div className="space-y-3">
            <Input
              label="Spreadsheet ID"
              defaultValue={process.env.NEXT_PUBLIC_SHEETS_ID ?? ""}
              placeholder="18JRdq-_LvkyVTsjeNTrN2EImFgS6IFdmcHv37Ta9izs"
              readOnly
            />
            <Input
              label="Presentation ID (Slides Template)"
              placeholder="1MI4gpAC2TtFNU8oY3gDa-_RSaKIXIII0"
              readOnly
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <a
              href="https://console.cloud.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Google Cloud Console
            </a>
            <span className="text-gray-300">·</span>
            <a
              href="https://docs.google.com/spreadsheets"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Your Spreadsheet
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Proposal Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            Proposal Defaults
          </CardTitle>
          <CardDescription>Default settings applied to new proposals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Default Validity Period (days)" type="number" defaultValue={30} />
          <Input label="Company Name (shown on proposals)" placeholder="Your Company Name" />
          <Input label="Company Logo URL" placeholder="https://..." />
          <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-600" />
            Notifications
          </CardTitle>
          <CardDescription>Configure when you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "When a proposal is viewed", default: true },
            { label: "When a proposal is agreed", default: true },
            { label: "When a proposal is rejected", default: true },
            { label: "When a share link expires", default: false },
          ].map(item => (
            <label key={item.label} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">{item.label}</span>
              <input
                type="checkbox"
                defaultChecked={item.default}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
