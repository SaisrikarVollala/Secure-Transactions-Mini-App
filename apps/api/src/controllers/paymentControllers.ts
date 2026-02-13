import { FastifyReply, FastifyRequest } from "fastify";
import { paymentPayload } from "../routes/payment";
export async function encryptHandler(
  request: FastifyRequest<{ Body: paymentPayload }>,
  reply: FastifyReply
) {
  const { partyId, payload } = request.body;
  const { amount, currency } = payload;

  
}

export async function infoHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  
}

export async function decryptHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  
}
