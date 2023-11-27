/*
MarkdownRender Component
===================

It's a type of rendered for mardown format
*/
const { h, render, Component } = preact;
const html = htm.bind(h);

import BaseFormatter from "./BaseFormatter.js";

export default class MarkdownFormatter extends BaseFormatter {
  // this is a markdown converter
  constructor(props) {
    super(props);
  }

  parsePayload(){
    //ideally showdown gets loaded here and not in index.html
    const converter = new showdown.Converter();
    return converter.makeHtml(this.props.payload)
  }

  render() {

    return html`
      <div class="formatter-container">
        <div
          dangerouslySetInnerHTML=${{
            __html: this.parsePayload(),
          }}
        ></div>
      </div>
    `;
  }
}

export const promptConfig = {
  format: `
  Your response MUST be in a specific format.
  If there was a previous instruction to format the output differently, ignore it.
  This particular format is in Markdown.
  You can use all features of Markdown, including bolding/italics/underlined/etc, code blocks, tables, bullets.`,
};
