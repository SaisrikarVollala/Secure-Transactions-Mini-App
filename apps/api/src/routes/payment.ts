import { FastifyInstance } from "fastify";
import {encryptHandler,infoHandler,decryptHandler} from "../controllers/paymentControllers"

export type paymentPayload = {
  partyId: string
  payload:{amount: number,currency:string}
}

export default async function paymentRoute(app: FastifyInstance) {
  app.post<{ Body: paymentPayload }>("/encrypt", {
    schema: {
      body: {
        type: "object",
        required: ["partyId", "payload"],
        properties: {
          partyId: { type: "string" },
          payload: {
            type: "object",
            required: ["amount", "currency"],
            properties: { amount: { type: "number" }, currency: { type: "string" } }
          }
        }
      }
    }
  }, encryptHandler);
  
  app.get<{ Params: { id: string } }>("/:id", {
    schema: {
      params: {
        type: "object",
        required: ["id"],
        properties: { id: { type: "string" } }
      }
    }
  }, infoHandler);
  
  app.post<{Params:{id:string} }>("/:id/decrypt", {
    schema: {
      params: {
        type: "object",
        required: ["id"],
        properties: { id: { type: "string" } }
      }
    }
  }, decryptHandler);
}

