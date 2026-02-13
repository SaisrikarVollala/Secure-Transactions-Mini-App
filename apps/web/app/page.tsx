"use client";
import { useState } from "react";

export default function TxPage() {
  const [partyId, setPartyId] = useState("");
  const [payload, setPayload] = useState(`{ "amount":100,"currency":"AED" }`);
  const [encryptResult, setEncryptResult] = useState("");

  const [fetchId, setFetchId] = useState("");
  const [fetchResult, setFetchResult] = useState("");

  const [decryptId, setDecryptId] = useState("");
  const [decryptResult, setDecryptResult] = useState("");

  async function encrypt() {
    try {
      const res = await fetch("/tx/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partyId, payload: JSON.parse(payload) }),
      });
      setEncryptResult(JSON.stringify(await res.json(), null, 2));
    } catch {
      setEncryptResult("Invalid JSON or request failed");
    }
  }

  async function fetchRecord() {
    const res = await fetch(`/tx/${fetchId}`);
    setFetchResult(JSON.stringify(await res.json(), null, 2));
  }

  async function decrypt() {
    const res = await fetch(`/tx/${decryptId}/decrypt`, { method: "POST" });
    const text = await res.json()
    console.log(text)
    setDecryptResult(JSON.stringify(await res.json(), null, 2));
  }

  return (
    <div className="container py-5" style={{ maxWidth: 900 }}>

      <h4 className="mb-4 text-body-secondary">Transaction Encryption</h4>

      {/* Encrypt */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">

          <h6 className="mb-3">Encrypt Payload</h6>

          <div className="mb-3">
            <label className="form-label">Party ID</label>
            <input
              className="form-control"
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              placeholder="party_123"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Payload JSON</label>
            <textarea
              className="form-control"
              rows={5}
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={encrypt}>
            Encrypt
          </button>

          <pre className="mt-3 small border rounded p-3 bg-body-secondary">
            {encryptResult || "response"}
          </pre>

        </div>
      </div>

      {/* Fetch */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">

          <h6 className="mb-3">Fetch Encrypted Record</h6>

          <div className="input-group mb-3">
            <input
              className="form-control"
              placeholder="record id"
              value={fetchId}
              onChange={(e) => setFetchId(e.target.value)}
            />
            <button className="btn btn-outline-secondary" onClick={fetchRecord}>
              Fetch
            </button>
          </div>

          <pre className="small border rounded p-3 bg-body-secondary">
            {fetchResult || "response"}
          </pre>

        </div>
      </div>

      {/* Decrypt */}
      <div className="card shadow-sm">
        <div className="card-body">

          <h6 className="mb-3">Decrypt Payload</h6>

          <div className="input-group mb-3">
            <input
              className="form-control"
              placeholder="record id"
              value={decryptId}
              onChange={(e) => setDecryptId(e.target.value)}
            />
            <button className="btn btn-success" onClick={decrypt}>
              Decrypt
            </button>
          </div>

          <pre className="small border rounded p-3 bg-body-secondary">
            {decryptResult || "response"}
          </pre>

        </div>
      </div>

    </div>
  );
}
