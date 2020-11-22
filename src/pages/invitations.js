import React, { Component } from "react";
import { Container, Row, Col, Button, Input, Badge } from "reactstrap";
import CustomTable from "../components/custom-table";
import { getAllInvitations, sendMessage } from "../http/http-calls";
import config from "../config";
import { ToastsStore } from "react-toasts";
import { format } from "date-fns";
import SendInviteModal from "../components/send-invite-modal";
import CustomDateRangePicker from "../components/date-range-picker";
import TextEditor from "../components/text-editor";
import CopyclipBoard from "../components/copy-clipboard";
import { showToast, deepClone } from "../helper-methods";
import moment from "moment";
import { Link } from "react-router-dom";
import { parsePhoneNumberFromString } from "libphonenumber-js";
class Invitations extends Component {
  state = {
    sendInvitationModal: {
      isOpen: false
    },
    invitationList: [],
    invitationListBackup: [],
    headerKeys: [
      { id: "id", label: "id" },
      { id: "name", label: "Name" },
      { id: "email", label: "Email" },
      { id: "phone", label: "Phone" },
      { id: "date", label: "Date" },
      { id: "invitedBy", label: "Invited By" },
      { id: "status", label: "Status" }
    ],
    invitationsStatusColor: config.invitationsStatusColor,
    filters: {
      dateRange: {
        startDate: null,
        endDate: null,
        focusedInput: null,
        startDateId: "startDate",
        endDateId: "endDate"
      },
      sentBy: "",
      status: "",
      search: ""
    },
    loading: {
      loadingData: false,
      sendingMessage: false
    },
    sentByList: [],
    contact: {
      via: "email",
      message: ""
    },
    selectedInvitations: []
  };

  _onDatesChange = (startDate, endDate) => {
    let { filters } = this.state;
    filters.dateRange.startDate = startDate;
    filters.dateRange.endDate = endDate;
    this.setState({ filters });
    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      // ToastsStore.warning("Date Filter under development.", 3000);
      this._filterInvitationList();
    }
  };

  _onFocusChange = input => {
    let { filters } = this.state;
    filters.dateRange.focusedInput = input;
    this.setState({ filters });
  };

  _toggleSendInviteModal = () => {
    let { sendInvitationModal } = JSON.parse(JSON.stringify(this.state));
    sendInvitationModal.isOpen = !sendInvitationModal.isOpen;
    this.setState({
      sendInvitationModal
    });
  };

  _manageLoading = (key, value) => {
    let { loadingData, sendingMessage } = this.state.loading;
    if (key === "data") {
      loadingData = value;
    } else if (key === "send-message") {
      sendingMessage = value;
    }
    this.setState({ loading: { loadingData, sendingMessage } });
  };

  _dataFormat = (cell, row, header) => {
    if (header === "status") {
      return (
        <Badge
          color={this.state.invitationsStatusColor[cell]}
          className="referralStatus capitalize"
        >
          {cell}
        </Badge>
      );
    } else if (header === "invitedBy") {
      return row.invitationLink ? (
        <Link to={`/creator-view/${row.invitationLink}`}>
          {row.invitedBy}
        </Link>
      ) : (
        row.invitedBy
      )
    } else if (header === "email") {
      return (
        <CopyclipBoard
          copiedValue={row.email}
          border="none">
        </CopyclipBoard>
      )
    } else if (header === "phone") {
      return row.phone !== '-' ? (
        <CopyclipBoard
          copiedValue={parsePhoneNumberFromString(
            row.phone
          ).formatInternational()}
          border="none">
        </CopyclipBoard>
      ) : '-'
    } else if (header === 'date') {
      return cell
        ? format(new Date(cell), "MMM dd, yyyy")
        : "-";
    } else {
      return cell;
    }
  };

  _getAllInvitations = () => {
    this._manageLoading("data", true);
    getAllInvitations().then(
      response => {
        this._manageLoading("data", false);
        
        let invitationList = response.invitations.map(each => {
          console.log("sq eqwdq", each);
          return {
            name: each.name
              ? each.name.first + (each.name.last ? " " + each.name.last : "")
              : "-",
            id: each._id,
            email: each.email || '-',
            phone: each.phone || "-",
            date: each.createdAt,
            invitedBy:
              each._from && each._from ? each._from.name.full : "-",
            invitationLink:
              each._from && each._from.userType === "Influencer" ? each._from._id : null,
            status:
              each.status === 'pending' ? 
                (each.hasOwnProperty("isExpired") && each.isExpired ? "expired" : each.status)
                : each.status,
          isExpired: each.hasOwnProperty("isExpired") ? each.isExpired : false
          };
        });
        invitationList = invitationList.sort((item1, item2) => {
          return new Date(item2.date) - new Date(item1.date);
        })
        let sentByList = invitationList
          .map(item => item.invitedBy)
          .filter((value, index, self) => self.indexOf(value) === index);
        this.setState({
          invitationList,
          invitationListBackup: invitationList,
          sentByList
        });
        
      },
      error => {
        this._manageLoading("data", false);
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

  _filterOnChange = ({ currentTarget }) => {
    let { filters } = this.state;
    filters[currentTarget.name] = currentTarget.value;
    this.setState({ filters });
    if (currentTarget.name !== "search") {
      this._filterInvitationList();
    }
  };

  _filterInvitationList = () => {
    let filterConditions = [];
    let { filters, invitationListBackup, invitationList } = deepClone(
      this.state
    );
    console.log("TCL: _filterInvitationList -> filters", filters);
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        filterConditions.push(key);
      }
    });
    invitationList = [];
    invitationList = invitationListBackup;
    console.log("TCL: _filterInvitationList -> invitationList", invitationList);
    if (filterConditions.length) {
      if (
        filters.dateRange &&
        filters.dateRange.startDate &&
        filters.dateRange.endDate
      ) {
        console.log("date range checking");
        invitationList = invitationList.filter(each => {
          return (
            each.hasOwnProperty("date") &&
            moment(each.date).isBetween(
              filters.dateRange.startDate,
              filters.dateRange.endDate
            )
          );
        });
      }
      if (filters.sentBy && filters.sentBy.length) {
        invitationList = invitationList.filter(each => {
          console.log("TCL: _filterInvitationList -> each", each);
          return each.invitedBy.toLowerCase() === filters.sentBy.toLowerCase();
        });
      }
      if (filters.status && filters.status.length) {
        console.log("status checking", filters.status.toLowerCase());
        invitationList = invitationList.filter(each => {
          console.log("each,filters :", each);
          return each.status.toLowerCase() === filters.status.toLowerCase();
        });
      }
      console.log("after status filtering invitationList :", invitationList);
      if (filters.search.trim().length) {
        invitationList = invitationList.filter(each => {
          return (
            (each.name &&
              each.name.toLowerCase().includes(filters.search.toLowerCase())) ||
            (each.email &&
              each.email
                .toLowerCase()
                .includes(filters.search.toLowerCase())) ||
            (each.phone &&
              each.phone
                .toLowerCase()
                .includes(filters.search.toLowerCase())) ||
            (each.invitedBy &&
              each.invitedBy
                .toLowerCase()
                .includes(filters.search.toLowerCase()))
          );
        });
      }
      console.log("invitationList :", invitationList);
      this.setState({ invitationList });
    } else {
      this.setState({ invitationList: invitationListBackup });
    }
  };

  _setSelectedRows = data => {
    let { selectedInvitations } = this.state;
    selectedInvitations = data;
    this.setState({ selectedInvitations });
  };

  _contactOnChange = ({ currentTarget }) => {
    let { contact } = this.state;
    contact[currentTarget.name] = currentTarget.value;
    this.setState({ contact });
  };

  _extractContent(s) {
    var span = document.createElement("span");
    span.innerHTML = s;
    return span.textContent || span.innerText;
  }

  _setMessageContent(value, key) {
    let { contact } = this.state;
    contact[key] = value;
    this.setState({ contact });
  }

  _sendMessage = () => {
    let { contact, selectedInvitations } = this.state;
    let data = {
      idlist: selectedInvitations,
      text:
        contact.via === "email"
          ? contact.message
          : this._extractContent(contact.message)
    };
    if (!data.idlist.length) {
      ToastsStore.warning("Please select atleast one creator", 3000);
      return;
    }
    if (!data.text.trim().length) {
      ToastsStore.warning("Please write some message", 3000);
      return;
    }
    this._manageLoading("send-message", true);
    sendMessage(contact.via, data).then(
      response => {
        this._setMessageContent("", "message");
        this._manageLoading("send-message", false);
        ToastsStore.success("Message sent Successfully!", 3000);
      },
      error => {
        console.log(error);
        this._manageLoading("send-message", false);
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
    this._getAllInvitations();
  }

  render() {
    const { filters, loading, sentByList, contact } = this.state;
    return (
      <div className="app TruFansPgBg animated fadeIn">
        <Container fluid>
          <Row>
            <Col xs="12">
              <div className="PgTitle">
                <div className="d-flex justify-content-start align-items-center">
                  {/* on clicking the below btn, it should take back the user to the previous page in history */}
                  {/* <Button color="ghost-dark" className="customBackBtn">
                    <i className="fa fa-arrow-left"></i>
                  </Button> */}
                  <h2>Invitations</h2>
                </div>

                {/* a modal open on clicking the below btn */}
                <Button
                  className="BtnPurple"
                  onClick={() => this._toggleSendInviteModal()}
                >
                  <i className="fa fa-plus"></i> Invite
                </Button>
              </div>
              {/* filters */}
              {!loading.loadingData && (
                <>
                  <div className="filterWrap">
                    <div className="d-flex align-items-center">
                      <i className="fa fa-filter"></i>
                      {/* there will be a "Date Range" below in place of an input field */}
                      {/* <Input
                    type="text"
                    id=""
                    placeholder="Date Range"
                    className="ml-2"
                  /> */}
                      <div className="ml-2">
                        <CustomDateRangePicker
                          dateRange={filters.dateRange}
                          onDatesChange={this._onDatesChange}
                          onFocusChange={this._onFocusChange}
                        ></CustomDateRangePicker>
                      </div>

                      <Input
                        type="select"
                        name="sentBy"
                        value={filters.sentBy}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Sent By</option>
                        {sentByList.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Input>
                      <Input
                        type="select"
                        name="status"
                        value={filters.status}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Status</option>
                        <option value="accepted">Accepted</option>
                        <option value="expired">Expired</option>
                        <option value="pending">Pending</option>
                      </Input>
                    </div>

                    <div className="d-flex align-items-center">
                      <Input
                        type="text"
                        id="search"
                        name="search"
                        placeholder="Search"
                        className="ml-2"
                        value={filters.search}
                        onChange={this._filterOnChange}
                      />

                      <Button
                        color="secondary"
                        className="ml-2"
                        onClick={this._filterInvitationList}
                      >
                        <i className="icon-magnifier"></i>
                      </Button>
                    </div>
                  </div>
                  <CustomTable
                    tableData={this.state.invitationList}
                    headerKeys={this.state.headerKeys}
                    dataFormat={this._dataFormat}
                    rowSelection={true}
                    setSelectedRows={data => this._setSelectedRows(data)}
                  ></CustomTable>
                  <div className="d-flex my-5 flex-column w-75 mx-auto">
                    <h2 className="text-center mb-3">Contact</h2>
                    <div className="d-flex justify-content-between">
                      <Input
                        type="select"
                        style={{ width: "175px" }}
                        className="mr-3"
                        name="via"
                        value={contact.via}
                        onChange={this._contactOnChange}
                      >
                        <option value="email" defaultValue>
                          Email
                        </option>
                        <option value="sms">SMS</option>
                      </Input>

                      <div style={{ flex: 1 }}>
                        {/* <Input
                      type="textarea"
                      id=""
                      rows="6"
                      placeholder="Enter your message here.."
                      name="message"
                      value={contact.message}
                      onChange={this._contactOnChange}
                    /> */}
                        <TextEditor
                          content={contact.message}
                          onChange={e => this._setMessageContent(e, "message")}
                        ></TextEditor>

                        <Button
                          className="BtnPurple mt-4 d-block mx-auto"
                          style={{ padding: "8px 25px" }}
                          disabled={loading.sendingMessage}
                          onClick={this._sendMessage}
                        >
                          {loading.sendingMessage ? (
                            <>
                              <i className="fa fa-spinner fa-spin mr5" />
                              &nbsp;
                            </>
                          ) : null}
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {loading.loadingData && (
                <div className="filterWrap">
                  <div className="loading-section list-loading">
                    <i className="fa fa-spinner fa-spin"></i> &nbsp; Loading
                    Invitations..
                  </div>
                </div>
              )}
              {/* Modal for "Invite Creator" */}
              <SendInviteModal
                isOpen={this.state.sendInvitationModal.isOpen}
                toggle={() => this._toggleSendInviteModal()}
                reloadInvitationList={this._getAllInvitations}
              ></SendInviteModal>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Invitations;
