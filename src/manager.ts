import {
    GraphApiClient,
    GraphApiError,
    graphConfig
} from "@meta-mcp/core";
import {
    type WaSendTextArgs,
    type WaSendTemplateArgs,
    type WaSendImageArgs,
    type WaSendDocumentArgs,
    type WaMarkMessageAsReadArgs,
    type WaGetBusinessProfileArgs
} from "./toolSchemas.js";

export class WhatsAppManager {
    private client: GraphApiClient;
    private phoneNumberId: string;

    constructor() {
        if (!graphConfig.whatsappAccessToken) {
            throw new Error("WHATSAPP_ACCESS_TOKEN is not set");
        }
        if (!graphConfig.whatsappPhoneNumberId) {
            throw new Error("WHATSAPP_PHONE_NUMBER_ID is not set");
        }

        this.phoneNumberId = graphConfig.whatsappPhoneNumberId;

        // Initialize client with WhatsApp specific config
        this.client = new GraphApiClient({
            ...graphConfig,
            accessToken: graphConfig.whatsappAccessToken,
            baseUrl: graphConfig.baseUrl // Reuse base URL logic
        });
    }

    private get messagesEndpoint() {
        return `${this.phoneNumberId}/messages`;
    }

    async sendText(args: WaSendTextArgs) {
        return this.client.request({
            method: "POST",
            endpoint: this.messagesEndpoint,
            body: {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: args.to,
                type: "text",
                text: {
                    body: args.body,
                    preview_url: args.preview_url
                }
            }
        });
    }

    async sendTemplate(args: WaSendTemplateArgs) {
        return this.client.request({
            method: "POST",
            endpoint: this.messagesEndpoint,
            body: {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: args.to,
                type: "template",
                template: args.template
            }
        });
    }

    async sendImage(args: WaSendImageArgs) {
        const imageBody: Record<string, unknown> = {};
        if (args.image_id) imageBody.id = args.image_id;
        if (args.image_url) imageBody.link = args.image_url;
        if (args.caption) imageBody.caption = args.caption;

        return this.client.request({
            method: "POST",
            endpoint: this.messagesEndpoint,
            body: {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: args.to,
                type: "image",
                image: imageBody
            }
        });
    }

    async sendDocument(args: WaSendDocumentArgs) {
        const docBody: Record<string, unknown> = {};
        if (args.document_id) docBody.id = args.document_id;
        if (args.document_url) docBody.link = args.document_url;
        if (args.caption) docBody.caption = args.caption;
        if (args.filename) docBody.filename = args.filename;

        return this.client.request({
            method: "POST",
            endpoint: this.messagesEndpoint,
            body: {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: args.to,
                type: "document",
                document: docBody
            }
        });
    }

    async markMessageAsRead(args: WaMarkMessageAsReadArgs) {
        return this.client.request({
            method: "POST",
            endpoint: this.messagesEndpoint,
            body: {
                messaging_product: "whatsapp",
                status: "read",
                message_id: args.message_id
            }
        });
    }

    async getBusinessProfile(args: WaGetBusinessProfileArgs) {
        if (!graphConfig.whatsappBusinessAccountId) {
            // Fallback or error if account ID is needed for certain calls, 
            // but `whatsapp_business_profile` is usually accessed via phone number 
            // node or business node.
            // Docs say: GET /<PHONE_NUMBER_ID>/whatsapp_business_profile
        }

        return this.client.request({
            method: "GET",
            endpoint: `${this.phoneNumberId}/whatsapp_business_profile`,
            params: {
                fields: args.fields ? args.fields.join(",") : undefined
            }
        });
    }
}
