import React, { Component } from "react";
import { deepClone } from "../helper-methods";
class CustomChip extends Component {
  state = {
    editing: false,
    prevValue: "",
    newValue: "",
    inputValue: ""
  };
 
  componentWillReceiveProps(newProps) {
    this.setState({ inputValue: newProps.value });
  }
  render() {
    const {  value } = deepClone(this.props);
    return (
      <React.Fragment>
        <div
          style={{
            padding: 5,
            background:"#1F1F1F",
            margin: "2.5px",
            borderRadius: 14,
            paddingTop: "6px",
            paddingBottom: "6px",
            paddingLeft: "10px",
            paddingRight: "10px",
            color: "white",
            fontWeight: 600,
            cursor: "text"
          }}
        >
          <span
            style={{
              background: "#1F1F1F",
              color: "white",
              fontWeight: 600,
              cursor: "text"
            }}
          >
            {value}
          </span>
        </div>
      </React.Fragment>
    );
  }
}
export default CustomChip;
