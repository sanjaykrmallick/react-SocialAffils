import React, { Component } from "react";
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Row,
  Col,
  Container,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";
import { fotgotPassword } from "../http/http-calls";
import { ToastsStore } from "react-toasts";
import { showToast } from "../helper-methods";
class ForgotPassword extends Component {
  state = {
    admin: {
      handle: "",
    },
    errors: {},
    isDirty: {
      handle: false,
    },
    loading: false,
  };
  /**
   * To go back to login
   */
  _backToLogin = () => {
    this.props.history.push("login");
  };

  /**
   * To handle in input change and set the value to state
   */
  _handleOnChange = ({ currentTarget }) => {
    const { admin, isDirty } = this.state;
    admin[currentTarget.name] = currentTarget.value;
    isDirty[currentTarget.name] = true;
    this.setState({ admin });
    this._validateForm();
  };

  /**
   * To handle the form submit and validate it
   */
  _handleOnSubmit = (event) => {
    event.preventDefault();
    const { isDirty } = this.state;
    isDirty.handle = true;
    this.setState({ isDirty });
    console.log(this.state.isDirty);
    let errors = this._validateForm();
    console.log(errors);
    if (!errors) {
      console.log("Make API call");
      this._fotgotPassword();
    }
  };

  /**
   * To validate the form
   */
  _validateForm() {
    const { admin, errors, isDirty } = this.state;
    // console.log(admin, isDirty);
    Object.keys(admin).forEach((each) => {
      if (each === "handle" && isDirty.handle) {
        if (!admin.handle.trim().length) {
          errors.handle = "Email is Required";
        } else if (
          admin.handle.trim().length &&
          !new RegExp(
            "^[a-zA-Z0-9]{1}[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,3}$"
          ).test(admin.handle)
        ) {
          errors.handle = "Please enter valid Email";
        } else {
          delete errors[each];
          isDirty.handle = false;
        }
      }
    });
    this.setState({ errors });
    return Object.keys(errors).length ? errors : null;
  }

  /**
   * To manage the loading
   */
  _manageLoading = (value) => {
    let { loading } = this.state;
    loading = value;
    this.setState({ loading });
  };

  /**
   * Make forgot password api call
   */
  _fotgotPassword = () => {
    this._manageLoading(true);
    fotgotPassword(this.state.admin).then(
      (response) => {
        console.log(response);
        ToastsStore.success(
          "Please check your email for futher instructions",
          3000
        );
        this._manageLoading(false);
        this.props.history.push('/login')
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
        this._manageLoading(false);
      }
    );
  };

  render() {
    return (
      <div className="app loginPgBg animated fadeIn">
        <Container>
          <Row className="justify-content-center">
            <Col md="12">
              <div className="loginPgContent">
                <CardGroup>
                  <Card>
                    <CardBody>
                      {/* <img
                        src={"assets/soomers-logo.png"}
                        onClick={this._backToLogin}
                        alt="Sommer’s Camp Logo"
                        className="company-logo mb-4"
                      /> */}
                      <h2 className="mb-4">Forgot Password</h2>
                      <Form onSubmit={this._handleOnSubmit} noValidate>
                        <Row form>
                          <Col md={12}>
                            <InputGroup
                              className={
                                this.state.errors && this.state.errors.handle
                                  ? "mb-3 invalid-input"
                                  : "mb-3"
                              }
                            >
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                  <i className="icon-envelope forgot-icon"></i>
                                </InputGroupText>
                              </InputGroupAddon>
                              <Input
                                type="email"
                                placeholder="Email"
                                autoComplete="off"
                                name="handle"
                                onChange={this._handleOnChange}
                              />
                              {this.state.errors && (
                                <div className="validation-error">
                                  {this.state.errors.handle}
                                </div>
                              )}
                            </InputGroup>
                          </Col>

                          <Col md={12}>
                            <Button
                              type="submit"
                              className="BtnPurple mt-3 mb-2"
                            >
                              {this.state.loading ? (
                                <>
                                  <i className="fa fa-spinner fa-spin mr5" />
                                  &nbsp;
                                </>
                              ) : null}
                              Forgot Password
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                    </CardBody>
                  </Card>
                </CardGroup>
              </div>
            </Col>
          </Row>

          <div className="login-footer">
            <div className="d-flex justify-content-start flex-column flex-sm-row">
              <span>&copy; SocialAffil 2020.</span>
            </div>

            <span className="powered-by">
              Powered by{" "}
              <a
                href="https://www.logic-square.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Logic Square
              </a>
            </span>
          </div>
        </Container>
      </div>
    );
  }
}

export default ForgotPassword;
