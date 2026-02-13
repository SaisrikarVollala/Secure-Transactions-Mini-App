"use client";

import { useState } from "react";


export default function TxPage() {
  const [partyId, setPartyId] = useState("");
  const [payload, setPayload] = useState(`{\n  "amount": 100,\n  "currency": "AED"\n}`);
  const [result, setResult] = useState("");
  const [recordId, setRecordId] = useState("");

  async function encryptAndSave() {
    try {
      const res = await fetch("/tx/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partyId,
          payload: JSON.parse(payload),
        }),
      });

      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));

      if (data.id) setRecordId(data.id);
    } catch (error) {
      setResult("Invalid JSON payload or request failed");
    }
  }

  async function fetchRecord() {
    if (!recordId) return setResult("No record id available");

    const res = await fetch(`/tx/${recordId}`);
    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  }

  async function decryptRecord() {
    if (!recordId) return setResult("No record id available");

    const res = await fetch(`/tx/${recordId}/decrypt`, {
      method: "POST",
    });
    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-6"
      >
        <h1 className="text-2xl font-semibold">Transaction Encryption</h1>

        <div className="space-y-2">
          <label className="text-sm font-medium">Party ID</label>
          <input
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            placeholder="party_123"
            className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">JSON Payload</label>
          <textarea
            rows={6}
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="w-full border rounded-xl px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={encryptAndSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Encrypt & Save
          </button>

          <button
            onClick={fetchRecord}
            className="bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition"
          >
            Fetch
          </button>

          <button
            onClick={decryptRecord}
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
          >
            Decrypt
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Result</label>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm overflow-auto">
            {result}
          </pre>
        </div>
      </div>
    </div>
  );
}
