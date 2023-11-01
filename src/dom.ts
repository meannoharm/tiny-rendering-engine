export enum NodeType {
  ELEMENT = 1,
  TEXT = 3,
}

export interface Element {
  tagName: string;
  attributes: Record<string, string>;
  children: Node[];
  nodeType: NodeType.ELEMENT;
}

export interface Text {
  nodeValue: string;
  nodeType: NodeType.TEXT;
}

export type Node = Element | Text;

export function element(tagName: string): Element {
  return {
    tagName,
    attributes: {},
    children: [],
    nodeType: NodeType.ELEMENT,
  };
}

export function text(nodeValue: string): Text {
  return {
    nodeValue,
    nodeType: NodeType.TEXT,
  };
}
