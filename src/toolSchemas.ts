import { z } from "zod";

const messageIdSchema = z.string().min(1);
const phoneNumberSchema = z.string().min(1);
const urlSchema = z.string().url();

// Common component parameter schemas for templates
const currencySchema = z.object({
    fallback_value: z.string(),
    code: z.string(),
    amount_1000: z.number().int(),
});

const dateTimeSchema = z.object({
    fallback_value: z.string(),
});

const parameterSchema = z.object({
    type: z.enum(["text", "currency", "date_time", "image", "document", "video", "payload"]),
    text: z.string().optional(),
    currency: currencySchema.optional(),
    date_time: dateTimeSchema.optional(),
    image: z.object({ link: z.string().url().optional(), id: z.string().optional() }).optional(),
    document: z.object({ link: z.string().url().optional(), id: z.string().optional(), filename: z.string().optional() }).optional(),
    video: z.object({ link: z.string().url().optional(), id: z.string().optional() }).optional(),
    payload: z.string().optional(), // For buttons
});

const componentSchema = z.object({
    type: z.enum(["header", "body", "button"]),
    sub_type: z.enum(["quick_reply", "url"]).optional(),
    index: z.coerce.number().optional(), // Position in list for buttons
    parameters: z.array(parameterSchema),
});

const languageSchema = z.object({
    code: z.string().min(2), // e.g., "en_US"
});

const templateSchema = z.object({
    name: z.string().min(1),
    language: languageSchema,
    components: z.array(componentSchema).optional(),
});

// Main schemas
export const toolSchemas = {
    wa_send_text: z.object({
        to: phoneNumberSchema.describe("Recipient phone number in international format without +"),
        body: z.string().min(1).describe("The text message content"),
        preview_url: z.boolean().optional().default(false).describe("Whether to show a preview for URLs in the message"),
    }),
    wa_send_template: z.object({
        to: phoneNumberSchema.describe("Recipient phone number"),
        template: templateSchema.describe("The template details"),
    }),
    wa_send_image: z.object({
        to: phoneNumberSchema,
        image_url: urlSchema.optional(),
        image_id: z.string().optional(),
        caption: z.string().optional(),
    }).refine(data => data.image_url || data.image_id, {
        message: "Either image_url or image_id must be provided",
    }),
    wa_send_document: z.object({
        to: phoneNumberSchema,
        document_url: urlSchema.optional(),
        document_id: z.string().optional(),
        caption: z.string().optional(),
        filename: z.string().optional(),
    }).refine(data => data.document_url || data.document_id, {
        message: "Either document_url or document_id must be provided",
    }),
    wa_mark_message_as_read: z.object({
        message_id: messageIdSchema,
    }),
    wa_get_business_profile: z.object({
        fields: z.array(z.string()).optional().default(["about", "address", "description", "email", "profile_picture_url", "websites", "vertical"]),
    }),
};

export const toolDescriptions = {
    wa_send_text: "Send a text message to a WhatsApp user.",
    wa_send_template: "Send a template message (required for initiating conversations).",
    wa_send_image: "Send an image to a WhatsApp user via URL or Media ID.",
    wa_send_document: "Send a document to a WhatsApp user via URL or Media ID.",
    wa_mark_message_as_read: "Mark a message as read.",
    wa_get_business_profile: "Retrieve the business profile information.",
};

export type ToolName = keyof typeof toolSchemas;
export type ToolSchemaMap = typeof toolSchemas;

// Export inferred types
export type WaSendTextArgs = z.infer<typeof toolSchemas.wa_send_text>;
export type WaSendTemplateArgs = z.infer<typeof toolSchemas.wa_send_template>;
export type WaSendImageArgs = z.infer<typeof toolSchemas.wa_send_image>;
export type WaSendDocumentArgs = z.infer<typeof toolSchemas.wa_send_document>;
export type WaMarkMessageAsReadArgs = z.infer<typeof toolSchemas.wa_mark_message_as_read>;
export type WaGetBusinessProfileArgs = z.infer<typeof toolSchemas.wa_get_business_profile>;
