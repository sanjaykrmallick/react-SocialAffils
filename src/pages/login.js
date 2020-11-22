import React, { Component } from "react";
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
} from "reactstrap";
import { ToastsStore } from "react-toasts";
import { login } from "../http/http-calls";
import { showToast } from "../helper-methods";
class Login extends Component {
  state = {
    admin: {
      handle: "",
      password: "",
    },
    errors: {},
    isDirty: {
      handle: false,
      password: false,
    },
    loading: false,
  };
  /**
   * _handleOnChange
   * To handle input on change and set the values to state
   */
  _handleOnChange = ({ currentTarget }) => {
    const { admin, isDirty } = this.state;
    admin[currentTarget.name] = currentTarget.value;
    isDirty[currentTarget.name] = true;
    this.setState({ admin });
    this._validateForm();
  };

  /**
   * To handle submit of the form and validate it
   */
  _handleOnSubmit = (event) => {
    event.preventDefault();
    const { isDirty } = this.state;
    isDirty.handle = true;
    isDirty.password = true;
    this.setState({ isDirty });
    console.log(this.state.isDirty);
    let errors = this._validateForm();
    console.log(errors);
    // this.setState({errors});
    if (!errors) {
      console.log("Make API call");
      this._login();
    }
  };

  /**
   * To Validate the form and show the error messages
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
      } else if (each === "password" && isDirty.password) {
        if (!admin.password.trim().length) {
          // console.log(admin.password);
          errors[each] = "Password is Required";
        } else {
          delete errors[each];
          isDirty.password = false;
        }
      }
    });
    this.setState({ errors });
    return Object.keys(errors).length ? errors : null;
  }

  /**
   * Make login api call and navigate to dashboard after login
   */
  _login = () => {
    let { admin, loading } = this.state;
    loading = true;
    this.setState({ loading });
    login(admin).then(
      (response) => {
        console.log(response);
        localStorage.socialAffilAdminToken = response.token;
        loading = false;
        this.setState({ loading });
        ToastsStore.success("Successfully logged in!", 3000);
        this.props.history.push("/sellers");
      },
      (error) => {
        console.log(error);
        loading = false;
        showToast(
          error.reason && error.reason.length
            ? error.reason
            : "Server error. Try again after sometime.",
          "error"
        );
        this.setState({ loading });
        // ToastsStore.error(error.reason, 1500);
      }
    );
  };

  /**
   * To navigate to Forgot password
   */
  _goToForgotPassword = () => {
    this.props.history.push("forgot-password");
  };

  render() {
    return (
      <div className='app loginPgBg animated fadeIn'>
        <Container>
          <Row className='justify-content-center'>
            <Col md='12'>
              <div className='loginPgContent'>
                <CardGroup>
                  <Card>
                    <CardBody>
                      {/* <img
                        src={"/assets/soomers-logo.png"}
                        alt="True Fanz Logo"
                        className="company-logo mb-4"
                      /> */}
                      <h2>Login</h2>
                      <p
                        style={{
                          color: "#999",
                          letterSpacing: "0.5px",
                          fontSize: "15px",
                        }}>
                        Sign In to your account
                      </p>
                      <Form onSubmit={this._handleOnSubmit} noValidate>
                        <InputGroup
                          className={
                            this.state.errors && this.state.errors.handle
                              ? "mb-3 invalid-input"
                              : "mb-3"
                          }>
                          <InputGroupAddon addonType='prepend'>
                            <InputGroupText>
                              <i className='fa fa-envelope-o'></i>
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input
                            type='email'
                            placeholder='Email'
                            autoComplete='off'
                            name='handle'
                            onChange={this._handleOnChange}
                          />
                          {this.state.errors && (
                            <div className='validation-error'>
                              {this.state.errors.handle}
                            </div>
                          )}
                        </InputGroup>
                        <InputGroup
                          className={
                            this.state.errors && this.state.errors.password
                              ? "mb-2 invalid-input"
                              : "mb2"
                          }>
                          <InputGroupAddon addonType='prepend'>
                            <InputGroupText>
                              <i className='icon-lock-open'></i>
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input
                            type='password'
                            placeholder='Password'
                            autoComplete='off'
                            name='password'
                            onChange={this._handleOnChange}
                            className={
                              this.state.errors && this.state.errors.handle
                                ? "invalid-input"
                                : "valid-input"
                            }
                          />
                          {this.state.errors && (
                            <div className='validation-error'>
                              {this.state.errors.password}
                            </div>
                          )}
                        </InputGroup>
                        <div className='d-flex justify-content-end align-items-center'>
                          <Button
                            type='button'
                            color='link'
                            className='px-0 text-dark'
                            onClick={this._goToForgotPassword}>
                            Forgot Password?
                          </Button>
                        </div>
                        {/* on clicking the login btn, it should take the user to Dashboard page */}
                        <Button
                          type='submit'
                          className={
                            !this.state.admin.handle.trim().length
                              ? "BtnPurpleDisabled"
                              : !this.state.admin.password.trim().length
                              ? "BtnPurpleDisabled"
                              : "BtnPurple"
                          }
                          disabled={
                            !this.state.admin.handle.trim().length
                              ? true
                              : !this.state.admin.password.trim().length
                              ? true
                              : this.state.loading
                          }>
                          {this.state.loading ? (
                            <>
                              <i className='fa fa-spinner fa-spin mr5' />
                              &nbsp;
                            </>
                          ) : null}
                          Login
                        </Button>
                      </Form>
                    </CardBody>
                  </Card>
                </CardGroup>
              </div>
            </Col>
          </Row>

          <div className='login-footer'>
            <div className='d-flex justify-content-start flex-column flex-sm-row'>
              <span>&copy; SocialAffil 2020</span>
            </div>

            <span className='powered-by'>
              Powered by{" "}
              <a
                href='https://www.logic-square.com/'
                target='_blank'
                rel='noopener noreferrer'>
                Logic Square
              </a>
            </span>
          </div>
        </Container>
      </div>
    );
  }
}

export default Login;
