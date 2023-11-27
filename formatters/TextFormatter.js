const { h, render, Component } = preact;
const html = htm.bind(h);

import BaseFormatter from "./BaseFormatter.js";

export default class TextFormatter extends BaseFormatter {
  constructor(props) {
    super(props);
  }
  render() {
    return html`<div class="formatter-container">${this.parsePayload()}</div>`;
  }
};

export const promptConfig = {
  format: `
  Your response MUST be in a specific format.
  If there was a previous instruction to format the output differently, ignore it.
  This particular format is in plain text.`,
};