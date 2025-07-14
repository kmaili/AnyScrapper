export interface DomElement {
  id: number;
  tag_name: string;
  x_path: string;
  attributes: { name: string , value: string}[];
}