import Fastify from "fastify";

const app = Fastify({
  logger: true
});


app.get("/", async () => {
  return { status: "API running " };
});


const start = async () => {
  try {
    await app.listen({ port: 4000, host: "0.0.0.0" });
    console.log("Server running at http://localhost:4000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
