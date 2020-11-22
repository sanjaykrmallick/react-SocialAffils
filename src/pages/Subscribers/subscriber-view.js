import React, { Component } from "react";
import { ToastsStore } from "react-toasts";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
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
import SubscriptionListModal from "../../components/subscription-list-modal";
import config from "../../config/index";
import {
  changeUserStatus,
  getSubscriberDetails,
  getSubscriberActivity,
} from "../../http/http-calls";
import SubscriberActivityList from "../../components/subscriber-activity-list";
import CopyclipBoard from "../../components/copy-clipboard";
import { capitalize, showToast } from "../../helper-methods";
import moment from "moment";
import { format } from "date-fns";
import CustomTable from "../../components/custom-table";
import { Link } from "react-router-dom";

import { parsePhoneNumberFromString } from "libphonenumber-js";

class SubscriberView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: new Array(2).fill("1"),
      subscriberDetails: null,
      loading: {
        loadingData: false,
        changeStatusLoading: false,
      },
      subscriptionModal: {
        isOpen: false,
        data: null,
      },
      activities: [],
      subscriptionsHeaderKeys: [
        { id: "id", label: "id" },
        { id: "amount", label: "Amount" },
        { id: "date", label: "Date" },
        { id: "creator", label: "Creator" },
        { id: "tierAndCycle", label: "Tier & Cycle" },
      ],
      subscriptions: [],
      expiredSubscriptions: [],
    };
  }

  componentDidMount() {
    this._getSubscriberDetails(this.props.match.params.id);
  }

  toggle = (tabPane, tab) => {
    const newArray = this.state.activeTab.slice();
    newArray[tabPane] = tab;
    this.setState(
      {
        activeTab: newArray,
        popoverOpen: !this.state.popoverOpen,
      },
      () => {
        if (Number(tab) === 2) {
          this._updateChildActivites();
        }
      }
    );
  };

  _onToggleSubscriptionModal = (data) => {
    let { subscriptionModal } = JSON.parse(JSON.stringify(this.state));
    subscriptionModal.isOpen = !subscriptionModal.isOpen;
    if (subscriptionModal.isOpen) {
      data.subscriptions = data._subscriptions;
    }
    subscriptionModal.data = data;
    this.setState({
      subscriptionModal,
    });
  };

  _goBack = () => {
    // this.props.history.push("/subscribers");
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

  _getSubscriberDetails = (id) => {
    this._manageLoading("data", true);
    getSubscriberDetails(id).then(
      (response) => {
        console.log("SubscriberView -> response", response);
        let filteredOngoingSubscriptions = response.fan._subscriptions.filter(
          (item) => {
            return !item.isExpired;
          }
        );
        let filteredExpiredSubscriptions = response.fan._subscriptions.filter(
          (item) => {
            return item.isExpired;
          }
        );
        let subscriptions = filteredOngoingSubscriptions.map((each) => {
          return {
            id: each._id,
            amount: each.amount ? each.amount : "-",
            date: each.start,
            creator:
              each._influencer && each._influencer.name
                ? each._influencer.name.full
                : "NA",
            creatorId: each._influencer && each._influencer.id,
            tierAndCycle:
              each.tier && each.billingCycle
                ? `${capitalize(each.tier)} | ${each.billingCycle / 30} Month`
                : "NA",
          };
        });

        let expiredSubscriptions = filteredExpiredSubscriptions.map((each) => {
          return {
            id: each._id,
            amount: each.amount ? each.amount : "-",
            date: each.start,
            creator:
              each._influencer && each._influencer.name
                ? each._influencer.name.full
                : "NA",
            creatorId: each._influencer && each._influencer.id,
            tierAndCycle:
              each.tier && each.billingCycle
                ? `${capitalize(each.tier)} | ${each.billingCycle / 30} Month`
                : "NA",
          };
        });
        this._manageLoading("data", false);
        let { subscriberDetails } = this.state;
        response.fan.profilePicture =
          response.fan.profilePicture || config.defaultUserPicture;
        response.fan.status = response.fan.isActive ? "Active" : "Inactive";
        response.fan.amountSpent = response.fan._debit
          .reduce((acc, item) => {
            return (acc = acc + item.amount);
          }, 0)
          .toFixed(2);
        subscriberDetails = response.fan;
        this.setState({
          subscriberDetails,
          subscriptions,
          expiredSubscriptions,
        });
      },
      (error) => {
        console.log(error);
        this._manageLoading("data", false);
      }
    );
  };

  _onStatusUpdate = () => {
    let { subscriberDetails } = this.state;
    subscriberDetails.status =
      subscriberDetails.status === "Active" ? "Inactive" : "Active";
    this.setState({
      subscriberDetails,
    });
    this._manageLoading("change-status", true);
    changeUserStatus(subscriberDetails.id).then(
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

  _formatDate(date, dateFormat) {
    return format(new Date(date), dateFormat);
  }

  _dataFormat = (cell, row, header) => {
    console.log(cell, row, header);
    if (header === "amount") {
      return typeof cell === "number" ? "$" + cell.toFixed(2) : "-";
    } else if (header === "date") {
      return (
        <>
          {this._formatDate(cell, "MMM d, yyyy")}
          <br />
          {this._formatDate(cell, "HH:mm")}
        </>
      );
    } else if (header === "creator") {
      return cell ? (
        <Link to={`/creator-view/${row.creatorId}`}>
          <span>{cell}</span>
        </Link>
      ) : (
        "-"
      );
    } else {
      return cell;
    }
  };

  _gotoViewCreator = (id) => {
    this.props.history.push("/creator-view/" + id);
  };

  render() {
    let {
      subscriberDetails,
      loading,
      subscriptions,
      expiredSubscriptions,
    } = this.state;
    return (
      <div className="app TruFansPgBg animated fadeIn">
        <Container>
          {!loading.loadingData && (
            <Row>
              {subscriberDetails && (
                <Col xs="12">
                  <div className="PgTitle">
                    <div className="d-flex justify-content-start align-items-center">
                      {/* on clicking the below btn, it should take back user to subscriber page */}
                      <Button
                        color="ghost-dark"
                        className="customBackBtn"
                        onClick={this._goBack}
                      >
                        <i className="fa fa-arrow-left"></i>
                      </Button>
                      <h2>{subscriberDetails.name.full}</h2>
                    </div>

                    <div className="mr-2">
                      <Input
                        type="select"
                        name="status"
                        id=""
                        style={{ minWidth: "150px" }}
                        value={subscriberDetails.status}
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

              {subscriberDetails && (
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
                        <Col sm="7" md="5" lg="4" xl="3">
                          <Card className="ProfileCard">
                            <CardHeader></CardHeader>
                            <CardBody className="align-items-center d-flex flex-column">
                              <div className="profileImgWrap">
                                <img
                                  className="profileImg"
                                  src={subscriberDetails.profilePicture}
                                  alt="Profile Img"
                                />
                              </div>

                              <h4 className="mt-2 mb-2">
                                {subscriberDetails.name.full}
                                &nbsp;
                                {subscriberDetails.address &&
                                subscriberDetails.address.country ? (
                                  <img
                                    src={`https://www.countryflags.io/${subscriberDetails.address.country}/flat/24.png`}
                                    alt="flag"
                                  />
                                ) : (
                                  ""
                                )}
                              </h4>

                              <ListGroup className="profileInfo mt-2">
                                <ListGroupItem>
                                  <p>
                                    Member Since:
                                    <span>
                                      {(subscriberDetails.createdAt &&
                                        moment(
                                          subscriberDetails.createdAt
                                        ).format("YYYY-MM-DD")) ||
                                        "N/A"}
                                    </span>
                                  </p>
                                </ListGroupItem>
                                <ListGroupItem>
                                  <p>
                                    Active Subscriptions:{" "}
                                    <span>
                                      {subscriptions && subscriptions.length
                                        ? subscriptions.length
                                        : 0}
                                    </span>
                                  </p>
                                </ListGroupItem>
                                <ListGroupItem>
                                  <p>
                                    Expired Subscriptions:{" "}
                                    <span>
                                      {expiredSubscriptions &&
                                      expiredSubscriptions.length
                                        ? expiredSubscriptions.length
                                        : 0}
                                    </span>
                                  </p>
                                </ListGroupItem>
                                <ListGroupItem>
                                  <p>
                                    Amount Spent:
                                    <Link
                                      to={{
                                        pathname: "/transactions",
                                        subscriberId: subscriberDetails._id,
                                      }}
                                    >
                                      <span>
                                        ${subscriberDetails.amountSpent}
                                      </span>
                                    </Link>
                                  </p>
                                </ListGroupItem>
                              </ListGroup>
                            </CardBody>
                          </Card>
                        </Col>
                        <Col sm="11" md="7" lg="6" xl="5">
                          <Card className="ProfileCard">
                            <CardBody>
                              <ListGroup className="profileInfo">
                                <ListGroupItem>
                                  <p>
                                    <i className="fa fa-envelope"></i>
                                    Email:
                                    <span>
                                      <CopyclipBoard
                                        copiedValue={subscriberDetails.email}
                                        fontWeight={600}
                                      ></CopyclipBoard>
                                    </span>
                                  </p>
                                </ListGroupItem>
                                <ListGroupItem>
                                  <p>
                                    <i className="fa fa-phone"></i>
                                    Phone:
                                    <span>
                                      {subscriberDetails.phone ? (
                                        <CopyclipBoard
                                          copiedValue={parsePhoneNumberFromString(
                                            subscriberDetails.phone
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
                                      {subscriberDetails.username ? (
                                        <CopyclipBoard
                                          copiedValue={
                                            subscriberDetails.username
                                          }
                                          fontWeight={600}
                                        ></CopyclipBoard>
                                      ) : (
                                        "N/A"
                                      )}
                                    </span>
                                  </p>
                                </ListGroupItem>
                                {/* <ListGroupItem>
                                  <p>
                                    <i className="fa fa-birthday-cake"></i>
                                    Birthday:
                                    <span>
                                      {subscriberDetails.hasOwnProperty("dob")
                                        ? subscriberDetails.dob.year +
                                          "-" +
                                          subscriberDetails.dob.month +
                                          "-" +
                                          subscriberDetails.dob.day
                                        : "N/A"}
                                    </span>
                                  </p>
                                </ListGroupItem> */}
                                <ListGroupItem>
                                  <p>
                                    <i className="fa fa-user"></i>
                                    Gender:
                                    <span className="capitalize">
                                      {subscriberDetails.gender || "N/A"}
                                    </span>
                                  </p>
                                </ListGroupItem>
                              </ListGroup>
                            </CardBody>
                          </Card>
                        </Col>

                        <Col sm="11" md="5" lg="4" xl="4">
                          <Card className="ProfileCard">
                            <CardBody>
                              <h4 className="text-center mt-2">Address</h4>

                              {subscriberDetails.address && (
                                <div className="addressWrap">
                                  <p>
                                    {subscriberDetails.address.street || "N/A"}
                                  </p>

                                  <Label>City:</Label>
                                  <p>
                                    {subscriberDetails.address.city || "N/A"}
                                  </p>

                                  <Label>State:</Label>
                                  <p>
                                    {subscriberDetails.address.state || "N/A"}
                                  </p>

                                  <Label>Zip:</Label>
                                  <p>
                                    {subscriberDetails.address.zip || "N/A"}
                                  </p>

                                  <Label>Country:</Label>
                                  <p>
                                    {subscriberDetails.address.country || "N/A"}
                                  </p>
                                </div>
                              )}
                              {!subscriberDetails.address && (
                                <div>Address Not Provided</div>
                              )}
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>

                      <Row className="mt-2">
                        <Col sm="12" xl="6">
                          <Card className="ProfileCard">
                            <CardBody>
                              <h4 className=" mt-2">Date Started</h4>

                              <CustomTable
                                tableData={subscriptions}
                                headerKeys={this.state.subscriptionsHeaderKeys}
                                dataFormat={this._dataFormat}
                                rowSelection={false}
                              />
                            </CardBody>
                          </Card>
                        </Col>
                        <Col sm="12" xl="6">
                          <Card className="ProfileCard">
                            <CardBody>
                              <h4 className="mt-2">Date Ended</h4>
                              <CustomTable
                                tableData={expiredSubscriptions}
                                headerKeys={this.state.subscriptionsHeaderKeys}
                                dataFormat={this._dataFormat}
                                rowSelection={false}
                              ></CustomTable>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tabId="2">
                      <Row className="mb-4 justify-content-center">
                        <Col sm={12} md={10} lg={8}>
                          <SubscriberActivityList
                            user={subscriberDetails}
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
                <i className="fa fa-spinner fa-spin"></i> &nbsp; Loading
                Subscriber Details..
              </div>
            </div>
          )}
          {/* Modal for "Subscriptions" */}
          <SubscriptionListModal
            isOpen={this.state.subscriptionModal.isOpen}
            data={this.state.subscriptionModal.data}
            toggle={() => this._onToggleSubscriptionModal()}
          ></SubscriptionListModal>
        </Container>
      </div>
    );
  }
}

export default SubscriberView;
