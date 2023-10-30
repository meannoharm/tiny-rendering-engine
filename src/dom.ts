export enum NodeType {
  ELEMENT = 1,
  TEXT = 3
}

export interface Element {
  tagName: string,
  attributes: Record<string, string>,
  children: Node[],
  NodeType: NodeType.ELEMENT
}

export interface Text {
  nodeValue: string,
  NodeType: NodeType.TEXT
}

export type Node = Element | Text;

export function element(tagName: string): Element {
  return {
    tagName,
    attributes: {},
    children: [],
    NodeType: NodeType.ELEMENT
  }
}

export function text(nodeValue: string): Text {
  return {
    nodeValue,
    NodeType: NodeType.TEXT
  }
}
