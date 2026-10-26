import { FlareSolverrClient } from "./flaresolverr-client";

async function run() {
  console.info("Testing FlareSolverr connection...");
  const client = new FlareSolverrClient();
  console.info(`Target Endpoint: ${client.getEndpoint()}`);

  const health = await client.checkHealth();
  if (!health.available) {
    console.error(`FlareSolverr is unreachable: ${health.message}`);
    process.exit(1);
  }

  console.info(`FlareSolverr Version: ${health.version || "unknown"}`);
  console.info(`FlareSolverr Status: ${health.message}`);
  console.info(`FlareSolverr UserAgent: ${health.userAgent || "default"}`);

  console.info("\nTesting Cloudflare-bypass request via FlareSolverr...");
  const targetTestUrl =
    "https://en.wikipedia.org/wiki/List_of_United_States_technological_universities";

  try {
    const html = await client.fetchWithFlareSolverr(targetTestUrl, 30000);
    console.info(`Successfully retrieved HTML! Length: ${html.length} characters`);
    console.info("FlareSolverr integration is operational.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Request failed: ${message}`);
  }
}

run();
