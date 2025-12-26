import { WholesaleConfig } from '../../types.ts';

export const printfulService = {
  createSync: async (config: WholesaleConfig) => {
    if (!config.isActive) return null;
    console.log("[Printful] Connecting POD catalogs...");
    return { status: 'connected', variants: 1200 };
  },
  submitOrder: async (config: WholesaleConfig, orderId: string) => {
    console.log(`[Printful] Pushing order ${orderId} to production...`);
    return { status: 'in_production' };
  }
};