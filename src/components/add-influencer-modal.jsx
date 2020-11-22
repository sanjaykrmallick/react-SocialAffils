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
  uploadImageOnCloudinary,
  createInfluencer,
  getInfluencerById,
  editInfluencer,
} from "../http/http-calls";
// import config from '../config/index';
import { ToastsStore } from "react-toasts";
import { showToast, getPhoneNumberFromBrackets } from "../helper-methods";
import { countryCodes } from "../config/country-codes";
import config from "../config";

class AddInfluencerModal extends Component {
  state = {
    influencer: {
      name: "",
      email: "",
      phone: "",
      countryCode: "+1",
      product: "",
      profileLink: "",
      // commission: "",
      sales: "",
      profilePicture: "",
    },
    errors: {},
    isDirty: {
      name: false,
      email: false,
      phone: false,
      profilePicture: false,
      profileLink: false,
    },
    loading: false,
  };

  _closeModal = () => {
    let { influencer, errors, isDirty } = this.state;
    influencer = {
      name: "",
      email: "",
      phone: "",
      countryCode: "+1",
      product: "",
      profileLink: "",
      // commission: "",
      sales: "",
      profilePicture: "",
    };
    isDirty = {
      name: false,
      email: false,
      phone: false,
      profilePicture: false,
      profileLink: false,
    };
    errors = {};
    this.setState({ influencer, errors, isDirty }, () => {
      console.log(influencer, errors);
      this.props.toggle();
    });
  };

  _saveUser = async () => {
    console.log("save user", this.state.influencer);
    this.setState({ loading: true });
    let Influencerdata = {
      name: {
        first: this.state.influencer.name.split(" ")[0],
        last: this.state.influencer.name.split(" ")[1]
          ? this.state.influencer.name.split(" ")[1]
          : " ",
      },
      email: this.state.influencer.email,
      url: this.state.influencer.profileLink,
      profileLink: this.state.influencer.profileLink,

      profilePicture: this.state.influencer.profilePicture,
      phoneCountry: this.state.influencer.countryCode
        ? countryCodes.find(
            (e) => this.state.influencer.countryCode === e.dial_code
          ).code
        : "US",
      phone:
        "(" +
        this.state.influencer.countryCode +
        ")" +
        this.state.influencer.phone,
    };
    // if (this.state.influencer.profilePicture) {
    //   const formData = new FormData();
    //   formData.append("file", this.state.influencer.profilePictureObj);
    //   const uploadImgRes = await uploadImageOnCloudinary(formData);
    //   console.log("uploadImgRes: ", uploadImgRes);
    //   if (uploadImgRes && uploadImgRes.url) {
    //     this.state.influencerDetails.profilePicture = uploadImgRes.url;
    //   } else {
    //     ToastsStore.error("Somthing went wrong, Try again!", 3000);
    //     this._closeModal();
    //     return;
    //   }
    // }
    if (this.props.type === "add" && !this.props.data) {
      createInfluencer(Influencerdata).then(
        (response) => {
          console.log(response);
          this.setState({ loading: false });
          ToastsStore.success("Influencer user added Successfully.", 3000);
          this.props.reloadInfluencerList();
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
      editInfluencer(Influencerdata, this.props.data.id).then(
        (response) => {
          console.log(response);
          this.setState({ loading: false });
          ToastsStore.success("Influencer user updated Successfully.", 3000);
          this.props.reloadInfluencerList();
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
    } else {
      ToastsStore.error("Somthing went wrong, Try again!", 3000);
      this._closeModal();
    }
  };

  _handleOnChange = ({ currentTarget }) => {
    // console.log(currentTarget);
    const { influencer, isDirty } = this.state;
    influencer[currentTarget.name] = currentTarget.value;
    isDirty[currentTarget.name] = true;
    this.setState({ influencer });
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
    isDirty.profileLink = true;
    this.setState({ isDirty });
    console.log(this.state.isDirty);
    let errors = this._validateForm();
    console.log(errors);
    if (!errors) {
      console.log("Make API call");
      this._saveUser();
    }
    console.log(this.state.influencer);
  };

  /**
   * To Validate the form and show the error messages
   */
  _validateForm() {
    const { influencer, errors, isDirty } = this.state;
    // console.log(influencer, isDirty);
    Object.keys(influencer).forEach((each) => {
      if (each === "email" && isDirty.email) {
        if (!influencer.email.trim().length) {
          errors.email = "Email is Required";
        } else if (
          influencer.email.trim().length &&
          !new RegExp(
            "^[a-zA-Z0-9]{1}[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,3}$"
          ).test(influencer.email)
        ) {
          errors.email = "Please enter valid Email";
        } else {
          delete errors[each];
          isDirty.email = false;
        }
      } else if (each === "name" && isDirty.name) {
        if (!influencer.name.trim().length) {
          // console.log(admin.password);
          errors[each] = "Name is Required";
        } else {
          delete errors[each];
          isDirty.name = false;
        }
      } else if (each === "phone" && isDirty.phone) {
        if (!influencer.phone.trim().length) {
          // console.log(admin.password);
          errors[each] = "Phone is Required";
        } else if (
          !config.regexConfig.phone.test(String(influencer.phone).toLowerCase())
        ) {
          errors[each] = "Enter valid phone number";
        } else {
          delete errors[each];
          isDirty.phone = false;
        }
      } else if (each === "profileLink" && isDirty.profileLink) {
        if (!influencer.profileLink.trim().length) {
          // console.log(admin.password);
          errors[each] = "ProfileLink is Required";
        } else if (
          !new RegExp(config.regexConfig.profileLink).test(
            String(influencer.profileLink).toLowerCase()
          )
        ) {
          errors[each] = "Enter valid Profile Link, i.e. https://facebook.com";
        } else {
          delete errors[each];
          isDirty.profileLink = false;
        }
      }
      else if (each === "profilePicture" && isDirty.profilePicture) {
        if (!influencer.profileLink.trim().length) {
          // console.log(admin.password);
          errors[each] = "profilePicture is Required";
        } else {
          delete errors[each];
          isDirty.profilePicture = false;
        }
      }
    });
    console.log(errors);
    this.setState({ errors });
    return Object.keys(errors).length ? errors : null;
  }

  _updateCountryCode = (value) => {
    const { influencer } = this.state;
    influencer["countryCode"] = value;
    this.setState({ influencer });
  };

  componentDidUpdate(previousProps, previousState) {
    const { data, isOpen, type } = this.props;
    // influencer: {
    //   name: "",
    //   email: "",
    //   phone: "",
    //   countryCode: "+1",
    //   product: "",
    //   profileLink: "",
    //   commission: "",
    //   sales: "",
    // },
    // console.log('previousProps :', previousProps, this.props);
    if (this.props.data && previousProps.isOpen !== this.props.isOpen) {
      console.log("object :", this.props.data);
      // if (this.props.type !== "add" && this.props.data) {
      //   let { influencer } = this.state;
      //   influencer.name = this.props.data.name;
      //   influencer.email = this.props.data.email;
      //   influencer.phone = this.props.data.phone;
      //   influencer.product = this.props.data.product;
      //   influencer.profileLink = this.props.data.profileLink;
      //   influencer.commission = this.props.data.commission;
      //   influencer.sales = this.props.data.sales;

      //   this.setState({ influencer });
      // }

      if (data && previousProps.isOpen !== isOpen) {
        console.log("object :", data);
        if (type !== "add" && data && data.id) {
          this._getInfluencerById(data.id);
        } else if (this.props.type === "add") {
          console.log("here in add mode :");
          this._resetForm();
        }
      } else if (
        !this.props.data &&
        previousProps.isOpen !== this.props.isOpen
      ) {
        this._resetForm();
      }
    }
  }

  _updateCountryCode = (value) => {
    const { influencer } = this.state;
    influencer["countryCode"] = value;
    this.setState({ influencer });
  };

  _getInfluencerById = (id) => {
    this.setState({ loading: true });

    getInfluencerById(id)
      .then((res) => {
        console.log("api res: ", res);

        let { influencer } = res;
        influencer.name = influencer.name.full;
        influencer.phone =
          influencer.phone && influencer.phone !== "-"
            ? getPhoneNumberFromBrackets(influencer.phone)
            : "-";

        influencer.profilePicture = influencer.profilePicture
          ? influencer.profilePicture
          : "";
        influencer.profilePictureObj = null;

        influencer.sales = influencer.totalEarned;
        influencer.product = influencer.productCount;

        influencer.profileLink = influencer.url ? influencer.url : "";

        if (influencer.phoneCountry) {
          influencer["countryCode"] = countryCodes.find(
            (e) => influencer.phoneCountry === e.code
          ).dial_code;
        }

        this.setState({ influencer: influencer, loading: false });
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


  _handleOnChangeProfilePic=(img)=>{
    if (img) {
      const outsideThis = this;
      const { influencer, isDirty } = this.state;
      influencer.profilePicture = img;
      isDirty.profilePicture = true;

      var reader = new FileReader();
      reader.onload = function (event) {
        // console.log(event.target.result)
        influencer.profilePicture = event.target.result;
        outsideThis.setState({ influencer, isDirty });
        outsideThis._validateForm();
      };
      reader.readAsDataURL(img);
    }
  }

  _makeModalHeader = () => {
    switch (this.props.type) {
      case "add":
        return "Add Influencer";
      case "edit":
        return "Edit Influencer";
      case "view":
        return "Influencer Details";
        break;
      default:
      // code block
    }
  };
  _resetForm = () => {
    let influencer = {
      name: "",
      email: "",
      phone: "",
      countryCode: "+1",
      product: "",
      profileLink: "",
      commission: "",
      sales: "",
    };

    this.setState({ influencer });
  };
  render() {
    let { influencer, loading } = this.state;
    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={() => this._closeModal()}
        className='modal-dialog-centered'>
        <Form onSubmit={this._handleOnSubmit} noValidate>
          <ModalHeader toggle={() => this._closeModal()}>
            {/* Add Influencer */}
            {this._makeModalHeader()}
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col xs='9'>
                <FormGroup className='px-3'>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    type='text'
                    id='name'
                    placeholder='Enter'
                    name='name'
                    value={influencer.name}
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
                    type='text'
                    id='email'
                    placeholder='Enter'
                    name='email'
                    value={influencer.email}
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
                  {influencer.profilePicture ? (
                    <img
                      alt='profilePic'
                      className=''
                      src={influencer.profilePicture}
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
                  <Label htmlFor='phone'>Phone</Label>
                  <div style={{ display: "flex" }}>
                    <Input
                      type='select'
                      name='selectCountryCode'
                      id='selectCountryCode'
                      onChange={(e) => this._updateCountryCode(e.target.value)}
                      value={influencer.countryCode.value}
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
                      value={influencer.phone}
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
                <FormGroup className='px-3'>
                  <Label htmlFor='profileLink'>Profile Link</Label>
                  <Input
                    type='text'
                    id='profileLink'
                    placeholder='Enter'
                    name='profileLink'
                    value={influencer.profileLink}
                    onChange={this._handleOnChange}
                    className={
                      this.state.errors && this.state.errors.profileLink
                        ? "validation-error"
                        : ""
                    }
                  />
                  {this.state.errors && (
                    <div className='validation-error'>
                      {this.state.errors.profileLink}
                    </div>
                  )}
                </FormGroup>{" "}
              </Col>
              {this.props.type !== "add" ? (
                <>
                  {" "}
                  <FormGroup className='px-3'>
                    <Label htmlFor='product'>Product</Label>
                    {/* <Input
                      type="text"
                      id="product"
                      placeholder="Enter"
                      name="product"
                      value={influencer.product}
                      onChange={this._handleOnChange}
                      disabled={loading}
                    /> */}
                    {/* <p>{influencer.product}</p> */}
                    <p>20</p>
                  </FormGroup>
                  <FormGroup className='px-3'>
                    <Label htmlFor='commission'>Commission</Label>
                    <Input
                      type='Number'
                      id='commission'
                      placeholder='Enter'
                      name='commission'
                      value={influencer.commission}
                      onChange={this._handleOnChange}
                      className={
                        this.state.errors && this.state.errors.commission
                          ? "validation-error"
                          : ""
                      }
                    />
                    {this.state.errors && (
                      <div className='validation-error'>
                        {this.state.errors.commission}
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup className='px-3'>
                    <Label htmlFor='sales'>Sales</Label>
                    {/* <Input
                      type="Number"
                      id="sales"
                      placeholder="Enter"
                      name="sales"
                      value={influencer.sales}
                      onChange={this._handleOnChange}
                      disabled={loading}
                    /> */}
                    <p>{influencer.sales}</p>
                  </FormGroup>
                </>
              ) : null}
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
                Add Influencer
              </Button>
            ) : this.props.type == "edit" ? (
              <Button className='BtnPurple' type='submit' disabled={loading}>
                {loading ? (
                  <>
                    <i className='fa fa-spinner fa-spin mr5' />
                    &nbsp;
                  </>
                ) : null}
                Update Influencer
              </Button>
            ) : null}
          </ModalFooter>
        </Form>
      </Modal>
    );
  }
}

export default AddInfluencerModal;
