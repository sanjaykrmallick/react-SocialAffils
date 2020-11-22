import moment from "moment";
import React, { Component } from "react";
import { ToastsStore } from "react-toasts";
import { Button, Col, Container, Input, Row } from "reactstrap";
import CustomPrompt from "../components/custom-prompt";
import CustomTable from "../components/custom-table";
import CustomDateRangePicker from "../components/date-range-picker";
import SendInviteModal from "../components/send-invite-modal";
import CopyclipBoard from "../components/copy-clipboard";
import config from "../config";
import {
  getInvitationRequests,
  sendMessage,
  acceptOrRejectInvitationRequest
} from "../http/http-calls";
import { deepClone, sleepTime, showToast } from "../helper-methods";
import { parsePhoneNumberFromString } from "libphonenumber-js";


class CreatorRequests extends Component {
  state = {
    isPrompt: false,
    promptMessage: "",
    promptType: "",
    selectedCreator: null,
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
      { id: "description", label: "Why" },
      { id: "social", label: "Social" },
      { id: "status", label: "Status" },
      { id: "actions", label: "Actions", noSort: true }
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

  componentDidMount() {
    this._getAllInvitations();
  }

  _onDatesChange = async (startDate, endDate) => {
    let { filters } = this.state;
    // await sleepTime(200);
    filters.dateRange.startDate = startDate;
    filters.dateRange.endDate = endDate;

    this.setState({ filters }, () => {
      if (filters.dateRange.startDate && filters.dateRange.endDate) {
        this._filterInvitationList();
      }
    });
  };

  _onFocusChange = input => {
    let { filters } = deepClone(this.state);
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

  _acceptRequest = creator => {
    this.setState({
      promptMessage:
        "Do you want to accept the request of " + creator.name + " ?",
      isPrompt: true,
      promptType: "accepted",
      selectedCreator: creator
    });
  };

  _rejectRequest = creator => {
    this.setState({
      promptMessage:
        "Do you want to reject the request of " + creator.name + " ?",
      isPrompt: true,
      promptType: "rejected",
      selectedCreator: creator
    });
  };

  _openSocialLink = (link = null, socialName) => {
    if (link && link.length) {
      if (socialName === 'tiktok') {
        let splittedLinks = link.split('/');
        if (splittedLinks[splittedLinks.length - 1].charAt(0) !== '@') {
          splittedLinks[splittedLinks.length - 1] = '@' + splittedLinks[splittedLinks.length - 1];
          link = splittedLinks.join('/');
        }
        console.log("_openSocialLink -> splittedLinks", splittedLinks)
      }
      if (link.indexOf("http") > -1 || link.indexOf("https") > -1) {
        window.open(link, "_blank");
      } else {
        link = "https://" + link;
        window.open(link, "_blank");
      }
    } else {
      showToast("No valid link present", "error");
    }
  };

  _dataFormat = (cell, row, header) => {
    if (header === "social") {
      return (
        <span style={{ display: "flex", flexWrap: "wrap" }}>
          {cell.map((each, index) => (
            <button
              key={index}
              className="btn btn-link"
              title={each.accountUrl}
              onClick={() => this._openSocialLink(each.accountUrl, each.name)}
            >
              {each.hasOwnProperty("name") ? (
                each.name !== "tiktok" ? (
                  <i className={"fa fa-" + each.name}></i>
                ) : each.name === "tiktok" ? (
                  <img
                    style={{ height: "20px" }}
                    src="/assets/img/tiktok-icon.png"
                  />
                ) : null
              ) : null}
            </button>
          ))}
        </span>
      );
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
    } else if (header === "actions") {
      return row.status === "pending" ? (
        <div>
          <button
            onClick={() => this._acceptRequest(row)}
            className="btn btn-success py-1 mr-2"
          >
            Accept
          </button>
          <button
            onClick={() => this._rejectRequest(row)}
            className="btn btn-danger py-1"
          >
            Reject
          </button>
        </div>
      ) : (
          <span style={{ textDecoration: "none" }}>N/A</span>
        );
    } else if (header === "description") {
      return (
        <>
          <button className="btn btn-light py-1" title={cell}>
            Details
          </button>
        </>
      );
    } else if (header === "status") {
      return (
        <span style={{ textTransform: "capitalize", textDecoration: "none" }}>
          {row.status}
        </span>
      );
    } else {
      return cell;
    }
  };

  _getAllInvitations = () => {
    this._manageLoading("data", true);
    getInvitationRequests().then(
      response => {
        this._manageLoading("data", false);

        let invitationList = response.invitationRequests.map(each => {
          return {
            name:
              each.name && each.name.full && each.name.full.length
                ? each.name.full
                : "N/A",

            id: each._id,
            email: each.email,
            phone: each.phone || "-",
            description:
              each.description && each.description.length
                ? each.description
                : "",
            date: each.time,
            status: each.status,
            social: each.social
          };
        });
        invitationList = invitationList.sort((item1, item2) => {
          return new Date(item2.date) - new Date(item1.date);
        })
        // let sentByList = invitationList
        //   .map(item => item.invitedBy)
        //   .filter((value, index, self) => self.indexOf(value) === index);
        this.setState({
          invitationList: invitationList,
          invitationListBackup: invitationList
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
    this.setState({ filters }, () => {
      if (currentTarget.name !== "search") {
        this._filterInvitationList();
      }
    });
  };

  _filterInvitationList = () => {
    let filterConditions = [];
    let { filters, invitationListBackup, invitationList } = deepClone(
      this.state
    );
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        filterConditions.push(key);
      }
    });
    invitationList = invitationListBackup;
    if (filterConditions.length) {
      if (filters.status && filters.status.length) {
        invitationList = invitationList.filter(each => {
          return each.status.toLowerCase() === filters.status.toLowerCase();
        });
      }
      if (filters && filters.search && filters.search.trim().length) {
        invitationList = invitationList.filter(each => {
          return (
            each.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.email.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.phone.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.description
              .toLowerCase()
              .includes(filters.search.toLowerCase())
          );
        });
      }

      if (filters.dateRange.startDate && filters.dateRange.endDate) {
        invitationList = invitationList.filter(each => {
          return (
            each.hasOwnProperty("date") &&
            moment(each.date).isBetween(
              moment(filters.dateRange.startDate).format("YYYY-MM-DD"),
              moment(filters.dateRange.endDate).format("YYYY-MM-DD"),
              null,
              "[]"
            )
          );
        });
      }
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

  _onPromptSuccess = type => {
    const { selectedCreator } = this.state;
    this.setState(
      {
        isPrompt: false
      },
      () => {
        this._manageLoading("Loading", true);
        this._actionTakenForInvitationRequest(selectedCreator.id, type);
      }
    );
  };

  _onPromptDismiss = () => {
    this.setState({
      isPrompt: false
    });
  };

  _actionTakenForInvitationRequest = (id, status) => {
    acceptOrRejectInvitationRequest(id, { status: status })
      .then(res => {
        ToastsStore.success("Updated successfully!", 3000);
        this._getAllInvitations();
      })
      .catch(error => {
        this._manageLoading("send-message", false);
        // ToastsStore.error(error.reason, 3000);
        showToast(
          error.reason && error.reason.length
            ? error.reason
            : "Server error. Try again after sometime.",
          "error"
        );
      });
  };

  render() {
    const {
      filters,
      loading,
      sentByList,
      contact,
      invitationRequests,
      isPrompt,
      promptMessage,
      promptType
    } = this.state;
    return (
      <div className="app TruFansPgBg animated fadeIn">
        <CustomPrompt
          isVisible={isPrompt}
          message={promptMessage}
          successButtonText={"Yes"}
          closeButtonText={"No"}
          onSuccess={() => this._onPromptSuccess(promptType)}
          onDismiss={() => this._onPromptDismiss()}
        />
        <Container fluid>
          <Row>
            <Col xs="12">
              <div className="PgTitle">
                <div className="d-flex justify-content-start align-items-center">
                  {/* on clicking the below btn, it should take back the user to the previous page in history */}
                  {/* <Button color="ghost-dark" className="customBackBtn">
                    <i className="fa fa-arrow-left"></i>
                  </Button> */}
                  <h2>Creator Requests</h2>
                </div>

                {/* a modal open on clicking the below btn */}
                {/* <Button
                  className="BtnPurple"
                  onClick={() => this._toggleSendInviteModal()}
                >
                  <i className="fa fa-plus"></i> Invite
                </Button> */}
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
                      {/* <div className="ml-2">
                        <CustomDateRangePicker
                          dateRange={filters.dateRange}
                          onDatesChange={this._onDatesChange}
                          onFocusChange={this._onFocusChange}
                        ></CustomDateRangePicker>
                      </div> */}

                      {/* <Input
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
                      </Input> */}
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
                    rowSelection={false}
                    setSelectedRows={data => this._setSelectedRows(data)}
                  ></CustomTable>
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

export default CreatorRequests;
