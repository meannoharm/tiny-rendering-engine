import HtmlParser from '../src/HtmlParser';
import { element, text } from '../src/dom';

describe('htmlParser test', () => {
  const htmlTemplate = `{
  "tagName": "html",
  "attributes": {},
  "children": [
    {
      "tagName": "body",
      "attributes": {},
      "children": [
        {
          "tagName": "div",
          "attributes": {},
          "children": [
            {
              "nodeValue": "test!",
              "nodeType": 3
            }
          ],
          "NodeType": 1
        }
      ],
      "NodeType": 1
    }
  ],
  "NodeType": 1
}`;

  const htmlTemplate2 = `{
  "tagName": "html",
  "attributes": {},
  "children": [
    {
      "nodeValue": " ",
      "nodeType": 3
    },
    {
      "tagName": "body",
      "attributes": {},
      "children": [
        {
          "nodeValue": " ",
          "nodeType": 3
        },
        {
          "tagName": "div",
          "attributes": {},
          "children": [
            {
              "nodeValue": "test!",
              "nodeType": 3
            }
          ],
          "NodeType": 1
        },
        {
          "nodeValue": " ",
          "nodeType": 3
        }
      ],
      "NodeType": 1
    },
    {
      "nodeValue": " ",
      "nodeType": 3
    }
  ],
  "NodeType": 1
}`;

  test('parse html template', () => {
    const parser = new HtmlParser();
    const parseResult = JSON.stringify(parser.parse('<html><body><div>test!</div></body></html>'), null, 2);
    const parseResult2 = JSON.stringify(
      parser.parse(`
      <html>
        <body>
          <div>test!</div>
        </body>
      </html>
    `),
      null,
      2,
    );

    expect(parseResult).toBe(htmlTemplate);
    expect(parseResult2).toBe(htmlTemplate2);
  });

  test('parse html object', () => {
    const html = element('html');
    const body = element('body');
    const div = element('div');

    html.children.push(body);
    body.children.push(div);
    div.children.push(text('test!'));

    expect(JSON.stringify(parser.parse(html), null, 2)).toBe(htmlTemplate);
  });

  const htmlTemplate3 = `{
  "tagName": "div",
  "attributes": {
    "class": "lightblue test",
    "id": "div",
    "data-index": "1"
  },
  children: [
    {
      "nodeValue": "test!",
      "nodeType": 3
    }
  ],
  "nodeType": 1
}`;

  test('parse html attributes', () => {
    const parser = new HtmlParser();
    const parseResult = JSON.stringify(
      parser.parse('<div class="lightblue test" id="div" data-index="1">test!</div>'),
      null,
      2,
    );

    expect(parseResult).toBe(htmlTemplate3);
  });
});
