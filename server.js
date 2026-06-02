import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[backend] Express API → http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`  GET  /api/products       — list all products`);
  // eslint-disable-next-line no-console
  console.log(`  POST /api/orders         — create order`);
  // eslint-disable-next-line no-console
  console.log(`  GET  /api/orders         — list orders (admin)`);
});

