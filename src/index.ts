import { z } from "zod";
import { buildRegistry, MetaGraphClient, postContentSchema, type ToolRegistry } from "@giulio-leone/meta-mcp-core";

const publishSchema = postContentSchema.extend({
  recipientId: z.string().min(1),
});

const scheduleSchema = publishSchema.extend({
  scheduledAtIso: z.string().datetime(),
});

const envSchema = z.object({
  accessToken: z.string().min(1),
  phoneNumberId: z.string().min(1),
  apiVersion: z.string().min(1).default("v22.0"),
});

type PublishPayload = z.infer<typeof publishSchema>;
type SchedulePayload = z.infer<typeof scheduleSchema>;

export class WhatsAppManager {
  private readonly graph: MetaGraphClient;
  private readonly phoneNumberId: string;

  constructor(params: { accessToken: string; phoneNumberId: string; apiVersion?: string }) {
    const parsed = envSchema.parse(params);
    this.graph = new MetaGraphClient({
      accessToken: parsed.accessToken,
      apiVersion: parsed.apiVersion,
    });
    this.phoneNumberId = parsed.phoneNumberId;
  }

  static fromEnv() {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN ?? process.env.META_PAGE_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      throw new Error("WHATSAPP_ACCESS_TOKEN (or META_PAGE_ACCESS_TOKEN) and WHATSAPP_PHONE_NUMBER_ID are required.");
    }

    return new WhatsAppManager({
      accessToken,
      phoneNumberId,
      apiVersion: process.env.META_GRAPH_API_VERSION,
    });
  }

  async publish(payload: PublishPayload) {
    const graphResponse = await this.graph.post(`/${this.phoneNumberId}/messages`, {
      messaging_product: "whatsapp",
      to: payload.recipientId,
      type: "text",
      text: JSON.stringify({ body: payload.content }),
    });

    return { channel: "whatsapp", status: "published", graphResponse };
  }

  async schedule(payload: SchedulePayload) {
    return {
      channel: "whatsapp",
      status: "scheduled",
      note: "Use dashboard scheduler-worker for WhatsApp scheduling.",
      scheduledAtIso: payload.scheduledAtIso,
      payload,
    };
  }
}

export function createToolRegistry(manager: WhatsAppManager): ToolRegistry {
  return buildRegistry(
    [
      {
        name: "whatsapp_publish",
        description: "Send WhatsApp Cloud API text message",
        inputSchema: publishSchema.shape,
      },
      {
        name: "whatsapp_schedule",
        description: "Schedule WhatsApp messages through scheduler workflow",
        inputSchema: scheduleSchema.shape,
      },
    ],
    {
      whatsapp_publish: async (args: Record<string, unknown>) => manager.publish(publishSchema.parse(args)),
      whatsapp_schedule: async (args: Record<string, unknown>) => manager.schedule(scheduleSchema.parse(args)),
    },
  );
}
