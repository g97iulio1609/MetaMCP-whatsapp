# MetaMCP WhatsApp

A Model Context Protocol (MCP) server for the WhatsApp Business Cloud API.

## Installation

```bash
npm install @meta-mcp/whatsapp
# or
pnpm add @meta-mcp/whatsapp
```

## Configuration

This package requires the following environment variables:

- `WA_ACCESS_TOKEN`: System User Access Token or Permanent Access Token.
- `WA_PHONE_NUMBER_ID`: The ID of the sending phone number.
- `WA_BUSINESS_ACCOUNT_ID`: The WhatsApp Business Account ID.
- `WA_API_VERSION`: (Optional) API version, defaults to `v21.0`.

## Usage

```typescript
import { WhatsAppManager, createToolRegistry } from "@meta-mcp/whatsapp";

const manager = WhatsAppManager.fromEnv();
const registry = createToolRegistry(manager);
```

## Available Tools

### Messaging
- **wa_send_text**: Send a free-form text message (only within 24h window or to opted-in users).
- **wa_send_template**: Send a pre-approved template message (Required to initiate conversations).
- **wa_send_image**: Send an image via URL or ID.
- **wa_send_document**: Send a PDF or document via URL or ID.
- **wa_mark_message_as_read**: ACK a message as read.

### Business Info
- **wa_get_business_profile**: Retrieve profile fields like `about`, `address`, `email`, etc.

## Notes
- **Templates**: To start a conversation with a user who hasn't messaged you recently, you **must** use `wa_send_template`.
