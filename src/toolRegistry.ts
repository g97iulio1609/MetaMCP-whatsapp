import { zodToJsonSchema } from "zod-to-json-schema";
import type { z } from "zod";
import type { WhatsAppManager } from "./manager.js";
import { toolDescriptions, toolSchemas, type ToolName } from "./toolSchemas.js";

export interface ToolDefinition {
    name: ToolName;
    description: string;
    inputSchema: Record<string, unknown>;
}

export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown> | unknown;

export interface ToolRegistry {
    definitions: ToolDefinition[];
    handlers: Record<ToolName, ToolHandler>;
}

export const createToolRegistry = (manager: WhatsAppManager): ToolRegistry => {
    const handlers: Record<ToolName, ToolHandler> = {
        wa_send_text: async (args) =>
            manager.sendText(castArgs(toolSchemas.wa_send_text, args)),
        wa_send_template: async (args) =>
            manager.sendTemplate(castArgs(toolSchemas.wa_send_template, args)),
        wa_send_image: async (args) =>
            manager.sendImage(castArgs(toolSchemas.wa_send_image, args)),
        wa_send_document: async (args) =>
            manager.sendDocument(castArgs(toolSchemas.wa_send_document, args)),
        wa_mark_message_as_read: async (args) =>
            manager.markMessageAsRead(castArgs(toolSchemas.wa_mark_message_as_read, args)),
        wa_get_business_profile: async (args) =>
            manager.getBusinessProfile(castArgs(toolSchemas.wa_get_business_profile, args)),
    };

    const definitions = (Object.keys(toolSchemas) as ToolName[]).map((name) => ({
        name,
        description: toolDescriptions[name],
        inputSchema: zodToJsonSchema(
            toolSchemas[name] as unknown as Parameters<typeof zodToJsonSchema>[0],
            {
                name,
                $refStrategy: "none",
            },
        ) as Record<string, unknown>,
    }));

    return { definitions, handlers };
};

const castArgs = <TSchema extends z.ZodTypeAny>(schema: TSchema, args: Record<string, unknown>) =>
    schema.parse(args);
