export interface PropertyDetail {
    type: string;
    description: string;
}
  
export interface ToolFunction {
    id?: number;
    name: string;
    description: string;
    properties: Record<string, PropertyDetail>;
    required: string[];
}