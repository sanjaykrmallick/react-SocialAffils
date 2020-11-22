import React, { Component } from "react";
import { Button, Modal, ModalBody } from "reactstrap";

class CustomPrompt extends Component {
  state = {};

  _dismiss = () => {
    this.props.onDismiss();
  };

  render() {
    const { isVisible, message } = this.props;

    return (
      <Modal
        isOpen={isVisible}
        toggle={() => this.props.onDismiss()}
        className="modal-dialog-centered"
      >
        {message && message.length ? (
          <ModalBody className="text-center">
            <h2 className="mt-3 mb-4">{message}</h2>

            <Button
              color="success"
              className="mr-4 mb-3"
              size="lg"
              onClick={( )=> this.props.onSuccess()}
            >
              <i className="icon-check mr-1" style={{ marginTop: "0.5px" }}></i>{" "}
              {this.props.successButtonText || "Yes"}
            </Button>

            <Button
              outline
              color="warning"
              className="mb-3"
              size="lg"
              onClick={() => this.props.onDismiss()}
            >
              <i className="icon-close mr-1" style={{ marginTop: "0.5px" }}></i>{" "}
              {this.props.closeButtonText || "No"}
            </Button>
          </ModalBody>
        ) : null}
      </Modal>
    );
  }
}

export default CustomPrompt;
