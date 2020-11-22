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
  Form,
} from "reactstrap";
import { createAdmin } from "../http/http-calls";
// import config from '../config/index';
import { ToastsStore } from "react-toasts";
import { showToast } from "../helper-methods";
import { countryCodes } from "../config/country-codes";
import config from "../config";

class AddAdminModal extends Component {
  state = {
    adminUser: {
      name: "",
      email: "",
      phone: "",
      countryCode: "+1",
      type: "",
      status: "",
    },
    errors: {},
    isDirty: {
      name: false,
      email: false,
      phone: false,
    },
    loading: false,
  };

  _closeModal = () => {
    let { adminUser, errors, isDirty } = this.state;
    adminUser = {
      name: "",
      email: "",
      phone: "",
      countryCode: "+1",
    };
    isDirty = {
      name: false,
      email: false,
      phone: false,
    };
    errors = {};
    this.setState({ adminUser, errors, isDirty }, () => {
      console.log(adminUser, errors);
      this.props.toggle();
    });
  };

  _saveUser() {
    console.log("save user", this.state.adminUser);
    this.setState({ loading: true });
    let data = {
      name: {
        first: this.state.adminUser.name.split(" ")[0],
        last: this.state.adminUser.name.split(" ")[1],
      },
      email: this.state.adminUser.email,
      phone:
        "(" +
        this.state.adminUser.countryCode +
        ")" +
        this.state.adminUser.phone,
    };
    createAdmin(data).then(
      (response) => {
        console.log(response);
        this.setState({ loading: false });
        ToastsStore.success("Admin user added Successfully.", 3000);
        this.props.reloadAdminList();
        this._closeModal();
      },
      (error) => {
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
    const { adminUser, isDirty } = this.state;
    adminUser[currentTarget.name] = currentTarget.value;
    isDirty[currentTarget.name] = true;
    this.setState({ adminUser });
    this._validateForm();
  };

  /**
   * To handle submit of the form and validate it
   */
  _handleOnSubmit = (event) => {
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
      this._saveUser();
    }
  };

  /**
   * To Validate the form and show the error messages
   */
  _validateForm() {
    const { adminUser, errors, isDirty } = this.state;
    // console.log(adminUser, isDirty);
    Object.keys(adminUser).forEach((each) => {
      if (each === "email" && isDirty.email) {
        if (!adminUser.email.trim().length) {
          errors.email = "Email is Required";
        } else if (
          adminUser.email.trim().length &&
          !new RegExp(
            "^[a-zA-Z0-9]{1}[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,3}$"
          ).test(adminUser.email)
        ) {
          errors.email = "Please enter valid Email";
        } else {
          delete errors[each];
          isDirty.email = false;
        }
      } else if (each === "name" && isDirty.name) {
        if (!adminUser.name.trim().length) {
          // console.log(admin.password);
          errors[each] = "Name is Required";
        } else {
          delete errors[each];
          isDirty.name = false;
        }
      } else if (each === "phone" && isDirty.phone) {
        if (!adminUser.phone.trim().length) {
          // console.log(admin.password);
          errors[each] = "Phone is Required";
        } else if (
          !config.regexConfig.phone.test(String(adminUser.phone).toLowerCase())
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

  _updateCountryCode = (value) => {
    const { adminUser } = this.state;
    adminUser["countryCode"] = value;
    this.setState({ adminUser });
  };

  componentDidUpdate(previousProps, previousState) {
    // console.log('previousProps :', previousProps, this.props);
    if (this.props.data && previousProps.isOpen !== this.props.isOpen) {
      console.log("object :", this.props.data);
      if (this.props.type !== "add" && this.props.data) {
        this.setState({ adminUser: this.props.data });
      } else if (this.props.type === "add") {
        console.log("here in add mode :");

        this._resetForm();
      }
    } else if (!this.props.data && previousProps.isOpen !== this.props.isOpen) {
      this._resetForm();
    }
  }
  _resetForm = () => {
    let adminUser = {
      name: "",
      email: "",
      phone: "",
      countryCode: "+1",
      type: "",
      status: "",
    };
    this.setState({ adminUser });
  };
  _makeModalHeader = () => {
    switch (this.props.type) {
      case "add":
        return "Add Admin";
      case "edit":
        return "Edit Admin";

        break;
      default:
      // code block
    }
  };
  render() {
    let { adminUser, loading } = this.state;

    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={() => this._closeModal()}
        className="modal-dialog-centered"
      >
        <Form onSubmit={this._handleOnSubmit} noValidate>
          <ModalHeader toggle={() => this._closeModal()}>
            {/* Add Admin User */}
            {this._makeModalHeader()}
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
                    value={adminUser.name}
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
                    value={adminUser.email}
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
                      onChange={(e) => this._updateCountryCode(e.target.value)}
                      value={adminUser.countryCode}
                      style={{ maxWidth: "105px", padding: "4px" }}
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
                      value={adminUser.phone}
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
                {this.props.type !== "add" ? (
                  <>
                    {" "}
                    {/* <FormGroup className="px-3">
                      <Label htmlFor="type">Type</Label>
                      <Input
                        type="select"
                        id="type"
                        placeholder="Enter"
                        name="type"
                        value={adminUser.type}
                        onChange={this._handleOnChange}
                        className={
                          this.state.errors && this.state.errors.type
                            ? "validation-error"
                            : ""
                        }
                      >
                        <option>Type</option>
                        <option value="Admin">Admin</option>
                        <option value="Member">Member</option>
                      </Input>
                      {this.state.errors && (
                        <div className="validation-error">
                          {this.state.errors.type}
                        </div>
                      )}
                    </FormGroup> */}
                    <FormGroup className="px-3">
                      <Label htmlFor="status">Status</Label>
                      <Input
                        type="select"
                        id="status"
                        placeholder="Enter"
                        name="status"
                        value={adminUser.status}
                        onChange={this._handleOnChange}
                        className={
                          this.state.errors && this.state.errors.status
                            ? "validation-error"
                            : ""
                        }
                      >
                        <option>Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </Input>
                      {this.state.errors && (
                        <div className="validation-error">
                          {this.state.errors.status}
                        </div>
                      )}
                    </FormGroup>
                  </>
                ) : null}
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
            {this.props.type == "add" ? (
              <Button className="BtnPurple" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fa fa-spinner fa-spin mr5" />
                    &nbsp;
                  </>
                ) : null}
                Add User
              </Button>
            ) : (
              <Button className="BtnPurple" type="submit" disabled={true}>
                {loading ? (
                  <>
                    <i className="fa fa-spinner fa-spin mr5" />
                    &nbsp;
                  </>
                ) : null}
                Edit User
              </Button>
            )}
          </ModalFooter>
        </Form>
      </Modal>
    );
  }
}

export default AddAdminModal;
