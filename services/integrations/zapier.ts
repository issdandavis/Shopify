import { IntegrationConfig } from '../../types.ts';

/**
 * Zapier Automation Bridge
 * Connects Shopify events to 3000+ apps
 */
export const zapierService = {
  triggerWebhook: async (config: IntegrationConfig, eventType: string, payload: any) => {
    if (!config.isActive || !config.endpoint) return;
    
    console.log(`[Zapier] Triggering ${eventType} hook...`);
    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'ShopGuide AI',
          timestamp: Date.now(),
          event: eventType,
          data: payload
        })
      });
      return response.ok;
    } catch (e) {
      console.error("[Zapier] Webhook error", e);
      return false;
    }
  },

  testConnection: async (config: IntegrationConfig): Promise<boolean> => {
    if (!config.endpoint) return false;
    // Zapier webhooks don't usually have a 'ping', so we simulate verification
    return config.endpoint.includes('zapier.com/hooks/catch');
  }
};