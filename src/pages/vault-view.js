import React, { Component } from "react";
import { ToastsStore } from "react-toasts";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardText,
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
import SubscriptionListModal from "../components/subscription-list-modal";
import config from "../config/index";
import {
  changeUserStatus,
  getSubscriberDetails,
  getSubscriberActivity,
  getAllVaultFolderDetail,
} from "../http/http-calls";
import SubscriberActivityList from "../components/subscriber-activity-list";
import CopyclipBoard from "../components/copy-clipboard";
import { capitalize, showToast } from "../helper-methods";
import moment from "moment";
import { format } from "date-fns";
import CustomTable from "../components/custom-table";
import { Link } from "react-router-dom";

import { parsePhoneNumberFromString } from "libphonenumber-js";

class VaultView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // activeTab: new Array(2).fill("1"),
      folderDetails: null,
      loading: {
        loadingData: false,
        changeStatusLoading: false,
      },
      subscriptionModal: {
        isOpen: false,
        data: null,
      },
      activities: [],
      salesHeaderKeys: [
        { id: "id", label: "id" },
        { id: "influencer", label: "Influencer" },
        // { id: "commission", label: "Commission" },
        { id: "sales", label: "Sales" },
        // { id: "id", label: "id" },
        // { id: "subscriber", label: "Subscriber" },
        // { id: "paid", label: "Paid" },
        // { id: "date", label: "Date" },
        // { id: "tierAndCycle", label: "Tier & Cycle" },
      ],
      contentList: [
        {
          orderid: 12334,
          buyer: "shyam",
          qty: 5,
          amount: 30,
          influencer: "jack",
          status: "pending",
        },
      ],
      salesList: [{ influencer: "luci", sales: 6 }],
      contentHeaderKeys: [
        { id: "id", label: "id" },
        { id: "orderid", label: "Order Id" },
        { id: "buyer", label: "Buyer" },
        { id: "qty", label: "Qty" },
        { id: "amount", label: "Amount" },
        { id: "influencer", label: "Influencer" },
        { id: "status", label: "Status" },
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
    getAllVaultFolderDetail(id).then(
      (response) => {
        console.log("vaultView -> response", response);
        const salesList = response.folder._transactions.map((each) => {
          return {
            id: each.id,
            subscriber: each._from.name.full,
            paid: each.amount,
            date: each.time,
          };
        });
        const contentList = response.folder._contents.map((each) => {
          return {
            id: each.id,
            filename: each.name,
            size: each.size,
            dateadded: each.createdAt,
          };
        });

        this._manageLoading("data", false);
        // let { subscriberDetails } = this.state;
        // response.fan.profilePicture =
        //   response.fan.profilePicture || config.defaultUserPicture;
        // response.fan.status = response.fan.isActive ? "Active" : "Inactive";
        // response.fan.amountSpent = response.fan._debit
        //   .reduce((acc, item) => {
        //     return (acc = acc + item.amount);
        //   }, 0)
        //   .toFixed(2);
        // subscriberDetails = response.fan;
        this.setState({
          folderDetails: response.folder,
          // salesList,
          // contentList,
          // subscriberDetails,
          // subscriptions,
          // expiredSubscriptions,
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
    // console.log(date, dateFormat);
    return format(new Date(date), dateFormat);
  }

  _dataFormat = (cell, row, header) => {
    // console.log(cell, row, header);
    if (header === "amount") {
      return typeof cell === "number" ? "$" + cell.toFixed(2) : "-";
    } else if (header === "dateadded") {
      return (
        <>
          {this._formatDate(cell, "MMM d, yyyy")}
          <br />
          {this._formatDate(cell, "HH:mm")}
        </>
      );
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
      folderDetails,
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
                      <h2>Back To Vault</h2>
                    </div>
                  </div>
                </Col>
              )}

              {folderDetails && (
                <Col sm="12">
                  <Row>
                    <Col sm="7" md="5" lg="4" xl="3">
                      <Card className="ProfileCard">
                        <CardHeader>
                          {/* <h3 className="ml-5">Influencer</h3> */}
                        </CardHeader>
                        <CardBody className="align-items-center d-flex flex-column">
                          <div className="profileImgWrap">
                            <img
                              className="profileImg"
                              src={folderDetails._owner.profilePicture}
                              alt="Profile Img"
                            />
                          </div>

                          <h4 className="mt-2 mb-2">
                            {folderDetails._owner.name.full}
                            &nbsp;
                            {/* {subscriberDetails.address &&
                            subscriberDetails.address.country ? (
                              <img
                                src={`https://www.countryflags.io/${subscriberDetails.address.country}/flat/24.png`}
                                alt="flag"
                              />
                            ) : (
                              ""
                            )} */}
                          </h4>

                          <ListGroup className="profileInfo mt-2">
                            <ListGroupItem>
                              <p>
                                Seller:
                                <span>
                                  {(folderDetails.createdAt &&
                                    moment(folderDetails.createdAt).format(
                                      "YYYY-MM-DD"
                                    )) ||
                                    "N/A"}
                                </span>
                              </p>
                            </ListGroupItem>
                            <ListGroupItem>
                              <p>
                                Cost:{" "}
                                <span>
                                  {"$80"}
                                  {/* {subscriptions && subscriptions.length
                                    ? subscriptions.length
                                    : 0} */}
                                </span>
                              </p>
                            </ListGroupItem>
                            <ListGroupItem>
                              <p>
                                Sales:{" "}
                                <span>
                                  {8}
                                  {/* {expiredSubscriptions &&
                                  expiredSubscriptions.length
                                    ? expiredSubscriptions.length
                                    : 0} */}
                                </span>
                              </p>
                            </ListGroupItem>
                            <ListGroupItem>
                              <p>
                                Commission:<span>5%</span>
                                {/* <input className="form-control" value={5} /> */}
                              </p>
                            </ListGroupItem>
                          </ListGroup>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col sm="11" md="7" lg="6" xl="5">
                      <Card className="ProfileCard ml-5">
                        <CardBody>
                          <ListGroup className="profileInfo">
                            {/* <img
                              className="profileImg"
                              style={{ height: "250px", width: "300px" }}
                              src={folderDetails._owner.profilePicture}
                              alt="Profile Img"
                            /> */}
                            {/* <ListGroupItem>
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
                                </ListGroupItem> */}
                            {/* <ListGroupItem>
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
                                </ListGroupItem> */}
                            {/* <ListGroupItem>
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
                                </ListGroupItem> */}
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
                            {/* <ListGroupItem>
                                  <p>
                                    <i className="fa fa-user"></i>
                                    Gender:
                                    <span className="capitalize">
                                      {subscriberDetails.gender || "N/A"}
                                    </span>
                                  </p>
                                </ListGroupItem> */}
                          </ListGroup>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>

                  <Row className="mt-2">
                    <Col sm="12" xl="4">
                      <Card className="ProfileCard">
                        <CardBody>
                          <h4 className=" mt-2">Sales</h4>

                          <CustomTable
                            tableData={this.state.salesList}
                            headerKeys={this.state.salesHeaderKeys}
                            dataFormat={this._dataFormat}
                            rowSelection={false}
                          />
                        </CardBody>
                      </Card>
                    </Col>
                    <Col sm="12" xl="8">
                      <Card className="ProfileCard">
                        <CardBody>
                          <h4 className="mt-2">Recent Orders</h4>
                          <CustomTable
                            tableData={this.state.contentList}
                            headerKeys={this.state.contentHeaderKeys}
                            dataFormat={this._dataFormat}
                            rowSelection={false}
                          ></CustomTable>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>

                  {/* <Row className="mb-4 justify-content-center">
                        <Col sm={12} md={10} lg={8}>
                          <SubscriberActivityList
                            user={subscriberDetails}
                            updateRef={(ref) =>
                              (this._updateChildActivites = ref)
                            }
                            {...this.props}
                          />
                        </Col>
                      </Row> */}
                </Col>
              )}
            </Row>
          )}
          {/* {loading.loadingData && (
            <div className="filterWrap">
              <div className="loading-section list-loading">
                <i className="fa fa-spinner fa-spin"></i> &nbsp; Loading
                Subscriber Details..
              </div>
            </div>
          )} */}
          <Row className="mt-2 d-flex justify-content-center">
            <h3>Sales Letter</h3>
            <Card className="ProfileCard">
              <CardText className="d-flex justify-content-center text-dark">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Eligendi non quis exercitationem culpa nesciunt nihil aut
                nostrum explicabo reprehenderit optio amet ab temporibus
                asperiores quasi cupiditate. Voluptatum ducimus voluptates
                voluptas?
                {/* {folderDetails.description} */}
              </CardText>
            </Card>
          </Row>

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

export default VaultView;
