import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Crear servidor MCP
const server = new Server(
  {
    name: "mcp-pokeapi-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Registrar tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_pokemon",
        description: "Obtiene información de un Pokémon desde PokeAPI",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Nombre o ID del Pokémon (ej: pikachu, 25)",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
});

// Ejecutar tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_pokemon") {
    const { name } = request.params.arguments as { name: string };

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
      );

      if (!response.ok) {
        throw new Error("Pokémon no encontrado");
      }

      const data = await response.json();

      const pokemonInfo = {
        id: data.id,
        nombre: data.name,
        altura: data.height,
        peso: data.weight,
        tipos: data.types.map((t: any) => t.type.name),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(pokemonInfo, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error: ${error.message}`,
          },
        ],
      };
    }
  }

  throw new Error("Tool no soportada");
});

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🟢 Servidor MCP conectado a PokeAPI");
}

main().catch(console.error);
