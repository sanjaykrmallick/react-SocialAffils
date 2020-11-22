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
import CreatorFeedList from "../../components/creator-feed-list";
import ReferralsListModal from "../../components/referrals-list-modal";
import SubscriberListModal from "../../components/subscriber-list-modal";
import CopyclipBoard from "../../components/copy-clipboard";
import config from "../../config/index";
import {
  changeUserStatus,
  getCreatorDetails,
  updateInfluencerDetails,
} from "../../http/http-calls";
import { deepClone, showToast } from "../../helper-methods";
import { Link } from "react-router-dom";
import { parsePhoneNumberFromString } from "libphonenumber-js";

class CreatorView extends Component {
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
      availableReferrralCount: 0,
      additionalReferralCount: 0,
      bundles: [],
      selectedMonth: 30,
    };
  }

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

  _getCreatorDetails = (id) => {
    this._manageLoading("data", true);
    getCreatorDetails(id).then(
      (response) => {
        this._manageLoading("data", false);
        let {
          creatorDetails,
          formFields,
          idCardUrl,
          holdingIDCardUrl,
          availableReferrralCount,
          bundles,
          subscriptions,
        } = deepClone(this.state);
        bundles = response.bundles;
        response.influencer.profilePicture =
          response.influencer.profilePicture || config.defaultUserPicture;
        response.influencer.status = response.influencer.isActive
          ? "Active"
          : "Inactive";
        response.influencer.lifeTime = response.influencer._credit
          .reduce((acc, item) => {
            return (acc = acc + item.amountToDestination);
          }, 0)
          .toFixed(2);
        creatorDetails = response.influencer;
        availableReferrralCount = creatorDetails.hasOwnProperty(
          "avaiableReferralCount"
        )
          ? creatorDetails.avaiableReferralCount
          : 0;
        idCardUrl =
          creatorDetails.hasOwnProperty("docs") && creatorDetails.docs.length
            ? this._getFilteredData(
                creatorDetails.docs,
                "url",
                "category",
                "identity proof",
                config.noImageAvialableUrl
              )
            : config.noImageAvialableUrl;
        holdingIDCardUrl =
          creatorDetails.hasOwnProperty("docs") && creatorDetails.docs.length
            ? this._getFilteredData(
                creatorDetails.docs,
                "url",
                "category",
                "holding id card",
                config.noImageAvialableUrl
              )
            : config.noImageAvialableUrl;
        formFields["earningPercentage"].value =
          creatorDetails && creatorDetails.hasOwnProperty("earningPercentage")
            ? creatorDetails.earningPercentage
            : 0;

        formFields["earningPercentage"].isDirty = true;
        formFields["earningPercentage"].isTyped = true;
        formFields["referPercentage"].value =
          creatorDetails && creatorDetails.hasOwnProperty("referPercentage")
            ? creatorDetails.referPercentage
            : 0;
        formFields["referPercentage"].isDirty = true;
        formFields["referPercentage"].isTyped = true;

        this.setState(
          {
            creatorDetails,
            formFields,
            idCardUrl,
            holdingIDCardUrl,
            availableReferrralCount,
            bundles,
          },
          () => {
            console.log("formFields :", formFields);
            this._validateForm();
            this._calculatePlatformShare();
          }
        );
      },
      (error) => {
        console.log(error);
        this._manageLoading("data", false);
      }
    );
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

  componentDidMount() {
    this._getCreatorDetails(this.props.match.params.id);
  }

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

  _renderPriceTable = () => {
    const { bundles, selectedMonth, creatorDetails } = deepClone(this.state);
    let oneMonthSubscriptionFrees;
    let oneMonthBasicSubscriptionFrees = {
      subscriptionPeriod: 30,
      price: creatorDetails.subscriptionFees.amount,
      tier: "basic",
    };

    console.log("bundles", bundles);

    bundles.push(oneMonthBasicSubscriptionFrees);

    if (creatorDetails.hasOwnProperty("plusSubscriptionFees")) {
      oneMonthSubscriptionFrees = {
        subscriptionPeriod: 30,
        price: creatorDetails.plusSubscriptionFees.amount,
        tier: "plus",
      };
      bundles.push(oneMonthSubscriptionFrees);
    }

    if (creatorDetails.hasOwnProperty("premiumSubscriptionFees")) {
      oneMonthSubscriptionFrees = {
        subscriptionPeriod: 30,
        price: creatorDetails.premiumSubscriptionFees.amount,
        tier: "premium",
      };
      bundles.push(oneMonthSubscriptionFrees);
    }

    console.log(bundles);

    let filteredBundles = bundles.filter(
      (bundle) => bundle.subscriptionPeriod === Number(selectedMonth)
    );

    return (
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
          <td>
            $
            {filteredBundles[0] && filteredBundles[0].tier === "basic"
              ? filteredBundles[0].price
              : 0}
          </td>
          <td>
            $
            {filteredBundles[1] && filteredBundles[1].tier === "plus"
              ? filteredBundles[1].price
              : 0}
          </td>
          <td>
            $
            {filteredBundles[2] && filteredBundles[2].tier === "premium"
              ? filteredBundles[2].price
              : 0}
          </td>
        </tr>
      </table>
    );
  };

  _onMonthUpdated = ({ currentTarget }) => {
    let { selectedMonth } = deepClone(this.state);

    console.log(currentTarget.value);

    selectedMonth = currentTarget.value;

    this.setState({ selectedMonth });
  };

  render() {
    let {
      creatorDetails,
      loading,
      formFields,
      platformShare,
      isAdditionError,
      idCardUrl,
      holdingIDCardUrl,
      additionalReferralCount,
      availableReferrralCount,
      selectedMonth,
      bundles
    } = this.state;
    console.log("formFields :", formFields);
    return (
      <div className="app TruFansPgBg animated fadeIn">
        <Container>
          {!loading.loadingData && (
            <Row>
              {creatorDetails && (
                <Col xs="12">
                  <div className="PgTitle">
                    <div className="d-flex justify-content-start align-items-center">
                      {/* on clicking the below btn, it should take back user to creators page */}
                      <Button
                        color="ghost-dark"
                        className="customBackBtn"
                        onClick={this._goBack}
                      >
                        <i className="fa fa-arrow-left"></i>
                      </Button>
                      <h2>{creatorDetails.name.full}</h2>
                    </div>

                    <div className="mr-2">
                      <Input
                        type="select"
                        name="status"
                        id="status"
                        style={{ minWidth: "150px" }}
                        value={creatorDetails.status}
                        onChange={this._onStatusUpdate}
                        disabled={this.state.loading.changeStatusLoading}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </Input>
                    </div>
                  </div>
                </Col>
              )}
              {creatorDetails && (
                <Col sm="12">
                  <Nav tabs className="customTabs--Truefanz">
                    <NavItem>
                      <NavLink
                        active={this.state.activeTab[0] === "1"}
                        onClick={() => {
                          this.toggle(0, "1");
                        }}
                      >
                        Profile
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        active={this.state.activeTab[0] === "2"}
                        onClick={() => {
                          this.toggle(0, "2");
                        }}
                      >
                        Activity
                      </NavLink>
                    </NavItem>
                  </Nav>
                  <TabContent
                    activeTab={this.state.activeTab[0]}
                    className="customTabContent--Truefanz"
                  >
                    <TabPane tabId="1">
                      <Row>
                        <Col sm="7" md="5" lg="5" xl="3">
                          <Card className="ProfileCard">
                            <CardHeader></CardHeader>
                            <CardBody className="align-items-center d-flex flex-column">
                              <div className="profileImgWrap">
                                <img
                                  className="profileImg"
                                  src={creatorDetails.profilePicture}
                                  alt="Profile Img"
                                />
                              </div>

                              <h4 className="mt-2 mb-2">
                                {creatorDetails.name.full}
                                &nbsp;
                                {creatorDetails.address.country ? (
                                  <img
                                    src={`https://www.countryflags.io/${creatorDetails.address.country}/flat/24.png`}
                                    alt="flag"
                                  />
                                ) : (
                                  "N/A"
                                )}
                              </h4>
                              {/* {creatorDetails.subscriptionFees && (
                                <p>
                                  ${creatorDetails.subscriptionFees.amount}
                                  /month
                                </p>
                              )} */}
                              <div className="mb-3">
                                <Input
                                  type="select"
                                  name="status"
                                  id="status"
                                  style={{ minWidth: "200px" }}
                                  value={selectedMonth}
                                  onChange={(e) => this._onMonthUpdated(e)}
                                >
                                  <option value="30">1 Months</option>
                                  {bundles && bundles.length && 
                                    <>
                                      <option value="90">3 Months</option>
                                      <option value="180">6 Months</option>
                                      <option value="270">9 Months</option>
                                      <option value="360">12 Months</option>
                                    </>
                                  } 
                                </Input>
                              </div>

                              <div className="card-footer new-card-footer mb-3">
                                <p>Price</p>
                                {this._renderPriceTable()}
                              </div>

                              <div className="profileInfo_social">
                                {creatorDetails.social.map((each) => (
                                  <a
                                    href={this._formatSocialUrl(
                                      each.accountUrl
                                    )}
                                    target="_blank"
                                  >
                                    {each.name === "tiktok" ? (
                                      <img
                                        className="tiktok-social-icon"
                                        src="/assets/img/tiktok-icon.png"
                                      />
                                    ) : (
                                      <i
                                        className={
                                          config.socialIconConfig[each.name]
                                        }
                                      ></i>
                                    )}
                                  </a>
                                ))}
                                {/* <a href="# ">
                                  <i className="fa fa-twitter"></i>
                                </a>
                                <a href="# ">
                                  <i className="fa fa-youtube-play"></i>
                                </a>
                                <a href="# ">
                                  <i className="fa fa-instagram"></i>
                                </a>
                                <a href="# ">
                                  <i className="fa fa-snapchat"></i>
                                </a> */}
                              </div>

                              <ListGroup className="profileInfo mt-4 w-100">
                                <ListGroupItem>
                                  <p>
                                    Subscribers:
                                    {creatorDetails._subscriptions.length >
                                      0 && (
                                      <a
                                        href="# "
                                        onClick={() =>
                                          this._onToggleSubscriberModal(
                                            this.state.creatorDetails
                                          )
                                        }
                                      >
                                        {creatorDetails._subscriptions.length}
                                      </a>
                                    )}
                                    {!creatorDetails._subscriptions.length && (
                                      <span>&nbsp;N/A</span>
                                    )}
                                  </p>
                                </ListGroupItem>
                                <ListGroupItem>
                                  <p>
                                    Lifetime Earnings:
                                    <Link
                                      to={{
                                        pathname: "/transactions",
                                        creatorId: creatorDetails._id,
                                      }}
                                    >
                                      <span>${creatorDetails.lifeTime}</span>
                                    </Link>
                                  </p>
                                </ListGroupItem>
                              </ListGroup>
                            </CardBody>
                          </Card>
                        </Col>
                        <Col sm="12" md="7" lg="7" xl="5">
                          <Card className="ProfileCard">
                            <CardBody>
                              <ListGroup className="profileInfo">
                                <ListGroupItem>
                                  <p>
                                    <i className="icon-envelope"></i>
                                    Email:
                                    <span>
                                      <CopyclipBoard
                                        copiedValue={creatorDetails.email}
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
                                      {creatorDetails.phone ? (
                                        <CopyclipBoard
                                          copiedValue={parsePhoneNumberFromString(
                                            creatorDetails.phone
                                          ).formatInternational()}
                                          fontWeight={600}
                                        ></CopyclipBoard>
                                      ) : (
                                        "N/A"
                                      )}
                                    </span>
                                  </p>
                                </ListGroupItem>
                                <ListGroupItem>
                                  <p>
                                    <i className="fa fa-user-circle-o"></i>
                                    Username:
                                    <span>
                                      <CopyclipBoard
                                        copiedValue={creatorDetails.username}
                                        fontWeight={600}
                                      ></CopyclipBoard>
                                    </span>
                                  </p>
                                </ListGroupItem>
                                <ListGroupItem>
                                  <p>
                                    <i className="fa fa-birthday-cake"></i>
                                    Birthday:
                                    <span>
                                      {creatorDetails.hasOwnProperty("dob")
                                        ? creatorDetails.dob.year +
                                          "-" +
                                          creatorDetails.dob.month +
                                          "-" +
                                          creatorDetails.dob.day
                                        : "N/A"}
                                    </span>
                                  </p>
                                </ListGroupItem>
                                <ListGroupItem>
                                  <p>
                                    <i className="icon-user"></i>
                                    Gender:
                                    <span className="capitalize">
                                      {creatorDetails.gender || "N/A"}
                                    </span>
                                  </p>
                                </ListGroupItem>
                                <ListGroupItem>
                                  <p>
                                    <i className="icon-user-follow"></i>
                                    Invited By:
                                    <Link
                                      to={`/creator-view/${creatorDetails._invitedby._id}`}
                                    >
                                      <span>
                                        {creatorDetails._invitedby.name.full}
                                      </span>
                                    </Link>
                                  </p>
                                </ListGroupItem>
                                <ListGroupItem>
                                  <p>
                                    <i className="icon-user-follow"></i>
                                    Referrals:
                                    {creatorDetails._invitations.length > 0 && (
                                      <a
                                        href="# "
                                        onClick={() =>
                                          this._onToggleReferralsModal(
                                            this.state.creatorDetails
                                          )
                                        }
                                      >
                                        {creatorDetails._invitations.length}
                                      </a>
                                    )}
                                    {!creatorDetails._invitations.length && (
                                      <span>&nbsp;N/A</span>
                                    )}
                                  </p>
                                </ListGroupItem>
                              </ListGroup>
                            </CardBody>
                          </Card>
                        </Col>

                        {/* Earning Settings */}
                        <Col sm="12" md="5" xl="4">
                          <Card className="ProfileCard">
                            <CardBody>
                              <h4 className="text-center mt-2 mb-4">
                                Revenue Settings
                              </h4>

                              <Form
                                onSubmit={(e) => this._validateAndSubmit(e)}
                                noValidate
                                className="form-horizontal"
                              >
                                <FormGroup
                                  row
                                  className="mb-4 align-items-center"
                                >
                                  <Col
                                    sm="5"
                                    md="6"
                                    lg="5"
                                    className="text-right px-md-2 px-lg-3"
                                  >
                                    <Label htmlFor="">Referral Share</Label>
                                  </Col>
                                  <Col sm="5" md="6" xl="5">
                                    <InputGroup>
                                      <Input
                                        type="number"
                                        id="referPercentage"
                                        autoComplete="off"
                                        name="referPercentage"
                                        placeholder="Enter"
                                        value={formFields.referPercentage.value}
                                        onChange={(e) =>
                                          this._updateFieldValue(
                                            "referPercentage",
                                            e.target.value
                                          )
                                        }
                                        onBlur={() =>
                                          this._markAsDirty("referPercentage")
                                        }
                                      />
                                      <InputGroupAddon addonType="append">
                                        <InputGroupText>
                                          <i className="fa fa-percent"></i>
                                        </InputGroupText>
                                      </InputGroupAddon>
                                      {formFields.referPercentage.isTyped &&
                                      formFields.referPercentage.isDirty &&
                                      !formFields.referPercentage.isValid ? (
                                        formFields.referPercentage.value
                                          .length ? (
                                          <div className="validation-error">
                                            value must be in decimal and in
                                            between o to 99
                                          </div>
                                        ) : (
                                          <div className="validation-error">
                                            Referral share should not be blank
                                          </div>
                                        )
                                      ) : null}
                                    </InputGroup>
                                  </Col>
                                </FormGroup>
                                <FormGroup
                                  row
                                  className="mb-4 align-items-center"
                                >
                                  <Col
                                    sm="5"
                                    md="6"
                                    lg="5"
                                    className="text-right px-md-2 px-lg-3"
                                  >
                                    <Label htmlFor="">Revenue Share</Label>
                                  </Col>
                                  <Col sm="5" md="6" xl="5">
                                    <InputGroup>
                                      <Input
                                        type="number"
                                        id="influencerPercentage"
                                        name="influencerPercentage"
                                        placeholder="Enter"
                                        value={
                                          formFields.earningPercentage.value
                                        }
                                        onChange={(e) =>
                                          this._updateFieldValue(
                                            "earningPercentage",
                                            e.target.value
                                          )
                                        }
                                        onBlur={() =>
                                          this._markAsDirty("earningPercentage")
                                        }
                                      />
                                      <InputGroupAddon addonType="append">
                                        <InputGroupText>
                                          <i className="fa fa-percent"></i>
                                        </InputGroupText>
                                      </InputGroupAddon>
                                      {formFields.earningPercentage.isTyped &&
                                      formFields.earningPercentage.isDirty &&
                                      !formFields.earningPercentage.isValid ? (
                                        formFields.earningPercentage.value
                                          .length ? (
                                          <div className="validation-error">
                                            value must be in decimal and in
                                            between o to 99
                                          </div>
                                        ) : (
                                          <div className="validation-error">
                                            Revenue share should not be blank
                                          </div>
                                        )
                                      ) : null}
                                    </InputGroup>
                                  </Col>
                                </FormGroup>
                                {/* <FormGroup
                                  row
                                  className="mb-4 align-items-center"
                                >
                                  <Col
                                    sm="5"
                                    md="5"
                                    lg="5"
                                    className="text-right"
                                  >
                                    <Label htmlFor="">Platform Share</Label>
                                  </Col>
                                  <Col sm="4" md="5" lg="4">
                                    <p
                                      className="mb-0"
                                      style={{ marginTop: "-1px" }}
                                    >
                                      {platformShare < 0 ? 0 : platformShare}%
                                    </p>
                                  </Col>
                                  {platformShare < 0 ? (
                                    <div
                                      className="validation-error"
                                      style={{ textAlign: "center" }}
                                    >
                                      Addition of Referral Share & Revenue Share
                                      must be within 100
                                    </div>
                                  ) : null}
                                </FormGroup> */}

                                <Button
                                  type="submit"
                                  className="BtnPurple mx-auto d-block"
                                  style={{
                                    padding: "7px 25px",
                                    margin: "35px auto 10px",
                                  }}
                                  disabled={loading.updateLoading}
                                >
                                  {loading.updateLoading ? (
                                    <>
                                      <i className="fa fa-spinner fa-spin mr5" />
                                      &nbsp;
                                    </>
                                  ) : null}
                                  Save
                                </Button>
                              </Form>
                            </CardBody>
                          </Card>
                        </Col>

                        {/* <Row>
                        <Col sm="12" md="12" lg="10" xl="8">
                          <Card className="ProfileCard">
                            <CardBody>
                              <h4 className="text-center mt-2">ID Proof</h4>

                              <Row>
                                <Col sm="6">
                                  <div className="idProofImgWrap">
                                    {idCardUrl ? (
                                      <img
                                        className="idProofImg"
                                        src={idCardUrl}
                                        alt="ID Proof Img"
                                      />
                                    ) : null}
                                  </div>
                                  <p className="text-center mb-2">ID Card</p>
                                </Col>
                                <Col sm="6" className="border-left">
                                  <div className="idProofImgWrap">
                                    {holdingIDCardUrl ? (
                                      <img
                                        className="idProofImg"
                                        src={holdingIDCardUrl}
                                        alt="ID Proof Img"
                                      />
                                    ) : null}
                                  </div>
                                  <p className="text-center mb-2">
                                    Pic Holding ID Card
                                  </p>
                                </Col>
                              </Row>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row> */}

                        <Col sm="6" md="7" lg="7" xl="5">
                          <Card className="ProfileCard">
                            <CardBody>
                              <h4 className="text-center mt-2">Address</h4>

                              {creatorDetails.address && (
                                <div className="addressWrap">
                                  <p>
                                    {creatorDetails.address.street || "N/A"}
                                  </p>

                                  <Label>City:</Label>
                                  <p>{creatorDetails.address.city || "N/A"}</p>

                                  <Label>State:</Label>
                                  <p>{creatorDetails.address.state || "N/A"}</p>

                                  <Label>Zip:</Label>
                                  <p>{creatorDetails.address.zip || "N/A"}</p>

                                  <Label>Country:</Label>
                                  <p>
                                    {creatorDetails.address.country || "N/A"}
                                  </p>
                                </div>
                              )}
                              {!creatorDetails.address && (
                                <div>Address Not Provided</div>
                              )}
                            </CardBody>
                          </Card>
                        </Col>
                        {/* <Col sm="6" md="6" lg="5" xl="4">
                          <Card className="ProfileCard">
                            <CardBody>
                              <h4 className="text-center mt-2">Bank Info</h4>

                              <div className="bankInfoWrap">
                                <Label>Account Holder:</Label>
                                <p>{creatorDetails.name.full}</p>

                                <Label>Routing Number:</Label>
                                <p>
                                  {(creatorDetails.bank &&
                                    creatorDetails.bank.routingNumber) ||
                                    "N/A"}
                                </p>

                                <Label>Account Number:</Label>
                                <p>
                                  {(creatorDetails.bank &&
                                    creatorDetails.bank.accountNumber) ||
                                    "N/A"}
                                </p>
                              </div>
                            </CardBody>
                          </Card>
                        </Col> */}
                        <Col sm="6" md="5" xl="3">
                          <Card className="ProfileCard">
                            <CardBody>
                              <h4 className="text-center mt-2">
                                Invitation Settings
                              </h4>

                              <div className="addressWrap mt-3">
                                {/* <p>
                                    
                                  </p> */}

                                <Label>Invites Avialable:</Label>
                                <p>{availableReferrralCount}</p>
                                <InputGroup className="mt-4">
                                  <InputGroupAddon
                                    addonType="prepend"
                                    onClick={this._changeReferralCount}
                                  >
                                    <InputGroupText className="inviteAddSub">
                                      +
                                    </InputGroupText>
                                  </InputGroupAddon>
                                  <Input
                                    disabled
                                    placeholder="Add invite number"
                                    value={additionalReferralCount}
                                  />
                                  <InputGroupAddon
                                    addonType="append"
                                    onClick={() =>
                                      this._changeReferralCount(false)
                                    }
                                  >
                                    <InputGroupText className="inviteAddSub">
                                      -
                                    </InputGroupText>
                                  </InputGroupAddon>
                                </InputGroup>
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
                    </TabPane>
                    <TabPane tabId="2">
                      <Row className="mb-4 justify-content-center">
                        <Col sm={12} md={10} lg={8}>
                          <CreatorFeedList
                            user={creatorDetails}
                            updateRef={(ref) =>
                              (this._updateChildActivites = ref)
                            }
                            {...this.props}
                          />
                        </Col>
                      </Row>
                    </TabPane>
                  </TabContent>
                </Col>
              )}
            </Row>
          )}
          {loading.loadingData && (
            <div className="filterWrap">
              <div className="loading-section list-loading">
                <i className="fa fa-spinner fa-spin"></i> &nbsp; Loading Creator
                Details..
              </div>
            </div>
          )}
          {/* Modal for "Subscribers" */}
          <SubscriberListModal
            isOpen={this.state.subscriberModal.isOpen}
            creatorData={this.state.subscriberModal.data}
            toggle={() => this._onToggleSubscriberModal()}
          ></SubscriberListModal>

          {/* Modal for "Referrals" */}
          <ReferralsListModal
            isOpen={this.state.referralsModal.isOpen}
            creatorData={this.state.referralsModal.data}
            toggle={() => this._onToggleReferralsModal()}
          ></ReferralsListModal>
        </Container>
      </div>
    );
  }
}

export default CreatorView;
