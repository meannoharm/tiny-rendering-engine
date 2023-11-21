import Parser from './Parser';

enum NodeType {
  Element = 1,
  Text = 3,
}

interface Element {
  tagName: string;
  attributes: Record<string, string>;
  children: Node[];
  nodeType: NodeType.Element;
}

interface Text {
  nodeValue: string;
  nodeType: NodeType.Text;
}

type Node = Element | Text;

export function element(tagName: string): Element {
  return {
    tagName,
    attributes: {},
    children: [],
    nodeType: NodeType.Element,
  };
}

export function text(nodeValue: string): Text {
  return {
    nodeValue,
    nodeType: NodeType.Text,
  };
}

export default class HtmlParser extends Parser {
  private stack: string[] = [];

  parse(rawText: string) {
    if (typeof rawText !== 'string') {
      throw new Error('parameter 0 is not a string');
    }

    this.rawText = rawText;
    this.len = this.rawText.length;
    this.index = 0;
    this.stack = [];

    const root = element('root');
    while (this.index < this.len) {
      this.removeSpaces();
      console.log(this.index, this.rawText, this.rawText[this.index]);
      if (this.rawText[this.index].startsWith('<')) {
        this.index++;
        this.parseElement(root);
      } else {
        this.parseText(root);
      }
    }

    if (root.children.length === 1) return root.children[0];
    return root.children;
  }

  parseElement(parent: Element) {
    const tag = this.parseTag();
    const elementObject = element(tag);

    this.stack.push(tag);

    parent.children.push(elementObject);
    this.parseAttributes(elementObject);

    while (this.index < this.len) {
      this.removeSpaces();
      if (this.rawText[this.index].startsWith('<')) {
        this.index++;
        this.removeSpaces();
        if (this.rawText[this.index].startsWith('/')) {
          this.index++;
          const startTag = this.stack.pop();
          const endTag = this.parseTag();
          if (startTag !== endTag) {
            throw new Error(`The end tag ${endTag} does not match the start tag ${startTag}`);
          }

          while (this.index < this.len && this.rawText[this.index] !== '>') {
            this.index++;
          }
          break;
        } else {
          this.parseElement(elementObject);
        }
      } else {
        this.parseText(elementObject);
      }
    }
    this.index++;
  }

  parseText(parent: Element) {
    let str = '';
    while (this.index < this.len && !(this.rawText[this.index] === '<' && /\w|\//.test(this.rawText[this.index + 1]))) {
      str += this.rawText[this.index];
      this.index++;
    }
    this.sliceText();
    parent.children.push(text(removeExtraSpaces(str)));
  }

  private parseTag() {
    let tag = '';

    this.removeSpaces();

    while (this.index < this.len && this.rawText[this.index] !== ' ' && this.rawText[this.index] !== '>') {
      tag += this.rawText[this.index];
      this.index++;
    }

    this.sliceText();
    return tag;
  }

  private parseAttributes(elementObject: Element) {
    while (this.index < this.len && this.rawText[this.index] !== '>') {
      this.removeSpaces();
      this.parseAttribute(elementObject);
      this.removeSpaces();
    }
    this.index++;
  }

  private parseAttribute(elementObject: Element) {
    let attribute = '';
    let value = '';
    while (this.index < this.len && this.rawText[this.index] !== '=' && this.rawText[this.index] !== '>') {
      attribute += this.rawText[this.index];
      this.index++;
    }

    this.sliceText();
    attribute = attribute.trim();
    if (!attribute) return;

    this.index++;
    let startSymbol = '';
    if (this.rawText[this.index] === "'" || this.rawText[this.index] === '"') {
      startSymbol = this.rawText[this.index];
      this.index++;
    }
    while (this.index < this.len && this.rawText[this.index] !== startSymbol) {
      value += this.rawText[this.index];
      this.index++;
    }
    this.index++;
    elementObject.attributes[attribute] = value.trim();
    this.sliceText();
  }
}

// a  b  c => a b c 删除字符之间多余的空格，只保留一个
function removeExtraSpaces(str: string): string {
  let index = 0;
  let len = str.length;
  let hasSpace = false;
  let result = '';
  while (index < len) {
    if (str[index] === ' ' || str[index] === '\n') {
      if (!hasSpace) {
        hasSpace = true;
        result += ' ';
      }
    } else {
      result += str[index];
      hasSpace = false;
    }

    index++;
  }

  return result;
}
