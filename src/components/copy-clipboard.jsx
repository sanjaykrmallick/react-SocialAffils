import React, { Component } from 'react';
import { ToastsStore } from "react-toasts";

class CopyclipBoard extends Component {
  state = {
    copySuccess: false
  }

  _copyToClipboard = () => {
    const el = this.input
    el.disabled = false
    el.select()
    document.execCommand("copy")
    el.disabled = true
    this.setState({ copySuccess: true },
      () => {
        ToastsStore.success("Copied Successfully.", 3000);
      })
  }

  render() {

    const style = {
      cursor: 'pointer',
      border: this.props.border ? this.props.border : 'inherit',
      background: this.props.background ? this.props.background : 'inherit',
      color: this.props.color ? this.props.color : 'inherit',
      fontSize: this.props.fontWeight ? this.props.fontSize : 'inherit',
      fontWeight: this.props.fontWeight ? this.props.fontWeight : 'inherit'
    }

    return (
      <>
        <input
          style={style}
          ref={(input) => this.input = input}
          onClick={() => this._copyToClipboard()}
          defaultValue={this.props.copiedValue}
          title="copy to clipboard"
        />
      </>
    )
  }
}

export default CopyclipBoard;