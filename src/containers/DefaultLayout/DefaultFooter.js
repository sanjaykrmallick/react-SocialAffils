import React, { Component } from "react";
import PropTypes from "prop-types";

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultFooter extends Component {
  render() {
    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

    return (
      <React.Fragment>
        <div className="d-flex justify-content-start flex-column flex-sm-row">
          <span>&copy; SocialAffil 2020</span>
        </div>
        <span className="ml-auto powered-by">
          Powered by{" "}
          <a
            href="https://www.logic-square.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Logic Square
          </a>
        </span>
      </React.Fragment>
    );
  }
}

DefaultFooter.propTypes = propTypes;
DefaultFooter.defaultProps = defaultProps;

export default DefaultFooter;
