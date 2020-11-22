import React, { Component } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  // Table,
  Button,
  // Badge,
  // Container,
  Row,
  Col,
  Input,
  Label,
  FormGroup,
  Form
} from "reactstrap";
import { sendInvite } from "../http/http-calls";
import config from "../config/index";
import { ToastsStore } from "react-toasts";
import { countryCodes } from "../config/country-codes";
import { showToast } from "../helper-methods";

class SendInviteModal extends Component {
  state = {
    creator: {
      name: "",
      email: "",
      phone: "",
      countryCode: "+1"
    },
    errors: {},
    isDirty: {
      name: false,
      email: false,
      phone: false
    },
    loading: false
  };

  _closeModal = () => {
    console.log("in _closeModal");
    let { creator, errors, isDirty } = this.state;
    creator = {
      name: "",
      email: "",
      phone: "",
      countryCode: "+1"
    };
    isDirty = {
      name: false,
      email: false,
      phone: false
    };
    errors = {};
    this.setState({ creator, errors, isDirty }, () => {
      console.log(creator, errors);
      this.props.toggle();
    });
  };

  _sendInvite() {
    console.log("save user", this.state.creator);
    this.setState({ loading: true });
    let data = {
      name: {
        first: this.state.creator.name.split(" ")[0],
        last: this.state.creator.name.split(" ")[1]
      },
      email: this.state.creator.email.trim().length
        ? this.state.creator.email
        : undefined,
      phone: this.state.creator.phone.trim().length
        ? "(" + this.state.creator.countryCode + ")" + this.state.creator.phone
        : undefined
    };
    sendInvite(data).then(
      response => {
        console.log(response);
        this.setState({ loading: false });
        ToastsStore.success("Invitation sent Successfully.", 3000);
        this.props.reloadInvitationList();
        this._closeModal();
      },
      error => {
        console.log(error);
        // ToastsStore.error(error.reason, 3000);
        showToast(
          error.reason && error.reason.length
            ? error.reason
            : "Server error. Try again after sometime.",
          "error"
        );
        this.setState({ loading: false });
      }
    );
  }

  _handleOnChange = ({ currentTarget }) => {
    const { creator, isDirty } = this.state;
    creator[currentTarget.name] = currentTarget.value;
    isDirty[currentTarget.name] = true;
    this.setState({ creator });
    this._validateForm();
  };

  /**
   * To handle submit of the form and validate it
   */
  _handleOnSubmit = event => {
    event.preventDefault();
    const { isDirty } = this.state;
    isDirty.name = true;
    isDirty.email = true;
    isDirty.phone = true;
    this.setState({ isDirty });
    console.log(this.state.isDirty);
    let errors = this._validateForm();
    console.log(errors);
    // this.setState({errors});
    if (!errors) {
      console.log("Make API call");
      this._sendInvite();
    }
  };

  /**
   * To Validate the form and show the error messages
   */
  _validateForm() {
    const { creator, errors, isDirty } = this.state;
    // console.log(creator, isDirty);
    Object.keys(creator).forEach(each => {
      if (each === "email" && isDirty.email) {
        if (!creator.email.trim().length && !creator.phone.trim().length) {
          errors.email = "Email is Required";
        } else if (
          creator.email.trim().length &&
          !new RegExp(
            "^[a-zA-Z0-9]{1}[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,3}$"
          ).test(creator.email)
        ) {
          errors.email = "Please enter valid Email";
        } else {
          delete errors[each];
          isDirty.email = false;
        }
      } else if (each === "name" && isDirty.name) {
        if (!creator.name.trim().length) {
          // console.log(admin.password);
          errors[each] = "Name is Required";
        } else {
          delete errors[each];
          isDirty.name = false;
        }
      } else if (each === "phone" && isDirty.phone) {
        if (!creator.phone.trim().length && !creator.email.trim().length) {
          // console.log(admin.password);
          errors[each] = "Phone is Required";
        } else if (
          creator.phone.trim().length &&
          !config.regexConfig.phone.test(String(creator.phone).toLowerCase())
        ) {
          errors[each] = "Enter valid phone number";
        } else {
          delete errors[each];
          isDirty.phone = false;
        }
      }
    });
    console.log(errors);
    this.setState({ errors });
    return Object.keys(errors).length ? errors : null;
  }

  componentDidMount() {
    console.log("componentDidMount", this.props);
  }

  _updateCountryCode = value => {
    console.log("TCL: value", value);
    const { creator } = this.state;
    creator["countryCode"] = value;
    this.setState({ creator });
  };

  render() {
    // console.log("from modal", this.props);
    let { creator, loading } = this.state;
    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={() => this._closeModal()}
        className="modal-dialog-centered"
      >
        <Form onSubmit={this._handleOnSubmit} noValidate>
          <ModalHeader toggle={() => this._closeModal()}>
            Invite Creator
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col xs="12">
                <FormGroup className="px-3">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    placeholder="Enter"
                    name="name"
                    value={creator.name}
                    onChange={this._handleOnChange}
                    className={
                      this.state.errors && this.state.errors.name
                        ? "validation-error"
                        : ""
                    }
                  />
                  {this.state.errors && (
                    <div className="validation-error">
                      {this.state.errors.name}
                    </div>
                  )}
                </FormGroup>
                <FormGroup className="px-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Enter"
                    name="email"
                    value={creator.email}
                    onChange={this._handleOnChange}
                    className={
                      this.state.errors && this.state.errors.email
                        ? "validation-error"
                        : ""
                    }
                  />
                  {this.state.errors && (
                    <div className="validation-error">
                      {this.state.errors.email}
                    </div>
                  )}
                </FormGroup>
                <FormGroup className="px-3">
                  <Label htmlFor="phone">Phone</Label>
                  <div style={{ display: "flex" }}>
                    <Input
                      type="select"
                      name="selectCountryCode"
                      id="selectCountryCode"
                      onChange={e => this._updateCountryCode(e.target.value)}
                      value={creator.countryCode.value}
                      style={{ maxWidth: "75px", padding: "4px" }}
                    >
                      {countryCodes.map((countryCode, countryIndex) => (
                        <option
                          key={countryIndex}
                          value={countryCode.dial_code}
                        >
                          {countryCode.code} ({countryCode.dial_code})
                        </option>
                      ))}
                    </Input>
                    <Input
                      type="text"
                      id="phone"
                      placeholder="Enter"
                      name="phone"
                      value={creator.phone}
                      onChange={this._handleOnChange}
                      className={
                        this.state.errors && this.state.errors.phone
                          ? "validation-error"
                          : ""
                      }
                      style={{ maxWidth: "100%" }}
                    />
                  </div>
                  {this.state.errors && (
                    <div className="validation-error">
                      {this.state.errors.phone}
                    </div>
                  )}
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button
              color="dark"
              outline
              type="button"
              className="btn-pill"
              onClick={() => this._closeModal()}
            >
              Cancel
            </Button>
            <Button className="BtnPurple" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <i className="fa fa-spinner fa-spin mr5" />
                  &nbsp;
                </>
              ) : null}
              Send Invite
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    );
  }
}

export default SendInviteModal;
