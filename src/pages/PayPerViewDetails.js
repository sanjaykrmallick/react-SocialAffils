import React, { Component } from "react";
import { ToastsStore } from "react-toasts";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  ListGroup,
  ListGroupItem,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import CreatorFeedList from "../components/creator-feed-list";
import ReferralsListModal from "../components/referrals-list-modal";
import SubscriberListModal from "../components/subscriber-list-modal";
import CopyclipBoard from "../components/copy-clipboard";
import config from "../config/index";
import {
  changeUserStatus,
  getCreatorDetails,
  updateInfluencerDetails,
  getPPVDetails,
} from "../http/http-calls";
import { deepClone, showToast } from "../helper-methods";
import { Link } from "react-router-dom";
import moment from "moment";
import ReadMoreAndLess from "react-read-more-less";

class PayPerViewDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      platformShare: 0,
      isAdditionError: false,
      isInitial: true,
      isFormValid: false,
      idCardUrl: null,
      holdingIDCardUrl: null,
      formFields: {
        referPercentage: {
          value: "",
          isValid: false,
          isDirty: false,
          isRequired: true,
          isTyped: false,
        },
        earningPercentage: {
          value: "",
          isValid: false,
          isDirty: false,
          isRequired: true,
          isTyped: false,
        },
      },
      subscriberModal: {
        isOpen: false,
        data: null,
      },
      referralsModal: {
        isOpen: false,
        data: null,
      },
      activeTab: new Array(2).fill("1"),
      creatorDetails: null,
      loading: {
        loadingData: false,
        changeStatusLoading: false,
      },
      payperview: {
        _influencer: {},
      },
      transactions: [],
      availableReferrralCount: 0,
      additionalReferralCount: 0,
    };
  }

  componentDidMount() {
    this._manageLoading("data", true);
    this._getPPVDetails(this.props.match.params.id);
  }

  _getPPVDetails = (id) => {
    this._manageLoading("data", true);
    getPPVDetails(id).then(
      (response) => {
        const { payperview, transactions } = response;
        console.log("response", response);
        this.setState(
          {
            payperview,
            transactions,
          },
          () => {
            this._manageLoading("data", false);
          }
        );
      },
      (error) => {
        console.log(error);
        this._manageLoading("data", false);
      }
    );
  };

  toggle(tabPane, tab) {
    const newArray = this.state.activeTab.slice();
    newArray[tabPane] = tab;
    this.setState(
      {
        activeTab: newArray,
      },
      () => {
        if (Number(tab) === 2) {
          this._updateChildActivites();
        }
      }
    );
  }

  _onToggleReferralsModal = (creator) => {
    let { referralsModal } = JSON.parse(JSON.stringify(this.state));
    referralsModal.isOpen = !referralsModal.isOpen;
    if (referralsModal.isOpen) {
      creator.referrals = creator._invitations;
    }
    referralsModal.data = creator;
    this.setState(
      {
        referralsModal,
      },
      () => {
        console.log(this.state);
      }
    );
  };

  _onToggleSubscriberModal = (creator) => {
    let { subscriberModal } = JSON.parse(JSON.stringify(this.state));
    subscriberModal.isOpen = !subscriberModal.isOpen;
    if (subscriberModal.isOpen) {
      creator.subscribers = creator._subscriptions;
    }
    subscriberModal.data = creator;
    this.setState(
      {
        subscriberModal,
      },
      () => {
        console.log(this.state);
      }
    );
  };

  _goBack = () => {
    // this.props.history.push("/creators");
    this.props.history.goBack();
  };

  _manageLoading = (key, value) => {
    let { loadingData, changeStatusLoading } = this.state.loading;
    if (key === "data") {
      loadingData = value;
    } else if (key === "change-status") {
      changeStatusLoading = value;
    }
    this.setState({ loading: { loadingData, changeStatusLoading } });
  };

  _onStatusUpdate = () => {
    let { creatorDetails } = this.state;
    creatorDetails.status =
      creatorDetails.status === "Active" ? "Inactive" : "Active";
    this.setState({
      creatorDetails,
    });
    this._manageLoading("change-status", true);
    changeUserStatus(creatorDetails.id).then(
      (response) => {
        console.log(response);
        this._manageLoading("change-status", false);
        ToastsStore.success("Status changed Successfully!", 3000);
      },
      (error) => {
        console.log(error);
        this._manageLoading("change-status", false);
        // ToastsStore.error(error.reason, 3000);
        showToast(
          error.reason && error.reason.length
            ? error.reason
            : "Server error. Try again after sometime.",
          "error"
        );
      }
    );
  };

  _markAsDirty = (fieldName) => {
    const { formFields } = deepClone(this.state);
    formFields[fieldName].isDirty = true;
    formFields[fieldName].isTyped = true;

    this.setState({ formFields }, () => {
      this._validateForm();
    });
  };

  _updateFieldValue = (fieldName, value) => {
    const { formFields } = deepClone(this.state);
    if (fieldName === "referPercentage" || fieldName === "earningPercentage") {
      // Check if contains valid number
      if (!isNaN(Number(value))) {
        const inputParts = value.split(".");
        if (inputParts.length === 2) {
          // Has decimals
          if (inputParts[1].length > 2) {
            return;
          }
        }
      }
    }

    formFields[fieldName].value = value;
    this.setState({ formFields }, () => {
      if (formFields[fieldName].isDirty) {
        // Validate
        this._validateForm();
      }
    });
  };

  _validateForm = () => {
    return new Promise((resolve) => {
      const { formFields, platformShare } = deepClone(this.state);
      let isFormValid = true;
      Object.keys(formFields).forEach((fieldName, index) => {
        if (formFields[fieldName]["isTyped"]) {
          switch (fieldName) {
            case "referPercentage":
            case "earningPercentage": {
              if (
                String(formFields[fieldName].value).length &&
                !isNaN(Number(formFields[fieldName].value)) &&
                Number(formFields[fieldName].value) >= 0 &&
                Math.ceil(formFields[fieldName].value) <= 100
              ) {
                formFields[fieldName].isValid = true;
              } else {
                formFields[fieldName].isValid = false;
                isFormValid = false;
              }
              break;
              // if (
              //   formFields[fieldName]["isRequired"] &&
              //   formFields[fieldName].value.length
              // ) {
              //   if (
              //     config.regexConfig.digitOnly.test(
              //       String(formFields[fieldName].value).toLowerCase()
              //     )
              //   ) {
              //     if (
              //       Number(formFields[fieldName].value) >= 0 &&
              //       Number(formFields[fieldName].value) < 100
              //     ) {
              //       formFields[fieldName].isValid = true;
              //     } else {
              //       formFields[fieldName].isValid = false;
              //       isFormValid = false;
              //     }
              //   } else {
              //     formFields[fieldName].isValid = false;
              //     isFormValid = false;
              //   }
              // } else {
              //   formFields[fieldName].isValid = false;
              //   isFormValid = false;
              // }
              // break;
            }

            default: {
              break;
            }
          }
        }
      });
      this.setState(
        {
          formFields,
          isFormValid,
        },
        () => {
          resolve();
        }
      );
      // this.setState(
      //   {
      //     formFields
      //   },
      //   async () => {
      //     await this._calculatePlatformShare();
      //     this.setState(
      //       {
      //         isFormValid: !isFormValid
      //           ? isFormValid
      //           : platformShare < 0
      //           ? false
      //           : true
      //       },
      //       () => {
      //         resolve();
      //       }
      //     );
      //   }
      // );
    });
  };

  _makeAllFieldDirty = () => {
    return new Promise((resolve) => {
      const { formFields } = deepClone(this.state);
      Object.keys(formFields).forEach((fieldName, index) => {
        formFields[fieldName].isDirty = true;
      });
      this.setState({ formFields }, () => {
        resolve();
      });
    });
  };

  _validateAndSubmit = async (e) => {
    e.preventDefault();
    await this._makeAllFieldDirty();
    await this._validateForm();
    const { formFields, isFormValid } = this.state;
    if (isFormValid) {
      // form is valid
      console.log("valid");
      this._updateShareSettings();
    } else {
      // form is not valid
      console.log("not valid");
    }
  };

  _updateShareSettings = () => {
    const { formFields, creatorDetails } = deepClone(this.state);
    updateInfluencerDetails(creatorDetails.id, {
      earningPercentage: Number(formFields.earningPercentage.value),
      referPercentage: Number(formFields.referPercentage.value),
    })
      .then((response) => {
        this._manageLoading("change-status", false);
        ToastsStore.success("Updated Successfully!", 3000);
      })
      .catch((error) => {
        this._manageLoading("change-status", false);
        // ToastsStore.error(error.reason, 3000);
        showToast(
          error.reason && error.reason.length
            ? error.reason
            : "Server error. Try again after sometime.",
          "error"
        );
      });
  };

  _calculatePlatformShare = () => {
    return new Promise((resolve) => {
      const { formFields, isInitial } = deepClone(this.state);
      this.setState(
        {
          platformShare:
            100 -
            (Number(formFields.referPercentage.value || 0) +
              Number(formFields.earningPercentage.value || 0)),
          isInitial: false,
        },
        () => {
          resolve();
        }
      );
    });

    // if (
    //   isInitial ||
    //   (formFields.referPercentage.value.length &&
    //     formFields.earningPercentage.value.length)
    // ) {
    //   this.setState({
    //     platformShare:
    //       100 -
    //       (Number(formFields.referPercentage.value || 0) +
    //         Number(formFields.earningPercentage.value || 0)),
    //     isInitial: false
    //   });
    // }
  };

  _getFilteredData = (
    arr,
    requiredAttr,
    searchingAttr,
    searchingValue,
    defaultReturnValue = null
  ) => {
    const filteredArr = arr.filter((item) => {
      return (
        item.hasOwnProperty(searchingAttr) &&
        item[searchingAttr] === searchingValue
      );
    });
    if (filteredArr.length && filteredArr[0].hasOwnProperty(requiredAttr)) {
      return filteredArr[0][requiredAttr];
    } else {
      return defaultReturnValue;
    }
  };

  _formatSocialUrl = (url) => {
    if (url && url.length) {
      if (url.indexOf("http") > -1 || url.indexOf("https") > -1) {
        return url;
      } else {
        url = "https://" + url;
        return url;
      }
    }
  };

  _changeReferralCount = (isIncrease = true) => {
    console.log("_changeReferralCount -> isIncrease", isIncrease);
    let { additionalReferralCount } = deepClone(this.state);

    if (isIncrease && additionalReferralCount >= 0) {
      additionalReferralCount++;
    } else if (!isIncrease && additionalReferralCount > 0) {
      additionalReferralCount--;
    }
    this.setState({
      additionalReferralCount,
    });
  };

  _addReferralCount = () => {
    let {
      creatorDetails,
      availableReferrralCount,
      additionalReferralCount,
    } = deepClone(this.state);
    if (additionalReferralCount <= 0) {
      return;
    }
    this._manageLoading("change-status", true);
    availableReferrralCount =
      Number(availableReferrralCount) + Number(additionalReferralCount);
    updateInfluencerDetails(creatorDetails.id, {
      referralCount: availableReferrralCount,
    })
      .then((response) => {
        this.setState({ availableReferrralCount, additionalReferralCount: 0 });
        this._manageLoading("change-status", false);
        ToastsStore.success("Updated Successfully!", 3000);
      })
      .catch((error) => {
        this._manageLoading("change-status", false);
        // ToastsStore.error(error.reason, 3000);
        showToast(
          error.reason && error.reason.length
            ? error.reason
            : "Server error. Try again after sometime.",
          "error"
        );
      });
  };

  _redirectToSubscriberView = (subscriber) => {
    this.props.history.push("/subscriber-view/" + subscriber._id);
  };

  render() {
    let {
      payperview,
      payperview: { _influencer: influencer },
      transactions,
      loading,
    } = this.state;
    return (
      <div className="app TruFansPgBg animated fadeIn">
        <Container>
          <div className="events-view">
            <div className="PgTitle mb-5">
              <div className="d-flex justify-content-start align-items-center">
                {/* on clicking the below btn, it should take back user to creators page */}
                <Button
                  color="ghost-dark"
                  className="customBackBtn"
                  onClick={() => this.props.history.push("/pay-per-view")}
                >
                  <i className="fa fa-arrow-left"></i>
                </Button>
                <h2>Back to PPVs</h2>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-4 ">
                <div className="ProfileCard card">
                  <div className="card-header"></div>
                  <div className="align-items-center d-flex flex-column card-body">
                    <div className="profileImgWrap">
                      <img
                        className="profileImg"
                        src={
                          influencer &&
                          influencer.profilePicture &&
                          influencer.profilePicture.length
                            ? influencer.profilePicture
                            : config.defaultUserPicture
                        }
                        alt="Profile Img"
                      />
                    </div>
                    <h4 className="mt-2 mb-2">
                      {influencer && influencer.name && influencer.name.full}
                      &nbsp;
                      <img
                        src={`https://www.countryflags.io/${
                          influencer &&
                          influencer.address &&
                          influencer.address.country
                        }/flat/24.png`}
                        alt="flag"
                      />
                    </h4>
                    <p>
                      Published :{" "}
                      <span>
                        {moment(payperview.scheduledAt).format("LLL")}
                      </span>
                    </p>
                  </div>
                  <div className="card-footer new-card-footer">
                    <p>Price</p>
                    <table className="table new-table">
                      <tr>
                        <th>
                          <img
                            src="../assets/img/price-icon1.png"
                            className="price-icon"
                            alt="Basic Price"
                          />
                        </th>
                        <th>
                          <img
                            src="../assets/img/price-icon2.png"
                            className="price-icon"
                            alt="Plus Price"
                          />
                        </th>
                        <th>
                          <img
                            src="../assets/img/price-icon3.png"
                            className="price-icon"
                            alt="Premium Price"
                          />
                        </th>
                      </tr>
                      <tr>
                        <td>${payperview.price || 0}</td>
                        <td>${payperview.plusPrice || 0}</td>
                        <td>${payperview.premiumPrice || 0}</td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-sm-8">
                <div className="ProfileCard card event-details-card">
                  <div className="card-header">
                    <video
                      width="100%"
                      src={payperview.videoUrl}
                      controls
                      controlsList="nodownload"
                      disablePictureInPicture
                    >
                      {/* <source src={ppv.videoUrl} type="video/mp4" />
                      <source src="movie.ogg" type="video/ogg" />
                      Your browser does not support the video tag. */}
                    </video>
                  </div>
                  <div className="card-body">
                    <h4 className="mt-2 mb-3">
                      <span>Pay per view Name : </span>
                      {payperview.title}
                    </h4>
                    <p>
                      {payperview.description &&
                      payperview.description.length ? (
                        <ReadMoreAndLess
                          className="read-more-content"
                          charLimit={80}
                          readMoreText="Read more"
                          readLessText="Read less"
                        >
                          {payperview.description}
                        </ReadMoreAndLess>
                      ) : null}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12 mt-4">
                <h3 className="mb-4">Viewers</h3>
                <table className="table new-table">
                  <thead>
                    <tr>
                      <th>Subscriber</th>
                      <th>Amount Paid</th>
                      <th>Transaction ID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  {transactions.length ? (
                    <tbody>
                      {transactions.map((item, index) => (
                        <tr key={item.id}>
                          <td>
                            <a href="#">
                              <div className="d-flex justify-content-start align-items-center">
                                <div
                                  className="personImgWrap"
                                  onClick={() =>
                                    this._redirectToSubscriberView(item._from)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  <img
                                    className="personImg"
                                    src={
                                      item._from &&
                                      item._from.profilePicture &&
                                      item._from.profilePicture.length
                                        ? item._from.profilePicture
                                        : config.defaultUserPicture
                                    }
                                    alt="Profile Thumbnail"
                                  />
                                </div>
                                <p
                                  onClick={() =>
                                    this._redirectToSubscriberView(item._from)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  {item._from.name.full}
                                </p>
                              </div>
                            </a>
                          </td>
                          <td>${item.amount || 0}</td>
                          <td>{item.transactionId}</td>
                          <td className="capitalize">{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  ) : (
                    <tbody>
                      <tr>No viewers yet</tr>
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }
}

export default PayPerViewDetails;
