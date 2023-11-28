import Parser from './Parser';

interface Rule {
  selectors: Selector[];
  declarations: Declaration[];
}

interface Selector {
  tagName: string;
  id: string;
  class: string;
}

interface Declaration {
  name: string;
  value: string | number;
}

export default class CSSParser extends Parser {
  private identifierRE = /\w|-|_/;

  parse(rawText: string) {
    if (typeof rawText !== 'string') {
      throw Error('param');
    }
    this.rawText = rawText.trim();
    this.len = this.rawText.length;
    this.index = 0;
    return this.parseRules();
  }

  private parseRules() {
    const rules: Rule[] = [];
    while (this.index < this.len) {
      rules.push(this.parseRule());
    }
    return rules;
  }

  private parseRule() {
    const rule: Rule = {
      selectors: [],
      declarations: [],
    };

    rule.selectors = this.parseSelectors();
    rule.declarations = this.parseDeclarations();

    return rule;
  }

  private parseSelectors() {
    const selectors: Selector[] = [];
    const symbols = ['*', '.', '#'];
    while (this.index < this.len) {
      this.removeSpaces();
      const char = this.rawText[this.index];
      if (this.identifierRE.test(char) || symbols.includes(char)) {
        selectors.push(this.parseSelector());
      } else if (char === ',') {
        this.removeSpaces();
        selectors.push(this.parseSelector());
      } else if (char === '{') {
        this.index++;
        break;
      }
      this.index++;
    }
    return selectors;
  }

  private parseSelector() {
    const selector: Selector = {
      tagName: '',
      id: '',
      class: '',
    };

    switch (this.rawText[this.index]) {
      case '*':
        selector.tagName = '*';
        this.index++;
        break;
      case '.':
        this.index++;
        selector.class = this.parseIdentifier();
        break;
      case '#':
        this.index++;
        selector.id = this.parseIdentifier();
        break;
      default:
        selector.tagName = this.parseIdentifier();
    }
    return selector;
  }

  private parseDeclarations() {
    const declarations: Declaration[] = [];
    while (this.index < this.len) {
      declarations.push(this.parseDeclaration());
    }
    return declarations;
  }

  private parseDeclaration() {
    const declaration: Declaration = {
      name: '',
      value: '',
    };
    this.removeSpaces();
    declaration.name = this.parseIdentifier();
    this.removeSpaces();

    while (this.index < this.len && this.rawText[this.index] !== ':') {
      this.index++;
    }

    this.index++;
    this.removeSpaces();
    declaration.value = this.parseValue();
    this.removeSpaces();

    return declaration;
  }

  private parseIdentifier() {
    let identifier = '';
    while (this.index < this.len && this.identifierRE.test(this.rawText[this.index])) {
      identifier += this.rawText[this.index];
      this.index++;
    }
    this.sliceText();
    return identifier;
  }

  private parseValue() {
    let value = '';
    while (this.index < this.len && this.rawText[this.index] !== ';') {
      value += this.rawText[this.index];
      this.index++;
    }
    this.index++;
    this.sliceText();
    return value.trim();
  }
}
