import { ToolConfig } from "./allTools";

interface GraphGenerationArgs {
  type: "bar" | "line" | "pie" | "scatter"; // Graph type
  labels: string[]; // Labels for the X-axis or categories
  data: number[]; // Data points for the graph
  title?: string; // Optional title for the graph
}

export const graphGenerationTool: ToolConfig<GraphGenerationArgs> = {
  definition: {
    type: "function",
    function: {
      name: "generate_graph",
      description: "Generate statistical graphs based on user-provided data.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description:
              "The type of graph to generate. Options: bar, line, pie, scatter.",
            enum: ["bar", "line", "pie", "scatter"],
          },
          labels: {
            type: "array",
            items: { type: "string" },
            description: "Labels for the graph (e.g., months, categories).",
          },
          data: {
            type: "array",
            items: { type: "number" },
            description: "Data points corresponding to the labels.",
          },
          title: {
            type: "string",
            description: "Optional title for the graph.",
          },
        },
        required: ["type", "labels", "data"],
      },
    },
  },
  handler: async ({
    type,
    labels,
    data,
    title = "Graph",
  }: GraphGenerationArgs) => {
    console.log(`Generating ${type} graph with title: "${title}"`);

    try {
      // Construct the URL for the graph image using QuickChart API
      const chartUrl = `https://quickchart.io/chart?c={
        type: '${type}',
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: [{
            label: '${title}',
            data: ${JSON.stringify(data)},
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            title: { display: true, text: '${title}' }
          }
        }
      }`;

      // The generated chart URL is an image URL.
      const imageUrl = chartUrl.replace("chart?", "chart?format=png&");

      console.log("Graph image URL generated successfully:", imageUrl);

      return imageUrl; // Return the generated image URL
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error generating graph: ${error.message}`);
        throw new Error(`Graph generation failed: ${error.message}`);
      } else {
        console.error("Unknown error during graph generation.");
        throw new Error("Graph generation failed: Unknown error.");
      }
    }
  },
};
