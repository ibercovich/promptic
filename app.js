/* Third party libraries */
const { h, render, Component } = preact;
const html = htm.bind(h);

/* Custom components */
const availablePrompts = ["BasePrompt", "TutorPrompt"];
const availableFormatters = ["Markdown", "Slideshow", "Newspaper"];

class Prompticus extends Component {
  constructor() {
    super();
    this.state = {
      gptResponse: "",
      payload: null,
      selectedFormatter: null,
      promptFormat: null,
      selectedPrompt: null,
    };
  }

  componentDidMount() {
    // Load the previous configuration from localStorage
    const previousPrompt = localStorage.getItem("selectedPromptName");
    const previousFormatter = localStorage.getItem("selectedFormatterName");

    if (previousPrompt) {
      this.loadPrompt(previousPrompt);
    }

    if (previousFormatter) {
      this.loadFormatter(previousFormatter);
    }
  }

  async loadFormatter(name) {
    /*
    Load formatter dynamically and grab formatPrompt
    so that it can be passed to the prompt module as a prop
    */
    const module = await import(`./formatters/${name}Formatter.js`);
    this.setState({ selectedFormatter: module.default });
    this.setState({ promptFormat: module.promptConfig.format });
    localStorage.setItem("selectedFormatterName", name);
  }

  async loadPrompt(name) {
    /*
    Load prompt modules dynamically
    */
    const module = await import(`./prompts/${name}.js`);
    this.setState({ selectedPrompt: module.default });
    localStorage.setItem("selectedPromptName", name);
  }

  isSelected = (dropdown, name) => {
    const peviousName = localStorage.getItem(`selected${dropdown}Name`);
    return name === peviousName;
  };

  handleModelResponse = (gptResponse) => {
    /*
    The prompt module will return a response from GPT
    The response is then loaded in the payload state
    The payload state is passed as a prop to the formatter
    */
    console.log("Received LLM response", gptResponse);
    this.setState({ payload: gptResponse });
  };

  render() {
    return html`
      <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <a class="navbar-item" href="https://bulma.io">
            <img
              src="https://bulma.io/images/bulma-logo.png"
              width="112"
              height="28"
            />
          </a>
        </div>
      </nav>
      <div class="columns">
        <div class="column">
          <div class="container">
            <div class="columns">
              <div
                class="column 
          is-one-third-tablet 
          is-one-quarter-desktop 
          is-one-fifth-widescreen 
          is-one-fifth-fullhd 
          is-narrow"
              >
                <div class="box">
                  <div class="field">
                    <!-- <label class="label">Prompt</label> -->
                    <div class="control">
                      <div class="select">
                        <select
                          onChange=${(e) => this.loadPrompt(e.target.value)}
                        >
                          <option value="">Select Prompt</option>
                          ${availablePrompts.map(
                            (name) => html`
                              <option
                                value=${name}
                                selected=${this.isSelected("Prompt", name)}
                              >
                                ${name}
                              </option>
                            `
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="field">
                    <!-- <label class="label">Formatter</label> -->
                    <div class="control">
                      <div class="select">
                        <select
                          onChange=${(e) => this.loadFormatter(e.target.value)}
                        >
                          <option value="">Select Format</option>
                          ${availableFormatters.map(
                            (name) => html`
                              <option
                                value=${name}
                                selected=${this.isSelected("Formatter", name)}
                              >
                                ${name}
                              </option>
                            `
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                  ${this.state.selectedPrompt &&
                  html`
                    <${this.state.selectedPrompt}
                      handleModelResponse=${this.handleModelResponse}
                      promptFormat=${this.state.promptFormat}
                    />
                  `}
                </div>
              </div>
              <div class="column">
                <div class="">
                  ${this.state.selectedFormatter &&
                  html`
                    <${this.state.selectedFormatter}
                      payload=${this.state.payload}
                    />
                  `}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="block">
          <div class="content has-text-centered">Sponsored by ScOp VC</div>
        </div>
      </div>
    `;
  }
}

render(html`<${Prompticus} />`, document.getElementById("app"));
