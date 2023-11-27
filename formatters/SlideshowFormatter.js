const { h, render, Component } = preact;
const html = htm.bind(h);

import BaseFormatter from "./BaseFormatter.js";

export default class SlideshowFormatter extends BaseFormatter {
  constructor(props) {
    super(props);
    this.state = {
      currentSlide: 0,
      importedSlides: null,
    };
  }

  parsePayload() {
    const payload = this.props.payload;
    try {
      // Wrap the string in parentheses to allow for object literals
      const stripped =
        payload.match(/```javascript([\s\S]*?)```/)?.[1]?.trim() || payload;
      const wrappedStr = `(${stripped})`;

      // Use eval to parse the string
      const parsed = eval(wrappedStr);

      // Check if the parsed value is an array and all elements are objects
      if (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === "object" && !Array.isArray(item))
      ) {
        return parsed;
      }
    } catch (error) {
      // Ignore errors, return null
    }
    return [
      {
        title: "Wrong Format",
        content: `There is either no data or the data is not properly structured. <br/>
          The expected format is an array of slide objects as follows: <br/>
          [ <br/>
            {title: "slide title", content: "slide content", notes: "slide notes"}, <br/>
            {title: "slide title", content: "slide content", notes: "slide notes"}, <br/>
          ]`,
        notes: "notes go here",
      },
    ];
  }

  slides = () => {
    if (this.state.importedSlides) {
      return this.state.importedSlides;
    }
    return this.parsePayload();
  };

  nextSlide = () => {
    this.setState({
      currentSlide: this.slides().length
        ? (this.state.currentSlide + 1) % this.slides().length
        : 0,
    });
  };

  prevSlide = () => {
    this.setState({
      currentSlide: this.slides().length
        ? (this.state.currentSlide - 1 + this.slides().length) %
          this.slides().length
        : 0,
    });
  };

  getFileName = () => this.slides()[0].title + ".json";

  getDataUri = () =>
    "data:application/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(this.slides()));

  import = (e) => {
    const self = this;
    var reader = new FileReader();
    reader.onload = function (e) {
      const result = e.target.result;
      console.log(e.target.result);
      self.setState({ currentSlide: 0 });
      self.setState({ importedSlides: JSON.parse(result) });
    };
    reader.readAsText(e.target.files[0]);
  };

  render() {
    const currentSlide = this.slides()[this.state.currentSlide];
    const self = this;

    // TODO: should sanitize slide.content as it comes from an API

    return this.slides().length
      ? html`
          <div class="columns is-multiline">
            <div class="column is-full">
              <div class="card">
                <header class="card-header">
                  <p class="card-header-title">${currentSlide.title}</p>
                </header>
                <div class="card-content" 
                  style="height:400px;" 
                  dangerouslySetInnerHTML=${{ __html: currentSlide.content }}
                >
                </div>
                <footer class="card-footer">
                  <a href="#" class="card-footer-item" onClick=${this.prevSlide}
                    >Previous</a
                  >
                  <a href="#" class="card-footer-item" onClick=${this.nextSlide}
                    >Next</a
                  >
                </footer>
              </div>
            </div>
            <div class="column is-full is-flex is-justify-content-center" >
              <div
              class="column"
              dangerouslySetInnerHTML=${{
                __html: currentSlide.notes,
              }}
              ></div>
            </div>
            <div class="column is-flex is-justify-content-center is-full" >
              <div class="field has-addons">
                <p class="control">
                  <div class="file is-small">
                    <label class="file-label">
                      <input
                        class="file-input"
                        type="file"
                        name="slides"
                        accept=".json"
                        onchange="${this.import}"
                      />
                      <span class="file-cta">
                        <span class="file-label">Import Slides</span>
                      </span>
                    </label>
                  </div>
                </p>
                <p class="control">
                  <a
                    target="_blank"
                    class=""
                    href="${this.getDataUri()}"
                    download="${this.getFileName()}"
                    >
                      <button class="button is-small">Export Slides</button>
                  </a>
                </p>
              </div>
            </div>
          </div>
        `
      : null;
  }
}

export const promptConfig = {
  format: `
  Your response MUST be in a specific format.
  If there was a previous instruction to format the output differently, ignore it.
  This particular format is an array of javascript objects.
  The array of objects must be enclosed in a javascript code block.
  There can be an arbitrary elements in the array.
  But each object MUST conform to the structure below.
  Each object must contain: title, content, and notes.
  Example return structure:
  \n
  \`\`\`javascript \n
  [
      {tile: 'slide 1 title', content: 'slide 1 content', notes: ''},
      {tile: 'slide 2 title', content: 'slide <b>2</b> content' notes: 'notes for <i>presenter_name</i>'},
      {tile: 'slide 3 title', content: 'slide 3 content', notes: 'notes for slide 3'},
  ]
  \n
  \`\`\` \n
  Don't return any explanations, just the JSON structure.
  \n`,
};
