import Fastify from "fastify";
import paymentRoute from "./routes/payment"
import cors from "@fastify/cors";
import "dotenv/config";
import formbody from "@fastify/formbody";

const app = Fastify();


(async()=>await app.register(formbody))();

const port = Number(process.env.PORT) || 4000;



app.get("/", async () => {
  return { status: "API running " };
});
app.register(paymentRoute, { prefix: "/tx" });

const start = async () => {
  try {
    await app.listen({ port, host: "0.0.0.0" });
    console.log("Server running at http://localhost:4000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
