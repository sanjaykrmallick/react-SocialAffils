import React, { Component } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Row,
  Col,
  Input,
  Label,
  FormGroup,
  Form,
  Card,
  CardBody,
  ListGroup,
  ListGroupItem,
  TabContent,
  TabPane,
} from "reactstrap";
import CopyclipBoard from "../components/copy-clipboard";

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
            Order Details
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col sm="12">
                <Row>
                  <Col sm="12" md="7" lg="7" xl="5">
                    {/* <h3>Order # :-{creatorDetails.name.full}</h3> */}
                    <h4 className=" mt-2 mb-4">Order# {"1234 "}</h4>

                    <Card className="ProfileCard">
                      <CardBody>
                        <h4 className="mb-2 ml-5">Buyer</h4>
                        <ListGroup className="profileInfo">
                          <ListGroupItem>
                            <p>
                              <i className="icon-envelope"></i>
                              Name:
                              <span>
                                <CopyclipBoard
                                  // copiedValue={creatorDetails.email}
                                  fontWeight={600}
                                ></CopyclipBoard>
                              </span>
                            </p>
                          </ListGroupItem>
                          <ListGroupItem>
                            <p>
                              <i className="icon-envelope"></i>
                              Email:
                              <span>
                                <CopyclipBoard
                                  // copiedValue={creatorDetails.email}
                                  fontWeight={600}
                                ></CopyclipBoard>
                              </span>
                            </p>
                          </ListGroupItem>
                          <ListGroupItem>
                            <p>
                              <i className="icon-phone"></i>
                              Phone:
                              <span>
                                {/* {creatorDetails.phone ? (
                                      <CopyclipBoard
                                        copiedValue={parsePhoneNumberFromString(
                                          creatorDetails.phone
                                        ).formatInternational()}
                                        fontWeight={600}
                                      ></CopyclipBoard>
                                    ) : (
                                      "N/A"
                                    )} */}
                              </span>
                            </p>
                          </ListGroupItem>
                        </ListGroup>
                      </CardBody>
                    </Card>
                  </Col>

                  {/* Earning Settings */}
                  <Col sm="12" md="5" xl="4">
                    <Card className="ProfileCard mt-5">
                      <CardBody>
                        <h4 className=" mt-2 mb-4">Affiliate :-{"XYZ "}</h4>
                      </CardBody>
                    </Card>
                  </Col>

                  <Col sm="6" md="7" lg="7" xl="5">
                    <Card className="ProfileCard">
                      <CardBody>
                        <h4 className="text-center mt-2">Address</h4>

                        {/* {creatorDetails.address && (
                              <div className="addressWrap">
                                <p>{creatorDetails.address.street || "N/A"}</p>

                                <Label>City:</Label>
                                <p>{creatorDetails.address.city || "N/A"}</p>

                                <Label>State:</Label>
                                <p>{creatorDetails.address.state || "N/A"}</p>

                                <Label>Zip:</Label>
                                <p>{creatorDetails.address.zip || "N/A"}</p>

                                <Label>Country:</Label>
                                <p>{creatorDetails.address.country || "N/A"}</p>
                              </div>
                            )} */}
                        {/* {!creatorDetails.address && (
                              <div>Address Not Provided</div>
                            )} */}
                      </CardBody>
                    </Card>
                  </Col>

                  <Col sm="6" md="5" xl="3">
                    <Card className="ProfileCard">
                      <CardBody>
                        <h4 className="text-center mt-2">Product</h4>

                        <div className="addressWrap mt-3">
                          {/* <p>
                                    
                                  </p> */}

                          {/* <Label>Invites Avialable:</Label> */}
                          {/* <p>Product Name:-{availableReferrralCount}</p> */}
                          <p>Qty:-{"4"}</p>
                          <p>Amount:-{"4"}</p>

                          {/* <p htmlFor="status">Status</p> */}
                          <Input
                            type="select"
                            id="status"
                            placeholder="Enter"
                            name="status"
                            // value={adminUser.status}
                            // onChange={this._handleOnChange}
                          >
                            <option>Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </Input>

                          <Button
                            type="submit"
                            className="BtnPurple mx-auto d-block"
                            style={{
                              padding: "7px 25px",
                              margin: "30px auto 10px",
                            }}
                            onClick={this._addReferralCount}
                          >
                            Add
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                <Row className="mb-4 justify-content-center">
                  <Col sm={12} md={10} lg={8}>
                    {/* <CreatorFeedList
                          user={creatorDetails}
                          updateRef={(ref) =>
                            (this._updateChildActivites = ref)
                          }
                          {...this.props}
                        /> */}
                  </Col>
                </Row>
              </Col>

              <Col xs="4">
                <p>Status</p>
              </Col>
              <Col xs="4">
                <p>Date</p>
              </Col>
              <Col xs="4">
                <p>Remark</p>
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
            {/* <Button className="BtnPurple" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <i className="fa fa-spinner fa-spin mr5" />
                  &nbsp;
                </>
              ) : null}
              Add User
            </Button> */}
          </ModalFooter>
        </Form>
      </Modal>
    );
  }
}

export default AddAdminModal;
