import React, { Component } from "react";
import { Container, Row, Col, Button, Input } from "reactstrap";

import CustomTable from "../components/custom-table";
import CustomDateRangePicker from "../components/date-range-picker";
import {
  getAllCreators,
  getAllPayouts,
  updatePayout,
  getAllUsers,
  editPayoutStatus,
} from "../http/http-calls";
import { ToastsStore } from "react-toasts";
import config from "../config";
import { format } from "date-fns";
import moment from "moment";
import { showToast, deepClone, sleepTime } from "../helper-methods";
import RejectPayoutReasonModal from "../components/reject-payout-reason-modal";
import CustomDataTable from "../components/custom-data-table";
import CopyclipBoard from "../components/copy-clipboard";
import { Link } from "react-router-dom";
import { parsePhoneNumberFromString } from "libphonenumber-js";
class Payouts extends Component {
  state = {
    creatorList: [],
    payoutList: [],
    payoutListBackup: [],
    payoutStatusList: config.withdrawalStatus,
    headerKeys: [
      { id: "id", label: "id" },
      { id: "date", label: "Date" },
      { id: "name", label: "Person" },
      { id: "type", label: "Type" },
      { id: "amount", label: "Amount" },
      { id: "status", label: "Status" },
      // { id: "phone", label: "Phone" },
      // { id: "lastUpdated", label: "Last Updated" },
    ],
    filters: {
      dateRange: {
        startDate: null,
        endDate: null,
        focusedInput: null,
        startDateId: "startDate",
        endDateId: "endDate",
      },
      creator: "",
      status: "",
      search: "",
    },
    loading: {
      loadingData: false,
      changeStatusLoading: false,
    },
    lastUpdatedData: null,
    totalCount: 0,
    payoutFieldsKeyMap: {
      name: "_from",
      email: "email",
      phone: "phone",
      amount: "amount",
      date: "createdAt",
      status: "status",
      lastUpdated: "updatedAt",
    },
    tableConfig: {
      pageNumber: 1,
      pageSize: 10,
      sort: {
        sortBy: "createdAt",
        sortOrder: "desc",
      },
      filters: {},
    },
  };

  _onDatesChange = (startDate, endDate) => {
    let { filters } = this.state;
    filters.dateRange.startDate = startDate;
    filters.dateRange.endDate = endDate;
    this.setState({ filters });
    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      // this._filterPayoutList();
      this._applyFilterChanges();
    }
  };

  _onFocusChange = (input) => {
    let { filters } = this.state;
    filters.dateRange.focusedInput = input;
    this.setState({ filters });
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

  _formatDate(date, dateFormat) {
    return date ? format(new Date(date), dateFormat) : "N/A";
  }

  //not using now
  // _getAllCreators = () => {
  //   // this._manageLoading('data', true);
  //   getAllCreators().then(
  //     (response) => {
  //       // this._manageLoading('data', false);
  //       let creatorList = response.influencers.map((each) => {
  //         return {
  //           name: each.name.full,
  //           id: each.id,
  //         };
  //       });
  //       creatorList = creatorList.sort(function (a, b) {
  //         let textA = a.name.toLowerCase();
  //         let textB = b.name.toLowerCase();
  //         return textA < textB ? -1 : textA > textB ? 1 : 0;
  //       });
  //       this.setState({ creatorList });
  //     },
  //     (error) => {
  //       console.log(error);
  //       // this._manageLoading('data', false);
  //       // ToastsStore.error(error.reason, 3000);
  //       showToast(
  //         error.reason && error.reason.length
  //           ? error.reason
  //           : "Server error. Try again after sometime.",
  //         "error"
  //       );
  //     }
  //   );
  // };

  // _getAllUsers = () => {
  //   getAllUsers().then(
  //     (response) => {
  //       console.log("response :", response);
  //       let creatorList = response.influencers.map((each) => {
  //         return {
  //           name: each.name.full,
  //           id: each.id,
  //         };
  //       });
  //       creatorList = creatorList.sort(function (a, b) {
  //         let textA = a.name.toLowerCase();
  //         let textB = b.name.toLowerCase();
  //         return textA < textB ? -1 : textA > textB ? 1 : 0;
  //       });
  //       this.setState({ creatorList });
  //     },
  //     (error) => {
  //       console.log("error :", error);
  //       showToast(
  //         error.reason && error.reason.length
  //           ? error.reason
  //           : "Server error. Try again after sometime.",
  //         "error"
  //       );
  //     }
  //   );
  // };

  _dataFormat = (cell, row, header) => {
    // console.log(cell, row, header);_formatDate
    if (header === "name") {
      return (
        <Link to={`/creator-view/${row.creatorId}`}>
          <div className="d-flex justify-content-start align-items-center">
            {/* <div className="personImgWrap">
              <img
                className="personImg"
                src={row.profilePicture || config.defaultUserPicture}
                alt="Profile Thumbnail"
              />
            </div> */}
            {cell}
          </div>
        </Link>
      );
    } else if (header === "type") {
      return (
        // <CopyclipBoard copiedValue={row.email} border="none"></CopyclipBoard>
        <CopyclipBoard copiedValue={"seller"} border="none"></CopyclipBoard>
      );
    } else if (header === "phone") {
      return (
        <CopyclipBoard
          copiedValue={parsePhoneNumberFromString(
            row.phone
          ).formatInternational()}
          border="none"
        ></CopyclipBoard>
      );
    } else if (header === "date" || header === "lastUpdated") {
      return cell ? (
        <>
          {this._formatDate(cell, "MMM d, yyyy")}
          &nbsp;
          {this._formatDate(cell, "HH:mm")}
        </>
      ) : (
        "-"
      );
    } else if (header === "status") {
      return (
        <Input
          type="select"
          value={cell === "admin-rejected" ? "rejected" : cell}
          className="capitalize"
          onChange={(e) => this._updatePayout(e, row)}
        >
          {this.state.payoutStatusList.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </Input>
      );
    } else if (header === "amount") {
      return "$" + cell.toFixed(2);
    } else {
      return cell;
    }
  };

  _getAllPayouts = (data) => {
    let { payoutList, tableConfig } = deepClone(this.state);
    if (!payoutList.length) {
      this._manageLoading("data", true);
    }
    getAllPayouts().then(
      (response) => {
        console.log(response)
        this._manageLoading("data", false);
        tableConfig.loading = false;
        this.setState({ tableConfig });
        let payoutListResp = response.payouts.map((each) => {
          return {
            name: each._user.name.last?each._user.name.full:each._user.name.last,
            creatorId: each._user.id,
            // email: each._from.email,
            // phone: each._from.phone || "-",
            // profilePicture: each._from.profilePicture,
            id: each.id,
            amount: each.amount ? each.amount : 0,
            date: each.createdAt,
            status: each.status,
            lastUpdated: each.updatedAt,
          };
        });
        // payoutList = payoutList.sort((item1,item2)=>{
        //   return new Date(item2.date) - new Date(item1.date);
        // })
        this.setState({
          payoutList: payoutListResp,
          payoutListBackup: payoutListResp,
          totalCount: response.count,
        });
      },
      (error) => {
        console.log(error);
        this._manageLoading("data", false);
        tableConfig.loading = false;
        this.setState({ tableConfig });
      }
    );
  };

  _filterOnChange = ({ currentTarget }) => {
    let { filters } = this.state;
    filters[currentTarget.name] = currentTarget.value;
    this.setState({ filters });
    if (currentTarget.name !== "search") {
      // this._applyFilterChanges();
      this._filterPayoutList();
    }
  };

  _filterPayoutList = () => {
    let filterConditions = [];
    let { filters, payoutListBackup, payoutList } = this.state;
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        filterConditions.push(key);
      }
    });
    // console.log(filterConditions);
    payoutList = payoutListBackup;
    if (filterConditions.length) {
      if (
        filters.dateRange &&
        filters.dateRange.startDate &&
        filters.dateRange.endDate
      ) {
        console.log("date range checking :");
        payoutList = payoutList.filter((each) => {
          // return (filters.dateRange.startDate.toDate()) >= new Date(each.date);
          return moment(moment(each.date).format("YYYY-MM-DD")).isBetween(
            filters.dateRange.startDate.format("YYYY-MM-DD"),
            filters.dateRange.endDate.format("YYYY-MM-DD"),
            null,
            "[]"
          );
        });
      }
      if (filters.creator) {
        console.log("sent by checking :");

        payoutList = payoutList.filter((each) => {
          return each.creatorId === filters.creator;
        });
      }
      if (filters.status) {
        console.log("status checking :");

        payoutList = payoutList.filter((each) => {
          return each.status.toLowerCase() === filters.status.toLowerCase();
        });
      }
      if (filters.search.trim().length) {
        payoutList = payoutList.filter((each) => {
          return (
            each.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.email.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.phone.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.status.toLowerCase().includes(filters.search.toLowerCase())
          );
        });
      }
      this.setState({ payoutList });
    } else {
      this.setState({ payoutList: payoutListBackup });
    }
  };

  _closeRejectPayoutReasonModal = () => {
    let { payoutList, lastUpdatedData } = deepClone(this.state);

    let payout = payoutList.find((each) => each.id === lastUpdatedData.id);
    payout.status = lastUpdatedData.status;
    this.setState({
      payoutList,
      payoutListBackup: payoutList,
      lastUpdatedData: null,
      showRejectPayoutReasonModal: false,
    });
  };

  _saveRejectPayoutReasonModal = (text, payout) => {
    console.log("TCL: _saveRejectPayoutReasonModal -> payout", payout);
    let dataToUpdate = {
      status: "rejected",
      reason: text,
    };
    let { payoutList, lastUpdatedData } = deepClone(this.state);

    // let changedPayout = payoutList.find(each => each.id === lastUpdatedData.id);
    // changedPayout.status = payout.status;
    this.setState(
      {
        payoutList,
        payoutListBackup: payoutList,
        lastUpdatedData: null,
        showRejectPayoutReasonModal: false,
      },
      () => {
        this._makeUpdatePayoutAPICall(payout.id, dataToUpdate);
      }
    );
  };

  _makeUpdatePayoutAPICall = (id, data) => {
    editPayoutStatus(id, data).then(
      (response) => {
        console.log(response);
        ToastsStore.success("Status changed Successfully!", 3000);
      },
      (error) => {
        console.log(error);
        this._closeRejectPayoutReasonModal();
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

  _updatePayout = ({ currentTarget }, data) => {
    let { payoutList } = deepClone(this.state);
    let payoutIndex = payoutList.findIndex((each, index) => {
      return each.id === data.id;
    });
    if (payoutIndex >= 0) {
      payoutList[payoutIndex]["status"] = currentTarget.value;
      this.setState(
        {
          lastUpdatedData: data,
          payoutList,
          payoutListBackup: payoutList,
        },
        () => {
          if (currentTarget.value === "rejected") {
            this.setState({ showRejectPayoutReasonModal: true });
          } else {
            this._makeUpdatePayoutAPICall(data.id, {
              status: currentTarget.value,
            });
          }
        }
      );
    }
  };

  _paginate = (pageNumber, pageSize) => {
    console.log("pageNumber, pageSize :", pageNumber, pageSize);
    const { tableConfig } = this.state;
    tableConfig.pageNumber = pageNumber;
    tableConfig.pageSize = pageSize;
    tableConfig.loading = true;
    setTimeout(() => {
      this.setState({ tableConfig }, () => {
        this._getAllPayouts(this.state.tableConfig);
      });
    }, 100);
  };

  _onSortChange = (sortName, sortOrder) => {
    const { tableConfig } = deepClone(this.state);
    tableConfig.sort.sortBy = this.state.payoutFieldsKeyMap[sortName];
    tableConfig.sort.sortOrder = sortOrder;
    tableConfig.loading = true;
    this.setState({ tableConfig }, () => {
      this._getAllPayouts(tableConfig);
    });
    console.log("sortName, sortOrder :", sortName, sortOrder);
  };

  _applyFilterChanges = () => {
    const { filters, tableConfig } = deepClone(this.state);
    console.log("filters :", filters);
    let data = {};
    if (filters.creator.length) {
      data._from = filters.creator;
    }
    if (filters.status.length) {
      data.status = filters.status;
    }
    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      data.start = filters.dateRange.startDate.toISOString();
      data.end = filters.dateRange.endDate.toISOString();
    }
    console.log("data :", data);
    tableConfig.filters = data;
    if (filters.search.length) {
      tableConfig.search = filters.search;
    } else {
      tableConfig.search = "";
    }
    tableConfig.loading = true;
    this.setState({ tableConfig }, () => {
      this._getAllPayouts(tableConfig);
    });
  };

  componentDidMount() {
    // this._getAllCreators();
    // this._getAllUsers();
    this._getAllPayouts(this.state.tableConfig);
  }
  render() {
    let {
      payoutStatusList,
      filters,
      creatorList,
      loading,
      showRejectPayoutReasonModal,
      lastUpdatedData,
      totalCount,
      tableConfig,
    } = this.state;
    return (
      <div className="app TruFansPgBg animated fadeIn">
        <RejectPayoutReasonModal
          isVisible={showRejectPayoutReasonModal}
          lastUpdatedData={lastUpdatedData}
          onDismiss={this._closeRejectPayoutReasonModal}
          onSave={this._saveRejectPayoutReasonModal}
        />
        <Container fluid>
          <Row>
            <Col xs="12">
              <div className="PgTitle justify-content-start align-items-center">
                {/* on clicking the below btn, it should take back the user to the previous page in history */}
                {/* <Button color="ghost-dark" className="customBackBtn">
                  <i className="fa fa-arrow-left"></i>
                </Button> */}

                <h2>Payouts</h2>
              </div>

              {/* filters */}
              {!loading.loadingData && (
                <div>
                  <div className="filterWrap">
                    <div className="d-flex align-items-center">
                      <i className="fa fa-filter"></i>
                      {/* there will be a "Date Range" below in place of an input field */}
                      {/* <Input type="text" id="" placeholder="Date Range" className="ml-2" /> */}
                      <div className="ml-2">
                        <CustomDateRangePicker
                          dateRange={filters.dateRange}
                          onDatesChange={this._onDatesChange}
                          onFocusChange={this._onFocusChange}
                        ></CustomDateRangePicker>
                      </div>

                      {/* <Input
                        type="select"
                        name="creator"
                        value={filters.creator}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Creators</option>
                        {creatorList.map((creator, index) => (
                          <option key={index} value={creator.id}>
                            {creator.name}
                          </option>
                        ))}
                      </Input> */}
                      <Input
                        type="select"
                        name="creator"
                        value={filters.creator}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Seller</option>
                        {/* {subscriptionCounts.map((option, index) => (
                          <option key={index} value={index}>
                            {option.label}
                          </option>
                        ))} */}
                      </Input>
                      <Input
                        type="select"
                        name="creator"
                        value={filters.creator}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Influencer</option>
                        {/* {subscriptionCounts.map((option, index) => (
                          <option key={index} value={index}>
                            {option.label}
                          </option>
                        ))} */}
                      </Input>
                      <Input
                        type="select"
                        name="status"
                        className="capitalize"
                        value={filters.status}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Status</option>
                        {payoutStatusList.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Input>
                    </div>

                    <div className="d-flex align-items-center">
                      <Input
                        type="text"
                        id=""
                        placeholder="Search"
                        name="search"
                        className="ml-2"
                        value={filters.search}
                        onChange={this._filterOnChange}
                      />

                      <Button
                        type="button"
                        color="secondary"
                        className="ml-2"
                        onClick={() => this._applyFilterChanges()}
                      >
                        <i className="icon-magnifier"></i>
                      </Button>
                    </div>
                  </div>{" "}
                  {/* filterWrap */}
                  {/* <CustomTable
                    tableData={this.state.payoutList}
                    headerKeys={this.state.headerKeys}
                    dataFormat={this._dataFormat}
                    rowSelection={false}
                    setSelectedRows={data => this._setSelectedRows(data)}
                  ></CustomTable> */}
                  <CustomDataTable
                    tableData={this.state.payoutList}
                    headerKeys={this.state.headerKeys}
                    dataFormat={this._dataFormat}
                    totalCount={totalCount}
                    rowSelection={false}
                    onPaginate={(pageNumber, pageSize) =>
                      this._paginate(pageNumber, pageSize)
                    }
                    onSortChange={(sortName, sortOrder) =>
                      this._onSortChange(sortName, sortOrder)
                    }
                    setSelectedRows={(data) => this._setSelectedRows(data)}
                    showTableLoading={tableConfig.loading}
                  ></CustomDataTable>
                </div>
              )}
              {loading.loadingData && (
                <div className="filterWrap">
                  <div className="loading-section list-loading">
                    <i className="fa fa-spinner fa-spin"></i> &nbsp; Loading
                    Payouts..
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Payouts;
