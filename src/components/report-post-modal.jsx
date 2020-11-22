import React, { Component } from "react";
import { Button, Input, Modal, ModalBody } from 'reactstrap';
import { flagPost } from "../http/http-calls";
import SectionLoader from "./section-loader";
import { showToast, sleepTime } from "../helper-methods";


class ReportPostModal extends Component {
  state = {
    isSubmitting: false,
    formFields: {
      reason: {
        value: "Explicit Content",
        isValid: false,
        isDirty: false
      },
      description: {
        value: "",
        isValid: false,
        isDirty: false
      }
    },
    isLoaderActive: false,
  };

  _dismiss = () => {
    this._resetState();
    this.props.onDismiss();
  };

  _handleOutSideClick = () => {
    const { isSubmitting } = this.state;
    if (!isSubmitting) {
      this._resetState();
      this.props.onDismiss();
    }
  }

  _resetState = () => {
    this.setState({
      isSubmitting: false,
      formFields: {
        reason: {
          value: "Explicit Content",
          isValid: false,
          isDirty: false
        },
        description: {
          value: "",
          isValid: false,
          isDirty: false
        }
      },
      isLoaderActive: false
    });
  }

  _markAsDirty = fieldName => {
    const { formFields } = this.state;
    if (formFields[fieldName].value && formFields[fieldName].value.length) {
      formFields[fieldName].isDirty = true;
      this.setState({ formFields });
      this._validateForm();
    }
  };

  _updateFieldValue = (fieldName, value) => {
    const { formFields } = this.state;
    formFields[fieldName].value = value;
    this.setState({ formFields });
    if (formFields[fieldName].isDirty) {
      // Validate
      this._validateForm();
    }
  };

  _validateForm = () => {
    return new Promise((resolve, reject) => {
      const { formFields } = this.state;
    let isFormValid = true;
    Object.keys(formFields).forEach((fieldName, index) => {
      switch (fieldName) {
        case "reason": {

          break;
        }
        case "description": {
          if (formFields.reason.value === 'Other') {
            if (!formFields.description.value || !formFields.description.value.length) {
              formFields.description.isValid = false;
              isFormValid = false;
            } else {
              formFields.description.isValid = true;  
            }
          } else {
            formFields.description.isValid = true;
          }
          break;
        }
      }
    });
    this.setState({ formFields, isFormValid }, () => {
      resolve();
    });
    });
  };

  _makeAllFieldDirty = () => {
    const { formFields } = this.state;
    Object.keys(formFields).forEach((fieldName, index) => {
      formFields[fieldName].isDirty = true;
    });
  };

  _report = async (e=null) => {
    this._makeAllFieldDirty();
    await this._validateForm();
    const { formFields, isFormValid } = this.state;
    if (isFormValid) {
      try {
        this.setState({ isSubmitting: true });
        this._showLoader();
        const { feed } = this.props;
        console.log("TCL: _report -> feed", feed)
        const { formFields } = this.state;
        const payload = {
          category: 'post',
          id: feed._id,
          subject: formFields.reason.value, 
          reportedAgainst: feed._influencer
        };
        if (formFields.description.value && formFields.description.value.length) {
          payload['text'] = formFields.description.value;
        } 
        console.log('payload :', payload);
        await flagPost(payload);
        this.props.onSuccess();
        await sleepTime(400);
        this._resetState();
      } catch (error) {
        console.log('error :', error);
        this._hideLoader();
        showToast("Flagging failed");
        this._resetState();
        this.props.onDismiss();
      }
    }
  };

  _showLoader = () => {
    this.setState({ isLoaderActive: true });
  };

  _hideLoader = () => {
    this.setState({ isLoaderActive: false });
  };

  render() {
    const { isVisible } = this.props;
    const { isLoaderActive, formFields } = this.state;
    
    return (
      <Modal
        isOpen={isVisible}
        toggle={() => this._handleOutSideClick()}
        className="modal-dialog-centered"
      >
        <ModalBody className="text-center">
          <SectionLoader
            isActive={isLoaderActive}
            loaderSize={30}
            height={400}
          />
          <h2 className="mt-3 mb-4">Mark post as inappropriate</h2>

          <div className="container-fluid">
            <div className="row">
              <div className="col-12 text-left">
                <h6 className="mt-2 mb-2">Reason</h6>
                <Input
                  type="select"
                  name="select"
                  id="select"
                  className="p-1"
                  value={formFields.reason.value}
                  onChange={e =>
                    this._updateFieldValue("reason", e.target.value)
                  }
                >
                  <option value="Explicit Content">Explicit Content</option>
                  <option value="Hate Speech">Hate Speech</option>
                  <option value="Promotes Illegal Activity">
                    Promotes Illegal Activity
                  </option>
                  <option value="Racism">Racism</option>
                  <option value="Violence">Violence</option>
                  <option value="Other">Other</option>
                </Input>
              </div>
              <div className="col-12 mt-4 mb-4 text-left">
                <h6 className="mt-2 mb-2">Describe</h6>
                <textarea
                  placeholder=""
                  className="form-control"
                  rows="4"
                  style={{ resize: "none" }}
                  value={formFields.description.value}
                  onChange={e =>
                    this._updateFieldValue("description", e.target.value)
                  }
                  onBlur={() => this._markAsDirty("description")}
                />
                {formFields.description.isDirty &&
                !formFields.description.isValid ? (
                  <p 
                    className="form-error"
                    style={{
                      paddingLeft: 'unset',
                      paddingTop: '8px'
                    }}
                  >Please describe</p>
                ) : null}
              </div>
            </div>
          </div>

          <Button
            color="danger"
            className="mr-4 mb-3"
            size="lg"
            onClick={this._report}
          >
            <i className="icon-check mr-1" style={{ marginTop: "0.5px" }}></i>{" "}
            Report
          </Button>

          <Button
            outline
            color="warning"
            className="mb-3"
            size="lg"
            onClick={() => this._dismiss()}
          >
            <i className="icon-close mr-1" style={{ marginTop: "0.5px" }}></i>{" "}
            Cancel
          </Button>
        </ModalBody>
      </Modal>
    );
  }
}

export default ReportPostModal;
