/*
BasePrompt Component
===================

Contains all affordances and logic to configure GPT
and send prompts via the Open AI API
*/
const { h, render, Component } = preact;
const html = htm.bind(h);

class BasePrompt extends Component {
  constructor(props) {
    super(props);
    this.promptConfig = promptConfig;
    this.state = {
      loading: false,
      prompt: localStorage.getItem("prompt") || "",
      displaySystemPrompt: true, // todo: might want to enable for debugging
      systemPrompt: "",
      systemConfig: {},
      systemModal: "",
      apiKey: localStorage.getItem("apiKey") || "",
      gptModel: localStorage.getItem("gptModel") || "gpt-3.5-turbo",
      gptResponse: sessionStorage.getItem("gptResponse"),
    };

    if (this.props.handleModelResponse) {
      this.props.handleModelResponse(this.state.gptResponse);
    }

    this.setState({ systemPrompt: this.getBaseSystemPrompt() });
  }

  componentDidUpdate(prevProps) {
    if (this.props.promptFormat !== prevProps.promptFormat) {
      this.setState({ systemPrompt: this.getBaseSystemPrompt() });
    }
  }

  getBaseSystemPrompt = (systemConfig) => {
    const str =
      this.promptConfig.intro +
      "\n\n" +
      this.promptConfig.rules +
      "\n\n" +
      this.props.promptFormat +
      "\n\n" +
      this.promptConfig.specs +
      "\n\n" +
      //sometimes we need to pass a newer system config
      this.getSystemConfigPrompt(systemConfig || this.state.systemConfig);
    //removing unnecessary spaces to save tokens
    return str
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
  };

  getSystemConfigPrompt = (systemConfig) => {
    var partialPrompt = "";
    Object.entries(systemConfig).forEach(([key, value]) => {
      partialPrompt += `${key}: ${value} \n\n`;
    });
    return partialPrompt;
  };

  GPTConfig = () => {
    return html`
      <div class="field">
        <div class="control">
          <input
            class="input"
            type="text"
            id="api-key"
            value=${this.state.apiKey}
            onInput=${this.handleApiKeyChange}
            placeholder="OpenAI API key"
          />
        </div>
      </div>
      <div class="field">
        <div class="control">
          <div class="select">
            <select
              id="gpt-model"
              value=${this.state.gptModel}
              onChange=${this.handleModelChange}
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
            </select>
          </div>
        </div>
      </div>
    `;
  };

  TextIntoParagraphs = (content) => {
    //using systemPrompt as default since function is only called there
    const text = content || this.state.systemPrompt;
    const paragraphs = text.split(/\n\s*\n/);
    const formattedParagraphs = paragraphs.map(
      (paragraph) => `<div class="block">${paragraph.trim()}</div>`
    );
    return formattedParagraphs.join("");
  };

  ToggleModal = (event) => {
    const thisModal = event.target.dataset.target;
    const status = this.state[thisModal] ? "" : "is-active";
    this.setState({ [thisModal]: status });
  };

  SystemModal = () => {
    return html`
      <div id="systemModal" class="modal ${this.state.systemModal}">
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">System Prompt</p>
            <button
              class="delete"
              aria-label="close"
              data-target="systemModal"
              onClick=${this.ToggleModal}
            ></button>
          </header>
          <section
            class="modal-card-body"
            dangerouslySetInnerHTML=${{
              __html: this.TextIntoParagraphs(),
            }}
          ></section>
        </div>
      </div>
    `;
  };

  DynamicDropdown = ({ category, onChange }) => {
    const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
    return html`
      <div class="field">
        <!-- <label class="label" for="${category}">${capitalized}</label> -->
        <div class="control">
          <div class="select">
            <select id="${category}" onChange=${onChange}>
              <option value="">Select ${category}</option>
              ${Object.entries(this.promptConfig.categories[category]).map(
                ([key, value]) =>
                  html` <option value="${value}">${key}</option> `
              )}
            </select>
          </div>
        </div>
      </div>
    `;
  };

  DropdownPanel = () => {
    //probably want some css to handle more than 3 or 4 dropdowns
    const self = this;
    return html`
      ${Object.entries(this.promptConfig.categories).map(
        ([key, value], index) => html`
          <${self.DynamicDropdown}
            category="${key}"
            onChange=${self.handleDynamicDropdown}
          />
        `
      )}
    `;
  };

  handleDynamicDropdown = (event) => {
    const selectedValue = event.target.value;
    const selectId = event.target.id;

    var systemConfig = this.state.systemConfig;
    systemConfig[selectId] = selectedValue;
    var systemPrompt = this.getBaseSystemPrompt(systemConfig);

    this.setState({ systemPrompt: systemPrompt, systemConfig: systemConfig });
  };

  handlePromptChange = (event) => {
    localStorage.setItem("prompt", event.target.value);
    this.setState({ prompt: event.target.value });
  };

  handleApiKeyChange = (event) => {
    localStorage.setItem("apiKey", event.target.value);
    this.setState({ apiKey: event.target.value });
  };

  handleModelChange = (event) => {
    localStorage.setItem("gptModel", event.target.value);
    this.setState({ gptModel: event.target.value });
  };

  handleSubmit = async () => {
    this.setState({ loading: true, gptResponse: "" });

    // clear out current while loading
    if (this.props.handleModelResponse) {
      this.props.handleModelResponse("");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.state.apiKey}`,
      },
      body: JSON.stringify({
        model: this.state.gptModel,
        messages: [
          { role: "system", content: this.state.systemPrompt },
          { role: "user", content: this.state.prompt },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    this.setState({ loading: false });

    if (data.choices && data.choices.length > 0) {
      const message = data.choices[0].message.content;
      sessionStorage.setItem("gptResponse", message);
      this.setState({ gptResponse: message });
      if (this.props.handleModelResponse) {
        this.props.handleModelResponse(message);
      }
    } else {
      console.error("Error: GPT response does not contain choices.");
    }
  };

  render() {
    self = this;
    return html`
      <${this.GPTConfig} />
      <${this.DropdownPanel} />
      <${this.SystemModal} />
      <div class="field">
        <label class="label" for="prompt">Prompt:</label>
        <div class="control">
          <textarea
            class="textarea"
            id="prompt"
            value=${this.state.prompt}
            onInput=${this.handlePromptChange}
            placeholder="Type your prompt here..."
          />
        </div>
      </div>

      <div class="field is-grouped">
        <p class="control">
          <button
            class="button"
            data-target="systemModal"
            onClick=${this.ToggleModal}
          >
            System
          </button>
        </p>
        <p class="control">
          <button class="button is-primary" onClick=${this.handleSubmit}>
            Generate
          </button>
        </p>
      </div>
    `;
  }
}

//example prompt configuration
export const promptConfig = {
  categories: {
    category1: {
      level_1: "level 1",
      level_2: "level 2",
      level_3: "level 3",
    },
    category2: {
      level_1: "level 1",
      level_2: "level 2",
      level_3: "level 3",
    },
    category3: {
      level_1: "level 1",
      level_2: "level 2",
      level_3: "level 3",
    },
    category4: {
      level_1: "level 1",
      level_2: "level 2",
      level_3: "level 3",
    },
  },
  intro: `You are a helpful Assistant.`,

  rules: `
          These are the rules the AI MUST follow:
          - The AI must be able to create a response based on the selected preferences.
          - The AI must be decisive and take lead.
          - The AI must never be unsure where to continue.
          - The AI must take into account it's preferences because that's what the user prefers.
          - The AI must be engaging.
          - The AI must always use emojis.
        `,
  specs: `
          What follows is a collection of preferences the AI MUST consider when responding to this request.
          You will be provided with preferences for [category1], [category2], [category3], ...
          \n
          Specifications: \n
        `,
};

export default BasePrompt;
