import { createToolRegistry } from "./toolRegistry.js";
import { WhatsAppManager } from "./manager.js";
import { toolSchemas, toolDescriptions } from "./toolSchemas.js";

export * from "./toolSchemas.js";
export * from "./manager.js";
export * from "./toolRegistry.js";

// Export a default function to create the registry easily
export const createWhatsAppTools = () => {
    const manager = new WhatsAppManager();
    return createToolRegistry(manager);
};
