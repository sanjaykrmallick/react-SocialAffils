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
import {
  createAdmin,
  createSeller,
  editSeller,
  getSellerById,
  uploadImageOnCloudinary,
} from "../http/http-calls";
// import config from '../config/index';
import { ToastsStore } from "react-toasts";
import { showToast, getPhoneNumberFromBrackets } from "../helper-methods";
import { countryCodes } from "../config/country-codes";
import config from "../config";

class AddSellerModal extends Component {
  state = {
    seller: {
      sellerStore: "",
      url: "",
      name: "",
      email: "",
      phone: "",
      countryCode: "+1",
      profilePicture: "",
    },
    errors: {},
    isDirty: {
      sellerStore: false,
      name: false,
      email: false,
      phone: false,
      url: false,
      profilePicture:false,
    },
    loading: false,
  };

  _closeModal = () => {
    let { seller, errors, isDirty } = this.state;
    seller = {
      sellerStore: "",
      name: "",
      email: "",
      phone: "",
      profilePicture: "",
      countryCode: "+1",
      url: "",
    };
    isDirty = {
      sellerStore: false,
      name: false,
      email: false,
      phone: false,
      profilePicture: false,
      url: false,
    };
    errors = {};
    this.setState({ seller, errors, isDirty }, () => {
      console.log(seller, errors);
      this.props.toggle();
    });
  };

  _saveUser = async() => {
    console.log("save user", this.state.seller);
    this.setState({ loading: true });
    let sellerData = {
      name: {
        first: this.state.seller.name.split(" ")[0],
        last: this.state.seller.name.split(" ")[1]
          ? this.state.seller.name.split(" ")[1]
          : " ",
      },
      storeName: this.state.seller.sellerStore,
      email: this.state.seller.email,
      profilePicture: this.state.seller.profilePicture,
      url: this.state.seller.url,
      phoneCountry: this.state.seller.countryCode
        ? countryCodes.find(
            (e) => this.state.seller.countryCode === e.dial_code
          ).code
        : "US",
      phone:
        "(" + this.state.seller.countryCode + ")" + this.state.seller.phone,
    };
    console.log("sellerdatatsdsa: ", sellerData);

    if (this.props.type === "add" && !this.props.data) {
      createSeller(sellerData).then(
        (response) => {
          console.log(response);
          this.setState({ loading: false });
          ToastsStore.success("Seller user added Successfully.", 3000);
          this.props.reloadSellerList();
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
    } else if (this.props.type === "edit" && this.props.data.id) {
      editSeller(sellerData, this.props.data.id).then(
        (response) => {
          console.log(response);
          this.setState({ loading: false });
          ToastsStore.success("Seller user updated Successfully.", 3000);
          this.props.reloadSellerList();
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
  };

  _handleOnChange = ({ currentTarget }) => {
    console.log(currentTarget);
    const { seller, isDirty } = this.state;
    seller[currentTarget.name] = currentTarget.value;
    isDirty[currentTarget.name] = true;
    this.setState({ seller });
    this._validateForm();
  };

  /**
   * To handle submit of the form and validate it
   */
  _handleOnSubmit = (event) => {
    event.preventDefault();
    const { isDirty } = this.state;
    isDirty.sellerStore = true;
    isDirty.name = true;
    isDirty.email = true;
    isDirty.phone = true;
    isDirty.url = true;
    isDirty.profilePicture = true;
    this.setState({ isDirty });
    console.log(this.state.isDirty);
    let errors = this._validateForm();
    console.log(errors);
    if (!errors) {
      console.log("Make API call");
      this._saveUser();
    }
    // console.log(this.state.seller);
  };

  /**
   * To Validate the form and show the error messages
   */
  _validateForm() {
    const { seller, errors, isDirty } = this.state;
    // console.log(seller, isDirty);
    Object.keys(seller).forEach((each) => {
      if (each === "email" && isDirty.email) {
        if (!seller.email.trim().length) {
          errors.email = "Email is Required";
        } else if (
          seller.email.trim().length &&
          !new RegExp(
            "^[a-zA-Z0-9]{1}[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,3}$"
          ).test(seller.email)
        ) {
          errors.email = "Please enter valid Email";
        } else {
          delete errors[each];
          isDirty.email = false;
        }
      } else if (each === "sellerStore" && isDirty.name) {
        if (!seller.sellerStore.trim().length) {
          // console.log(admin.password);
          errors[each] = "Seller Store is Required";
        } else {
          delete errors[each];
          isDirty.sellerStore = false;
        }
      } else if (each === "name" && isDirty.name) {
        if (!seller.name.trim().length) {
          // console.log(admin.password);
          errors[each] = "Name is Required";
        } else {
          delete errors[each];
          isDirty.name = false;
        }
      } else if (each === "phone" && isDirty.phone) {
        if (!seller.phone.trim().length) {
          // console.log(admin.password);
          errors[each] = "Phone is Required";
        } else if (
          !config.regexConfig.phone.test(String(seller.phone).toLowerCase())
        ) {
          errors[each] = "Enter valid phone number";
        } else {
          delete errors[each];
          isDirty.phone = false;
        }
      } else if (each === "profilePicture" && isDirty.profilePicture) {
        if (!seller.profilePicture.length) {
          errors[each] = "Logo is Required";
        } else {
          delete errors[each];
          isDirty.profilePicture = false;
        }
      } else if (each === "url" && isDirty.url) {
        if (!seller.url.trim().length) {
          errors[each] = "Website Link is Required";
        } else {
          delete errors[each];
          isDirty.url = false;
        }
      }
    });
    console.log(errors);
    this.setState({ errors });
    return Object.keys(errors).length ? errors : null;
  }

  _updateCountryCode = (value) => {
    const { seller } = this.state;
    seller["countryCode"] = value;
    this.setState({ seller });
  };

  _getSellerById = (id) => {
    this.setState({ loading: true });

    getSellerById(id)
      .then((res) => {
        console.log("api res: ", res);
        let { seller } = res;
        seller.name = seller.name.full;
        seller.phone =
          seller.phone && seller.phone !== "-"
            ? getPhoneNumberFromBrackets(seller.phone)
            : "-";

        seller.profilePicture = seller.profilePicture
          ? seller.profilePicture
          : "";

        if (seller.phoneCountry) {
          seller["countryCode"] = countryCodes.find(
            (e) => seller.phoneCountry === e.code
          ).dial_code;
        }

        this.setState({ seller: seller, loading: false });
      })
      .catch((error) => {
        console.log("api error: ", error);

        this.setState({ loading: false });
        this._closeModal();
        showToast(
          error.reason && error.reason.length
            ? error.reason
            : "Server error. Try again after sometime.",
          "error"
        );
      });
  };

  componentDidUpdate(previousProps, previousState) {
    // console.log('previousProps :', previousProps, this.props);
    if (this.props.data && previousProps.isOpen !== this.props.isOpen) {
      console.log("object :", this.props.data);
      if (this.props.type !== "add" && this.props.data && this.props.data.id) {
        // let {
        //   sellerStore,
        //   url,
        //   name,
        //   email,
        //   phone,
        //   countryCode,
        // } = this.state.seller;
        this._getSellerById(this.props.data.id);
        this.setState({ seller: this.props.data });
      } else if (this.props.type === "add") {
        console.log("here in add mode :");

        this._resetForm();
      }
    } else if (!this.props.data && previousProps.isOpen !== this.props.isOpen) {
      this._resetForm();
    }
  }
  _handleOnChangeProfilePic = (img) => {
    if (img) {
      const outsideThis = this;
      const { seller, isDirty } = this.state;
      seller.profilePicture = img;
      isDirty.profilePicture = true;

      var reader = new FileReader();
      reader.onload = function (event) {
        // console.log(event.target.result)
        seller.profilePicture = event.target.result;
        outsideThis.setState({ seller, isDirty });
        outsideThis._validateForm();
      };
      reader.readAsDataURL(img);
    }
  };
  _resetForm = () => {
    let seller = {
      sellerStore: "",
      url: "",
      name: "",
      email: "",
      phone: "",
      countryCode: "+1",
    };
    this.setState({ seller });
  };
  render() {
    let { seller, loading } = this.state;
    console.log(this.props);
    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={() => this._closeModal()}
        className='modal-dialog-centered'>
        <Form onSubmit={this._handleOnSubmit} noValidate>
          {this.props.type === "add" ? (
            <ModalHeader toggle={() => this._closeModal()}>
              Add Seller
            </ModalHeader>
          ) : (
            <ModalHeader toggle={() => this._closeModal()}>
              Seller Details
            </ModalHeader>
          )}
          <ModalBody>
            <Row>
              <Col xs='9'>
                <FormGroup className='px-3'>
                  <Label htmlFor='name'>Seller Store</Label>
                  <Input
                    type='text'
                    id='sellerStore'
                    placeholder='Enter'
                    name='sellerStore'
                    value={seller.sellerStore}
                    onChange={this._handleOnChange}
                    className={
                      this.state.errors && this.state.errors.sellerStore
                        ? "validation-error"
                        : ""
                    }
                  />
                  {this.state.errors && (
                    <div className='validation-error'>
                      {this.state.errors.sellerStore}
                    </div>
                  )}
                </FormGroup>
                <FormGroup className='px-3'>
                  <Label htmlFor='name'>Website</Label>
                  <Input
                    type='text'
                    id='url'
                    placeholder='Enter'
                    name='url'
                    value={seller.url}
                    onChange={this._handleOnChange}
                    className={
                      this.state.errors && this.state.errors.url
                        ? "validation-error"
                        : ""
                    }
                  />
                  {this.state.errors && (
                    <div className='validation-error'>
                      {this.state.errors.url}
                    </div>
                  )}
                </FormGroup>
              </Col>
              <Col xs='3'>
                <Label className='uploadBtnProfile'>
                  <input
                    type='file'
                    accept='image/jpeg, image/png'
                    value=''
                    style={{ display: "none" }}
                    onChange={(e) =>
                      this._handleOnChangeProfilePic(e.target.files[0])
                    }
                  />
                  {seller.profilePicture ? (
                    <img
                      alt='profilePic'
                      className=''
                      src={seller.profilePicture}
                      style={{width: "95%"}}
                    />
                  ) : (
                    <img
                      alt='defaultPic'
                      className=''
                      src={require("../assets/img/avatar-user.png")}
                      style={{width: "95%"}}
                    />
                  )}
                  <i className='fa fa-pencil uploadIcon'></i>
                </Label>
                {this.state.errors && (
                  <div className='validation-error mt-n1'>
                    {this.state.errors.profilePicture}
                  </div>
                )}
              </Col>
              <Col xs='12'>
                <FormGroup className='px-3'>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    type='text'
                    id='name'
                    placeholder='Enter'
                    name='name'
                    value={seller.name}
                    onChange={this._handleOnChange}
                    className={
                      this.state.errors && this.state.errors.name
                        ? "validation-error"
                        : ""
                    }
                  />
                  {this.state.errors && (
                    <div className='validation-error'>
                      {this.state.errors.name}
                    </div>
                  )}
                </FormGroup>
                <FormGroup className='px-3'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    type='email'
                    id='email'
                    placeholder='Enter'
                    name='email'
                    value={seller.email}
                    onChange={this._handleOnChange}
                    className={
                      this.state.errors && this.state.errors.email
                        ? "validation-error"
                        : ""
                    }
                  />
                  {this.state.errors && (
                    <div className='validation-error'>
                      {this.state.errors.email}
                    </div>
                  )}
                </FormGroup>
                <FormGroup className='px-3'>
                  <Label htmlFor='phone'>Phone</Label>
                  <div style={{ display: "flex" }}>
                    <Input
                      type='select'
                      name='selectCountryCode'
                      id='selectCountryCode'
                      onChange={(e) => this._updateCountryCode(e.target.value)}
                      value={seller.countryCode}
                      style={{ maxWidth: "105px", padding: "4px" }}>
                      {countryCodes.map((countryCode, countryIndex) => (
                        <option
                          key={countryIndex}
                          value={countryCode.dial_code}>
                          {countryCode.code} ({countryCode.dial_code})
                        </option>
                      ))}
                    </Input>
                    <Input
                      type='text'
                      id='phone'
                      placeholder='Enter'
                      name='phone'
                      value={seller.phone}
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
                    <div className='validation-error'>
                      {this.state.errors.phone}
                    </div>
                  )}
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button
              color='dark'
              outline
              type='button'
              className='btn-pill'
              onClick={() => this._closeModal()}>
              Cancel
            </Button>
            {this.props.type == "add" ? (
              <Button className='BtnPurple' type='submit' disabled={loading}>
                {loading ? (
                  <>
                    <i className='fa fa-spinner fa-spin mr5' />
                    &nbsp;
                  </>
                ) : null}
                Add Seller
              </Button>
            ) : (
              <Button className='BtnPurple' type='submit' disabled={loading}>
                {loading ? (
                  <>
                    <i className='fa fa-spinner fa-spin mr5' />
                    &nbsp;
                  </>
                ) : null}
                Update Seller
              </Button>
            )}
          </ModalFooter>
        </Form>
      </Modal>
    );
  }
}

export default AddSellerModal;
