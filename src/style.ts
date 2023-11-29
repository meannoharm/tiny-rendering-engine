import type { Declaration, Rule, Selector } from './CssParser';
import type { Node, Element } from './HtmlParser';
import { NodeType } from './HtmlParser';

interface StyleNode {
  node: Node;
  values: AnyObject;
  children: StyleNode[];
}

// 可继承的属性，简化只写两个，实际有很多
const inheritableAttributes = ['color', 'font-size'];

export function getStyleTree(elements: Node | Node[], cssRules: Rule[], parent?: StyleNode): StyleNode | StyleNode[] {
  if (!Array.isArray(elements)) {
    elements = [elements];
  }
  if (Array.isArray(elements)) {
    return elements.map((element) => getStyleTree(element, cssRules, parent) as StyleNode);
  }
  return getStyleNode(elements, cssRules, parent);
}

function getStyleNode(element: Node, cssRules: Rule[], parent?: StyleNode) {
  const styleNode: StyleNode = {
    node: element,
    values: getStyleValues(element, cssRules, parent),
    children: [],
  };

  if (element.nodeType === NodeType.Element) {
    // 合并内联项目
    if (element.attributes.styles) {
      styleNode.values = { ...styleNode.values, ...getInlineStyle(element.attributes.styles) };
    }
    styleNode.children = element.children.map((ele) => getStyleNode(ele, cssRules, styleNode));
  }

  return styleNode;
}

function getStyleValues(element: Node, cssRules: Rule[], parent?: StyleNode) {
  const inheritableAttributeValue = getInheritableAttributeValue(parent);

  if (element.nodeType === NodeType.Text) return inheritableAttributeValue;

  return cssRules.reduce((result: AnyObject, rule) => {
    if (isMatch(element, rule.selectors)) {
      result = { ...result, ...cssValueArrayToObject(rule.declarations) };
    }
    return result;
  }, inheritableAttributeValue);
}

function getInheritableAttributeValue(parent?: StyleNode) {
  if (!parent) return {};

  const keys = Object.keys(parent.values);
  return keys.reduce((result: AnyObject, key) => {
    if (inheritableAttributes.includes(key)) {
      result[key] = parent.values[key];
    }
    return result;
  }, {});
}

function isMatch(element: Element, selectors: Selector[]) {
  return selectors.some((selector) => {
    if (selector.tagName && selector.tagName === '*') return true;
    if (selector.tagName && selector.tagName === element.tagName) return true;
    if (selector.id && selector.id === element.attributes.id) return true;
    if (element.attributes.class) {
      const classes = element.attributes.class.split(' ').filter(Boolean);
      const classes2 = selector.class.split(' ').filter(Boolean);
      for (const name of classes) {
        if (classes2.includes(name)) return true;
      }
    }
    return false;
  });
}

function cssValueArrayToObject(declarations: Declaration[]) {
  return declarations.reduce((result: AnyObject, declaration) => {
    result[declaration.name] = declaration.value;
    return result;
  }, {});
}

function getInlineStyle(str: string) {
  str = str.trim();
  if (!str) return {};
  const arr = str.split(';');
  if (!arr.length) return {};

  return arr.reduce((result: AnyObject, item: string) => {
    const data = item.split(':');
    if (data.length === 2) {
      result[data[0].trim()] = data[1].trim();
    }

    return result;
  }, {});
}
