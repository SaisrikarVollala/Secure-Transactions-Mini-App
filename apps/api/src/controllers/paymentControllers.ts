import { FastifyReply, FastifyRequest } from "fastify";
import { paymentPayload } from "../routes/payment";
import {
  envelopeEncrypt,
  envelopeDecrypt,
  generateId,
  TxSecureRecord,
} from "@repo/crypto"

const storage = new Map<string, TxSecureRecord>();

export async function encryptHandler(
  request: FastifyRequest<{ Body: paymentPayload }>,
  reply: FastifyReply
) {
  try {
    const { partyId, payload } = request.body;

    if (!partyId || typeof partyId !== "string") {
      return reply.status(400).send({ error: "partyId is required and must be a string" });
    }

    if (!payload || typeof payload !== "object") {
      return reply.status(400).send({ error: "payload is required and must be an object" });
    }

    if (typeof payload.amount !== "number" || payload.amount <= 0) {
      return reply.status(400).send({ error: "payload.amount must be a positive number" });
    }

    if (typeof payload.currency !== "string" || payload.currency.length !== 3) {
      return reply.status(400).send({ error: "payload.currency must be a 3-letter currency code" });
    }

    const encrypted = envelopeEncrypt(payload);
   
    const id = generateId();
    const record: TxSecureRecord = {
      id,
      partyId,
      createdAt: new Date().toISOString(),
      ...encrypted,
    };

    storage.set(id, record);

    return reply.status(201).send({
      id: record.id,
      partyId: record.partyId,
      createdAt: record.createdAt,
      alg: record.alg,
      mk_version: record.mk_version,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      error: "Encryption failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function infoHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;

    const record = storage.get(id);

    if (!record) {
      return reply.status(404).send({ error: "Record not found" });
    }

    return reply.status(200).send(record);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      error: "Failed to retrieve record",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function decryptHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;

    const record = storage.get(id);

    if (!record) {
      return reply.status(404).send({ error: "Record not found" });
    }

    const decrypted = envelopeDecrypt(record);

    return reply.status(200).send({
      id: record.id,
      partyId: record.partyId,
      createdAt: record.createdAt,
      payload: decrypted,
    });
  } catch (error) {
    request.log.error(error);

    if (error instanceof Error) {
      if (
        error.message.includes("Nonce must be") ||
        error.message.includes("Tag must be") ||
        error.message.includes("Invalid hex") ||
        error.message.includes("tampered")
      ) {
        return reply.status(400).send({
          error: "Decryption failed: Invalid or tampered data",
          message: error.message,
        });
      }
    }

    return reply.status(500).send({
      error: "Decryption failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}