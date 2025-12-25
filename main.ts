import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Crear el servidor MCP
const server = new Server(
  {
    name: "mcp-servidor-basico",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Listar las tools disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "saludar",
        description: "Devuelve un saludo personalizado",
        inputSchema: {
          type: "object",
          properties: {
            nombre: {
              type: "string",
              description: "Nombre de la persona",
            },
          },
          required: ["nombre"],
        },
      },
    ],
  };
});

// Ejecutar una tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "saludar") {
    const { nombre } = request.params.arguments as { nombre: string };

    return {
      content: [
        {
          type: "text",
          text: `¡Hola, ${nombre}! 👋 Bienvenido a tu servidor MCP.`,
        },
      ],
    };
  }

  throw new Error("Tool no encontrada");
});

// Conectar el servidor por stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Servidor MCP en ejecución...");
}

main().catch((err) => {
  console.error("Error al iniciar el servidor MCP:", err);
});
