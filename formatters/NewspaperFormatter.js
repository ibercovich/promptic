const { h, render, Component } = preact;
const html = htm.bind(h);

import BaseFormatter from "./BaseFormatter.js";

export default class NewspaperFormatter extends BaseFormatter {
  // this is a markdown converter
  constructor(props) {
    super(props);
  }

  render() {
    return html`
      <div className="newspaper">
        <h1 className="main-title">The Preact Times</h1>
        <div className="headliner">
          <h2 className="headline">Breaking News: Preact is Awesome!</h2>
          <img
            className="headline-image"
            src="https://via.placeholder.com/400x200"
            alt="Preact"
          />
          <p className="column">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
            odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla
            quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
            mauris...
          </p>
          <p className="column">
            ...Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum
            lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora
            torquent per conubia nostra, per inceptos himenaeos. Curabitur
            sodales ligula in libero...
          </p>
        </div>
        <div className="article-summary">
          <h3 className="article-title">Other News: Preact is Fast</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
            odio. Praesent libero...
          </p>
        </div>
        <div className="article-summary">
          <h3 className="article-title">In-Depth: Preact vs React</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
            odio. Praesent libero...
          </p>
        </div>
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
