export interface DomElement {
  id: number;
  tag_name: string;
  finger_print: string;
  attributes: { name: string , value: string}[];
}