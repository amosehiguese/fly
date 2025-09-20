import { graphGenerationTool } from "./graphGenerationTool";
import { orderProcessingTool } from "./orderProcessingTool";
import { visualGenerationTool } from "./visualGenerationTool";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ToolConfig<T = any> {
  definition: {
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: {
        type: "object";
        properties: Record<string, unknown>;
        required: string[];
      };
    };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (args: T) => Promise<any>;
}

export const tools: Record<string, ToolConfig> = {
  generate_image: visualGenerationTool,
  generate_graph: graphGenerationTool,
  process_orders: orderProcessingTool,
};
