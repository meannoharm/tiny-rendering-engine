import { element, text } from './dom';
import type { Element } from './dom';

export default class Parser {
  private html = '';
  private index = 0;
  private len = 0;
  private stack: string[] = [];

  parse(html: string) {
    if (typeof html !== 'string') {
      throw new Error('parameter 0 is not a string');
    }

    this.html = html;
    this.len = html.length;
    this.index = 0;
    this.stack = [];

    const root = element('root');
    while (this.index < this.len) {
      this.removeSpaces();
      if (this.html[this.index].startsWith('<')) {
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
      if (this.html[this.index].startsWith('<')) {
        this.index++;
        this.removeSpaces();
        if (this.html[this.index].startsWith('/')) {
          this.index++;
          const startTag = this.stack.pop();
          const endTag = this.parseTag();
          if (startTag !== endTag) {
            throw new Error(`The end tag ${endTag} does not match the start tag ${startTag}`);
          }

          while (this.index < this.len && this.html[this.index] !== '>') {
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
    while (this.index < this.len && !(this.html[this.index] === '<' && /\w|\//.test(this.html[this.index + 1]))) {
      str += this.html[this.index];
      this.index++;
    }
    this.sliceHtml();
    parent.children.push(text(removeExtraSpaces(str)));
  }

  private parseTag() {
    let tag = '';

    this.removeSpaces();

    while (this.index < this.len && this.html[this.index] !== ' ' && this.html[this.index] !== '>') {
      tag += this.html[this.index];
      this.index++;
    }

    this.sliceHtml();
    return tag;
  }

  private parseAttributes(elementObject: Element) {
    while (this.index < this.len && this.html[this.index] !== '>') {
      this.removeSpaces();
      this.parseAttribute(elementObject);
      this.removeSpaces();
    }
    this.index++;
  }

  private parseAttribute(elementObject: Element) {
    let attribute = '';
    let value = '';
    while (this.index < this.len && this.html[this.index] !== '=' && this.html[this.index] !== '>') {
      attribute += this.html[this.index];
      this.index++;
    }

    this.sliceHtml();
    attribute = attribute.trim();
    if (!attribute) return;

    this.index++;
    let startSymbol = '';
    if (this.html[this.index] === "'" || this.html[this.index] === '"') {
      startSymbol = this.html[this.index];
      this.index++;
    }
    while (this.index < this.len && this.html[this.index] !== startSymbol) {
      value += this.html[this.index];
      this.index++;
    }
    this.index++;
    elementObject.attributes[attribute] = value.trim();
    this.sliceHtml();
  }

  private removeSpaces() {
    while (this.index < this.len && (this.html[this.index] === ' ' || this.html[this.index] === '\n')) {
      this.index++;
    }
    this.sliceHtml();
  }

  private sliceHtml() {
    this.html = this.html.slice(this.index);
    this.len = this.html.length;
    this.index = 0;
  }
}
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
