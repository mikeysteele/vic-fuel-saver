import { env } from "../env.ts";

import { env as cfEnv } from "cloudflare:workers";

const cloudflareEnv = cfEnv as Record<string, unknown>;
const consumerId = cloudflareEnv?.VIC_FUEL_CONSUMER_ID as string ?? env.VIC_FUEL_CONSUMER_ID ??
  "dummy-consumer-id-for-development";

import type { FuelApiResponse, FuelBrandsResponse } from "../features/fuel/types.ts";

const PRICES_ENDPOINT =
  "https://api.fuel.service.vic.gov.au/open-data/v1/fuel/prices";
const BRANDS_ENDPOINT =
  "https://api.fuel.service.vic.gov.au/open-data/v1/fuel/reference-data/brands";

type RequestHeaders = {
  readonly "User-Agent": "FuelSaver/1.0";
  readonly "x-consumer-id": string;
  readonly "x-transactionid": string;
};

/**
 * Encapsulates all HTTP communication with the VIC Fair Fuel Open Data API.
 * Handles auth headers, transaction IDs, and HTTP error surfacing.
 * Stateless — no caching or fallback logic here.
 */
export class VicFuelApiClient {
  private readonly consumerId: string;

  constructor(consumerId: string) {
    this.consumerId = consumerId;
  }

  private makeHeaders(): RequestHeaders {
    const transactionId = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15);

    return {
      "User-Agent": "FuelSaver/1.0",
      "x-consumer-id": this.consumerId,
      "x-transactionid": transactionId,
    };
  }

  /**
   * Fetches a JSON response from the VIC Fair Fuel Open Data API.
   * @param url The URL to fetch the JSON from.
   * @returns The JSON response as a Promise.
   */
  private async fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, { headers: this.makeHeaders() });

    if (!response.ok) {
      throw new Error(
        `API returned ${response.status}: ${response.statusText}`,
      );
    }
    try {
      return response.json() as Promise<T>;
    } catch (e) {
      throw new Error(`Failed to parse JSON response: ${e}`);
    }
  }

  /**
   * Fetches all fuel prices from the VIC Fair Fuel Open Data API.
   * @returns {Promise<FuelApiResponse>} A Promise that resolves to a FuelApiResponse.
   */
  async fetchPrices(): Promise<FuelApiResponse> {
    return await this.fetchJson<FuelApiResponse>(PRICES_ENDPOINT);
  }
  /**
   * Fetches all fuel brands from the VIC Fair Fuel Open Data API.
   * @returns {Promise<FuelBrandsResponse>} A Promise that resolves to a FuelBrandsResponse.
   */
  async fetchBrands(): Promise<FuelBrandsResponse> {
    return await this.fetchJson<FuelBrandsResponse>(BRANDS_ENDPOINT);
  }
}


/** Shared singleton client — instantiated once at module load. */
export const vicFuelApiClient = new VicFuelApiClient(consumerId);
