import * as dotenv from "dotenv";
import type { FlareSolverrRequest, FlareSolverrResponse } from "./types";

dotenv.config();

export interface FetchOptions {
  forceFlareSolverr?: boolean;
  timeout?: number;
}

export class FlareSolverrClient {
  private endpoint: string;
  private enabled: boolean;
  private defaultTimeout: number;
  private userAgent: string;

  constructor() {
    this.endpoint = process.env.FLARESOLVERR_URL || "https://flaresolverr.basic.int.eu.org/v1";
    this.enabled = process.env.USE_FLARESOLVERR !== "false";
    this.defaultTimeout = Number.parseInt(process.env.REQUEST_TIMEOUT || "60000", 10);
    this.userAgent =
      process.env.WIKI_USER_AGENT ||
      "UniversityGuideBot/1.0 (academic-research; contact: dev@example.com)";
  }

  public getEndpoint(): string {
    return this.endpoint;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public async checkHealth(): Promise<{
    available: boolean;
    version?: string;
    message?: string;
    userAgent?: string;
  }> {
    try {
      const rootUrl = `${this.endpoint.replace(/\/v1\/?$/, "")}/`;
      const res = await fetch(rootUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": this.userAgent,
        },
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const data = (await res.json()) as { msg?: string; version?: string; userAgent?: string };
        return {
          available: true,
          version: data.version,
          message: data.msg || "FlareSolverr is ready!",
          userAgent: data.userAgent,
        };
      }
      return { available: false, message: `HTTP status ${res.status}` };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { available: false, message };
    }
  }

  public async fetchWithFlareSolverr(url: string, timeoutMs?: number): Promise<string> {
    const payload: FlareSolverrRequest = {
      cmd: "request.get",
      url,
      maxTimeout: timeoutMs || this.defaultTimeout,
    };

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`FlareSolverr proxy HTTP error: ${res.status}`);
    }

    const data = (await res.json()) as FlareSolverrResponse;
    if (data.status !== "ok" || !data.solution?.response) {
      throw new Error(`FlareSolverr failed: ${data.message || "Unknown error"}`);
    }

    return data.solution.response;
  }

  public async get(url: string, options?: FetchOptions): Promise<string> {
    if (options?.forceFlareSolverr && this.enabled) {
      return this.fetchWithFlareSolverr(url, options.timeout);
    }

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": this.userAgent,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      // Detect Cloudflare challenge or bot blocking
      const isCloudflareBlocked =
        response.status === 403 ||
        response.status === 503 ||
        response.headers.get("cf-mitigated") === "challenge" ||
        response.headers.get("server")?.toLowerCase().includes("cloudflare");

      if (isCloudflareBlocked && this.enabled) {
        console.info(
          `[Cloudflare detected on ${url}] Routing request through FlareSolverr proxy...`,
        );
        return this.fetchWithFlareSolverr(url, options?.timeout);
      }

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      return response.text();
    } catch (err) {
      if (this.enabled) {
        console.info(`[Direct fetch failed for ${url}] Retrying through FlareSolverr...`);
        return this.fetchWithFlareSolverr(url, options?.timeout);
      }
      throw err;
    }
  }
}
