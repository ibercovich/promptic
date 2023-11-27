/* 
BaseFormatter must be the parent of all formatters
Formatters might want to modify the parsePayload() method
All formatters must export a promptConfig with format instructions
*/

const { h, render, Component } = preact;
const html = htm.bind(h);

export default class BaseFormatter extends Component {
  constructor(props) {
    super(props);
  }

  parsePayload() {
    return this.props.payload || "[Empty Payload]";
  }
}

export const promptConfig = {
  format: `
  Your response MUST be in a specific format.
  If there was a previous instruction to format the output differently, ignore it.
  This particular format is in HTML.
  You can use any HTML, such as bolding, italics, bullets, tables, etc.`,
};