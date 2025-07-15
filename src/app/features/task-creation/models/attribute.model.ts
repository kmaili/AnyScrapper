export interface Attribute {
  id?: number;
  name: string;
  value: string; // Add value as per Django model
  dom_element?: number; // Foreign key to DomElement
}