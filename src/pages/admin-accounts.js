import React, { Component } from "react";
import {
  Container,
  Row,
  Col,
  // Table,
  Button,
  Input,
  // FormGroup,
  // Label,
  // Modal,
  // ModalBody,
  // ModalFooter,
  // ModalHeader
} from "reactstrap";
import CustomTable from "../components/custom-table";
import AddAdminModal from "../components/add-admin-modal";
import CopyclipBoard from "../components/copy-clipboard";
import { getAllAdminUsers, changeAdminStatus } from "../http/http-calls";
// import config from "../config";
import { ToastsStore } from "react-toasts";
import { format } from "date-fns";
import jwt_decode from "jwt-decode";
import { showToast } from "../helper-methods";
import { parsePhoneNumberFromString } from "libphonenumber-js";

class AdminAccounts extends Component {
  state = {
    addAdminModal: {
      isOpen: false,
      data: null,
      type: "add",
    },
    adminList: [],
    adminListBackup: [],
    addedBy: [],
    headerKeys: [
      { id: "id", label: "id" },
      { id: "name", label: "Name" },
      { id: "email", label: "Email" },
      { id: "phone", label: "Phone" },
      // { id: "type", label: "Type" },
      // { id: "lastActive", label: "Last Active" },
      { id: "status", label: "Status" },
      { id: "action", label: "Action" },
    ],
    filters: {
      addedBy: "",
      status: "",
      search: "",
    },
    loading: {
      loadingData: false,
      changeStatusLoading: false,
    },
    currentUser: jwt_decode(localStorage.socialAffilAdminToken),
  };

  _toggleModal = (type, data) => {
    console.log("_toggleModal");
    let { addAdminModal } = JSON.parse(JSON.stringify(this.state));
    addAdminModal.isOpen = !addAdminModal.isOpen;
    addAdminModal.type = type;
    addAdminModal.data = data;
    this.setState(
      {
        addAdminModal,
      },
      () => {
        console.log(this.state);
      }
    );
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

  _getAllAdminUsers = () => {
    this._manageLoading("data", true);
    getAllAdminUsers().then(
      (response) => {
        console.log(response);
        this._manageLoading("data", false);
        let adminList = response.admins.map((each) => {
          return {
            name: each.name.full,
            id: each.id,
            email: each.email,
            phone: each.phone || "-",
            addedBy: each._invitedby ? each._invitedby.name.full : "-",
            lastActive: each.lastLogin ? new Date(each.lastLogin) : "",
            lastActiveDate: each.lastLogin
              ? format(new Date(each.lastLogin), "MMM dd, yyyy")
              : "-",
            lastActiveTime: each.lastLogin
              ? format(new Date(each.lastLogin), "HH:mm")
              : "",
            status: each.isActive ? "Active" : "Inactive",
            type: each.userType,
            createdAt: each.createdAt,
          };
        });
        adminList = adminList.sort((item1, item2) => {
          return new Date(item2.createdAt) - new Date(item1.createdAt);
        });
        this.setState({
          adminList,
          adminListBackup: adminList,
          addedBy: adminList,
        });
      },
      (error) => {
        console.log(error);
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

  _onStatusUpdate = (row) => {
    console.log(row);
    let { adminList } = this.state;
    let creatorData = adminList.find((each) => each.id === row.id);
    creatorData.status =
      creatorData.status === "Active" ? "Inactive" : "Active";
    this.setState({
      adminList,
      adminListBackup: adminList,
    });
    changeAdminStatus(row.id).then(
      (response) => {
        console.log(response);
        ToastsStore.success("Status changed Successfully!", 3000);
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
      }
    );
  };

  _dataFormat = (cell, row, header) => {
    // console.log(cell, row, header);
    if (header === "action") {
      return (
        <button
          type="button"
          title="Edit"
          className="btn btn-white"
          onClick={() => this._toggleModal("edit", row)}
          // onClick={() => this._toggleModal(6)}
        >
          <i className="fa fa-pencil"></i>
        </button>
      );
    } else if (header === "type") {
      return (
        <Input
          type="select"
          value={cell}
          onChange={() => this._onStatusUpdate(row)}
          disabled={this.state.currentUser.id === row.id}
        >
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </Input>
      );
    } else if (header === "phone") {
      return row.phone !== "-" ? (
        <CopyclipBoard
          copiedValue={parsePhoneNumberFromString(
            row.phone
          ).formatInternational()}
          border="none"
        ></CopyclipBoard>
      ) : (
        "-"
      );
    } else if (header === "status") {
      return (
        <Input
          type="select"
          value={cell}
          onChange={() => this._onStatusUpdate("edit", row)}
          disabled={this.state.currentUser.id === row.id}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </Input>
      );
    } else {
      return cell;
    }
  };

  _filterOnChange = ({ currentTarget }) => {
    let { filters } = this.state;
    filters[currentTarget.name] = currentTarget.value;
    this.setState({ filters });
    if (currentTarget.name !== "search") {
      this._filterAdminList();
    }
  };

  _filterAdminList = () => {
    let filterConditions = [];
    // console.log(this.state);
    let { filters, adminListBackup, adminList } = this.state;
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        filterConditions.push(key);
      }
    });
    console.log(filterConditions);
    adminList = adminListBackup;
    if (filterConditions.length) {
      if (filters.addedBy) {
        console.log(filters.addedBy);
        adminList = adminList.filter((each) => {
          return each.addedBy.toLowerCase() === filters.addedBy.toLowerCase();
        });
      }
      if (filters.status) {
        adminList = adminList.filter((each) => {
          return each.status.toLowerCase() === filters.status.toLowerCase();
        });
      }
      if (filters.search.trim().length) {
        adminList = adminList.filter((each) => {
          return (
            each.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.email.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.phone.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.addedBy.toLowerCase().includes(filters.search.toLowerCase())
          );
        });
      }
      this.setState({ adminList });
    } else {
      this.setState({ adminList: adminListBackup });
    }
  };

  componentDidMount() {
    this._getAllAdminUsers();
  }

  render() {
    const { addedBy, filters, loading } = this.state;
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

                  <h2>Admin Users</h2>
                </div>

                {/* a modal opens on clicking the below btn */}
                <Button
                  className="BtnPurple"
                  onClick={() => this._toggleModal("add", null)}
                >
                  <i className="fa fa-plus"></i> Add
                </Button>
              </div>
              {!loading.loadingData && (
                <div>
                  {/* filters */}
                  <div className="filterWrap">
                    <div className="d-flex align-items-center">
                      <i className="fa fa-filter"></i>

                      {/* <Input
                        type="select"
                        name="addedBy"
                        value={filters.addedBy}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Type</option>
                        {addedBy.map((each, index) => (
                          <option key={index} value={each.name}>
                            {each.name}
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
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </Input>
                    </div>

                    <div className="d-flex align-items-center">
                      <Input
                        type="text"
                        id="search"
                        name="search"
                        placeholder="Search"
                        className="ml-2"
                        autoComplete="off"
                        value={filters.search}
                        onChange={this._filterOnChange}
                      />
                      <Button
                        color="secondary"
                        className="ml-2"
                        onClick={this._filterAdminList}
                      >
                        <i className="icon-magnifier"></i>
                      </Button>
                    </div>
                  </div>{" "}
                  {/* filterWrap */}
                  <CustomTable
                    tableData={this.state.adminList}
                    headerKeys={this.state.headerKeys}
                    dataFormat={this._dataFormat}
                    rowSelection={false}
                  ></CustomTable>
                </div>
              )}
              {loading.loadingData && (
                <div className="filterWrap">
                  <div className="loading-section list-loading">
                    <i className="fa fa-spinner fa-spin"></i> &nbsp; Loading
                    Admin Users..
                  </div>
                </div>
              )}
              {/* Modal for "Add Admin User" */}
              <AddAdminModal
                isOpen={this.state.addAdminModal.isOpen}
                type={this.state.addAdminModal.type}
                data={this.state.addAdminModal.data}
                toggle={() => this._toggleModal()}
                reloadAdminList={this._getAllAdminUsers}
              ></AddAdminModal>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default AdminAccounts;
