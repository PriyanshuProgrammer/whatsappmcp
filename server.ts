import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "Demo",
  version: "1.0.0"
});

server.tool(
  "qr_scan",
  "This returns the paring code for WhatsApp Web authentication. Ask user for this phone number before using this tool.",
  { phone: z.string() },
  async ({ phone }) => {
    const response = await fetch(`http://localhost:3000/auth/${phone}`);
    const data: any = await response.json();
    return {
      content: [{ type: "text", text: data.pairingCode }],
    };
  }
)

server.tool(
  "get_groups",
  "This returns the list of groups in your WhatsApp account.",
  async () => {
    const response = await fetch("http://localhost:3000/groups");
    const data: any = await response.json();
    return {
      content: [{ type: "text", text: JSON.stringify(data.groups) }]
    };
  }
);

server.tool(
  "get_contact_details",
  "This returns the details of the contact by taking name as input, in your WhatsApp account.",
  { name: z.string() },
  async ({ name }) => {
    const response = await fetch(`http://localhost:3000/contact/${name}`);
    const data: any = await response.json();
    return {
      content: [{ type: "text", text: JSON.stringify(data.contact) }]
    };
  }
);

server.tool(
  "send_message",
  "This sends a message to a contact or group. You will get the id using the get_groups tool, example:-{data.groups[index].id}",
  { id: z.string(), message: z.string() },
  async ({ id, message }) => {
    const response = await fetch(`http://localhost:3000/send/${id}/${message}`);
    const status: any = await response.json();
    return {
      content: [{ type: "text", text: status.status }]
    };
  }
);

server.tool(
  "get_chat",
  "This returns the details of the chat by taking id, unread count as input, in your WhatsApp account.",
  { id: z.string(), limit: z.number() },
  async ({ id, limit }) => {
    const response = await fetch(`http://localhost:3000/send/${id}/${limit}`);
    const data: any = await response.json();
    return {
      content: [{ type: "text", text: data.messages }]
    };
  }
);


// Add a dynamic greeting resource
server.resource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `Hello, ${name}!`
    }]
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
