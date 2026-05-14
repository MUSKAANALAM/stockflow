"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [threshold, setThreshold] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // GET settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      const data = await res.json();

      setThreshold(data.defaultLowStockThreshold);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // UPDATE settings
  const updateSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          defaultLowStockThreshold: threshold,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Update failed");
      }

      const data = await res.json();
      setThreshold(data.defaultLowStockThreshold);
      setMessage("Settings updated successfully");
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500">Loading settings...</div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      {/* Card */}
      <div className="border rounded-xl p-6 shadow-sm bg-white space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Low Stock Threshold
          </label>

          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Actions */}
        <button
          onClick={updateSettings}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {/* Message */}
        {message && (
          <p className="text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}