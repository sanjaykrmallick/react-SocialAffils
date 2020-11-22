import React, { Component } from "react";
import Loader from "react-loader-spinner";

class SectionLoader extends Component {
  state = {};
  render() {
    const { isActive } = this.props;

    return (
      <div
        style={{
          width: "95%",
          height: this.props.height || 100,
          display: isActive ? "flex" : "none",
          position: isActive ? "absolute" : "unset",
          zIndex: isActive ? 99999999999 : "unset",
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Loader
          type="TailSpin"
          color="#6f57b3"
          height={this.props.loaderSize || 100}
          width={this.props.loaderSize || 100}
        />
      </div>
    );
  }
}

export default SectionLoader;
