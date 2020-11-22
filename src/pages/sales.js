import React, { Component } from "react";
import {
  Container,
  Row,
  Col,
  // Table,
  Button,
  Input,
  // FormGroup,
  // Label
} from "reactstrap";
import { Link } from "react-router-dom";
import CustomTable from "../components/custom-table";
import CustomDateRangePicker from "../components/date-range-picker";
import {
  // getAllCreators,
  // getAllSubscribers,
  // getAllTransactions,
  // updateTransactions,
  getAllUsers,
  getAllPPVs,
  onUpdatePPVStatus,
  sendMessage,
} from "../http/http-calls";
import { ToastsStore } from "react-toasts";
import config from "../config";
import { format } from "date-fns";
import TextEditor from "../components/text-editor";
import moment from "moment";
import { showToast, deepClone } from "../helper-methods";
import CustomDataTable from "../components/custom-data-table";

class PayPerView extends Component {
  state = {
    ppvList: [
      {
        orderid: "",
        product: "",
        price: 123,
        salesamount: "",
        created: "",
        status: "",
      },
    ],
    ppvListBackup: [],
    creatorList: [],
    subscriberList: [],
    transactionList: [],
    transactionListBackup: [],
    paymentTypes: config.paymentTypes,
    ppvStatusList: ["published", "archived", "scheduled"],
    headerKeys: [
      { id: "id", label: "id" },
      { id: "orderid", label: "Order Id" },
      { id: "product", label: "Product" },
      { id: "price", label: "Price" },
      // { id: "sales", label: "Sales" },
      { id: "salesamount", label: "Sales Amount" },
      { id: "created", label: "Created" },
      { id: "status", label: "Status" },
    ],
    filters: {
      dateRange: {
        startDate: null,
        endDate: null,
        focusedInput: null,
        startDateId: "startDate",
        endDateId: "endDate",
      },
      viewCount: {
        upper: "",
        lower: "",
      },
      subscriber: "",
      creator: "",
      status: "",
      search: "",
    },
    loading: {
      loadingData: true,
      changeStatusLoading: false,
      tableLoading: false,
      sendingMessage: false,
    },
    contact: {
      via: "email",
      message: "",
    },
    selectedPPVs: [],
    bulkStatus: "",
    selectedTransactions: [],
    totalCount: 0,
    ppvFieldsKeyMap: {
      name: "ppv",
      fee: "price",
      date: "time",
      viewCount: "viewCount",
      creatorName: "_influencer",
      status: "status",
    },
    tableConfig: {
      pageNumber: 1,
      pageSize: 10,
      sort: {
        sortBy: "time",
        sortOrder: "desc",
      },
      filters: {},
    },
  };

  componentDidMount() {
    this._getAllUsers();
    this._getAllPPVs(this.state.tableConfig);
  }

  _getAllPPVs = (data) => {
    const { tableConfig } = this.state;
    console.log("LiveEvents -> _getLiveEvents -> tableConfig", data);
    getAllPPVs(data)
      .then((response) => {
        this._manageLoading("data", false);
        tableConfig.loading = false;
        this.setState({ tableConfig });
        console.log("response >>", response);
        let ppvListResp = response.payperviews.map((each) => {
          return {
            name: each.title,
            creatorName: each._influencer.name.full,
            id: each._id,
            flag: each._influencer.address.country,
            creatorId: each._influencer._id,
            profilePicture:
              each._influencer.profilePicture || config.defaultUserPicture,

            time: moment(each.scheduledAt).format("LLL"),

            status: each.status,

            createdAt: each.createdAt,
            viewer: each.viewCount ? each.viewCount : 0,
            basicPrice: each.price ? each.price : 0,
            premiumPrice: each.premiumPrice ? each.premiumPrice : 0,
            plusPrice: each.plusPrice ? each.plusPrice : 0,
          };
        });
        this.setState({
          // ppvList: ppvListResp,
          ppvListBackup: ppvListResp,
          totalCount: response.count,
        });
      })
      .catch((err) => {});
  };

  _formatDate(date, dateFormat) {
    return format(new Date(date), dateFormat);
  }

  _onDatesChange = (startDate, endDate) => {
    // console.log("on date change", startDate, endDate);
    let { filters } = this.state;
    filters.dateRange.startDate = startDate;
    filters.dateRange.endDate = endDate;
    this.setState({ filters });
    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      // console.log("range selction complete");
      // this._filterTransactionList();
      this._applyFilterChanges();
    }
  };

  _onFocusChange = (input) => {
    // console.log(input);
    let { filters } = this.state;
    filters.dateRange.focusedInput = input;
    this.setState({ filters });
  };

  _manageLoading = (key, value) => {
    let {
      loadingData,
      changeStatusLoading,
      tableLoading,
      sendingMessage,
    } = this.state.loading;
    if (key === "data") {
      loadingData = value;
    } else if (key === "change-status") {
      changeStatusLoading = value;
    } else if (key === "table") {
      tableLoading = value;
    } else if (key === "send-message") {
      sendingMessage = value;
    }
    this.setState({
      loading: { loadingData, changeStatusLoading, tableLoading },
    });
  };

  _getAllUsers = () => {
    getAllUsers().then(
      (response) => {
        console.log("response :", response);
        let creatorList = response.influencers.map((each) => {
          return {
            name: each.name.full,
            id: each.id,
          };
        });
        creatorList = creatorList.sort(function (a, b) {
          let textA = a.name.toLowerCase();
          let textB = b.name.toLowerCase();
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        });
        let subscriberList = response.fans.map((each) => {
          return {
            name: each.name.full,
            id: each.id,
          };
        });
        subscriberList = subscriberList.sort(function (a, b) {
          let textA = a.name.toLowerCase();
          let textB = b.name.toLowerCase();
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        });
        this.setState({ creatorList, subscriberList });
      },
      (error) => {
        console.log("error :", error);
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
    // console.log("_dataFormat -> row", row);
    // console.log("header", header);
    // console.log(cell, row, header);_formatDate
    if (header === "name") {
      return (
        <Link to={`/pay-per-view/${row.id}`}>
          <span className="capitalize">{row.name}</span>
        </Link>
      );
    } else if (header === "amount") {
      return typeof cell === "number" ? "$" + cell.toFixed(2) : "-";
    } else if (header === "date") {
      return <>{row.time}</>;
    } else if (header === "creatorName") {
      return (
        <Link to={`/creator-view/${row.creatorId}`}>
          <img
            src={`https://www.countryflags.io/${row.flag}/flat/24.png`}
            alt="flag"
            className="mr-2"
          />
          <span>{row.creatorName}</span>
        </Link>
      );
    } else if (header === "viewCount") {
      return <span>{row.viewer}</span>;
    } else if (header === "status") {
      return (
        <Input
          type="select"
          value={cell}
          className="capitalize"
          onChange={(e) => this._onUpdatePPVStatus(e, row)}
        >
          {this.state.ppvStatusList.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </Input>
      );
    } else if (header === "fee") {
      console.log(row);
      return (
        <p>
          <span title="Basic" style={{ textDecoration: "none" }}>
            {row.basicPrice && Number.isInteger(row.basicPrice)
              ? "$" + row.basicPrice
              : row.basicPrice === 0
              ? 0
              : "$" + row.basicPrice.toFixed(2)}
          </span>
          &nbsp; &nbsp;
          <span title="Plus" style={{ textDecoration: "none" }}>
            {row.plusPrice && Number.isInteger(row.plusPrice)
              ? "$" + row.plusPrice
              : row.plusPrice === 0
              ? 0
              : "$" + row.plusPrice.toFixed(2)}
          </span>
          &nbsp; &nbsp;
          <span title="Premium" style={{ textDecoration: "none" }}>
            {row.premiumPrice && Number.isInteger(row.premiumPrice)
              ? "$" + row.premiumPrice
              : row.premiumPrice === 0
              ? 0
              : "$" + row.premiumPrice.toFixed(2)}
          </span>
        </p>
      );
    } else {
      return cell;
    }
  };

  _onUpdatePPVStatus({ currentTarget }, data) {
    let { ppvList } = deepClone(this.state);
    let ppv = ppvList.find((each, index) => each.id === data.id);
    ppv.status = currentTarget.value;
    let dataToUpdate = {
      id: data.id,
      status: ppv.status,
    };
    console.log(dataToUpdate);
    this.setState({
      ppvList,
      ppvListBackup: ppvList,
    });
    onUpdatePPVStatus(dataToUpdate).then(
      (response) => {
        console.log(response);
        ToastsStore.success("Status changed Successfully!", 3000);
      },
      (error) => {
        console.log(error);
        // ToastsStore.error(error.reason, 3000);
        this._getAllPPVs();
        showToast(
          error.reason && error.reason.length
            ? error.reason
            : "Server error. Try again after sometime.",
          "error"
        );
      }
    );
  }

  _filterOnChange = ({ currentTarget }) => {
    let { filters } = this.state;

    if (currentTarget.name === "viewCount") {
      let breakviewCountNumber = currentTarget.value.split("-");
      filters[currentTarget.name].upper = breakviewCountNumber[1];
      filters[currentTarget.name].lower = breakviewCountNumber[0];
    } else {
      filters[currentTarget.name] = currentTarget.value;
    }

    this.setState({ filters }, () => {
      console.log("filters :", filters);
    });
    if (currentTarget.name !== "search") {
      // this._filterTransactionList();
      this._applyFilterChanges();
    }
  };

  // old function for frontend filtering - not using now
  _filterTransactionList = () => {
    let filterConditions = [];
    // console.log(this.state);
    let { filters, transactionListBackup, transactionList } = this.state;
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        filterConditions.push(key);
      }
    });
    // console.log(filterConditions);
    transactionList = transactionListBackup;
    if (filterConditions.length) {
      if (filters.dateRange.startDate && filters.dateRange.endDate) {
        transactionList = transactionList.filter((each) => {
          // console.log('====>>',filters.dateRange.startDate.toDate(), each.date, isAfter((filters.dateRange.startDate.toDate()), each.date))
          // return (filters.dateRange.startDate.toDate()) >= new Date(each.date);
          return moment(moment(each.date).format("YYYY-MM-DD")).isBetween(
            filters.dateRange.startDate.format("YYYY-MM-DD"),
            filters.dateRange.endDate.format("YYYY-MM-DD"),
            null,
            "[]"
          );
        });
      }
      if (filters.type) {
        transactionList = transactionList.filter((each) => {
          return each.name.toLowerCase() === filters.type.toLowerCase();
        });
      }
      if (filters.subscriber) {
        transactionList = transactionList.filter((each) => {
          return each.subscriber.id === filters.subscriber;
        });
      }
      if (filters.creator) {
        transactionList = transactionList.filter((each) => {
          return each.creator.id === filters.creator;
        });
      }
      if (filters.status) {
        transactionList = transactionList.filter((each) => {
          return each.status.toLowerCase() === filters.status.toLowerCase();
        });
      }
      if (filters.search.trim().length) {
        transactionList = transactionList.filter((each) => {
          return (
            each.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.subscriberName
              .toLowerCase()
              .includes(filters.search.toLowerCase()) ||
            each.creatorName
              .toLowerCase()
              .includes(filters.search.toLowerCase()) ||
            each.status.toLowerCase().includes(filters.search.toLowerCase())
          );
        });
      }
      this.setState({ transactionList });
    } else {
      this.setState({ transactionList: transactionListBackup });
    }
  };

  _setSelectedRows = (data) => {
    console.log(data);
    let { selectedPPVs } = this.state;
    selectedPPVs = data;
    this.setState({ selectedPPVs });
  };

  _onBulkStatusChange = ({ currentTarget }) => {
    let { bulkStatus } = this.state;
    bulkStatus = currentTarget.value;
    this.setState({ bulkStatus });
  };

  _paginate = (pageNumber, pageSize) => {
    console.log("pageNumber, pageSize :", pageNumber, pageSize);
    const { tableConfig } = this.state;
    tableConfig.pageNumber = pageNumber;
    tableConfig.pageSize = pageSize;
    tableConfig.loading = true;
    setTimeout(() => {
      this.setState({ tableConfig }, () => {
        this._getAllPPVs(this.state.tableConfig);
      });
    }, 100);
  };

  _onSortChange = (sortName, sortOrder) => {
    const { tableConfig } = deepClone(this.state);
    tableConfig.sort.sortBy = this.state.ppvFieldsKeyMap[sortName];
    tableConfig.sort.sortOrder = sortOrder;
    tableConfig.loading = true;
    this.setState({ tableConfig }, () => {
      this._getAllPPVs(tableConfig);
    });
    console.log("sortName, sortOrder :", sortName, sortOrder);
  };

  _applyFilterChanges = () => {
    const { filters, tableConfig } = deepClone(this.state);
    console.log("filters :", filters);
    let data = {
      viewCount: {},
    };

    if (filters.viewCount.upper || filters.viewCount.lower) {
      data.viewCount.upper = filters.viewCount.upper;
      data.viewCount.lower = filters.viewCount.lower;
    }

    if (filters.creator.length) {
      data._influencer = filters.creator;
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
      this._getAllPPVs(tableConfig);
    });
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
    let { contact, selectedPPVs } = this.state;
    let data = {
      idlist: selectedPPVs,
      text:
        contact.via === "email"
          ? contact.message
          : this._extractContent(contact.message),
    };
    if (data.idlist && !data.idlist.length) {
      ToastsStore.warning("Please select atleast one creator", 3000);
      return;
    }
    if (!data.text.trim().length) {
      ToastsStore.warning("Please write some message", 3000);
      return;
    }
    console.log(data);
    this._manageLoading("send-message", true);
    sendMessage(contact.via, data).then(
      (response) => {
        console.log(response);
        this._setMessageContent("", "message");
        this._manageLoading("send-message", false);
        ToastsStore.success("Message sent Successfully!", 3000);
      },
      (error) => {
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

  _contactOnChange = ({ currentTarget }) => {
    let { contact } = this.state;
    contact[currentTarget.name] = currentTarget.value;
    this.setState({ contact });
  };

  render() {
    const {
      filters,
      loading,
      creatorList,
      contact,
      totalCount,
      tableConfig,
      ppvStatusList,
    } = this.state;

    console.log(loading);

    return (
      <div className="app TruFansPgBg animated fadeIn">
        <Container fluid>
          <Row>
            <Col xs="12">
              <div className="PgTitle justify-content-start align-items-center">
                <h2>Sales</h2>
              </div>
              {/* filters */}
              {!loading.loadingData && (
                <div>
                  <div className="filterWrap filterWrap-TransactionsPg">
                    <div className="d-flex align-items-center">
                      <i className="fa fa-filter"></i>
                      <Input
                        type="select"
                        name="creator"
                        value={filters.creator}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Category</option>
                        {creatorList.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </Input>
                      <div className="ml-2">
                        <CustomDateRangePicker
                          dateRange={filters.dateRange}
                          onDatesChange={this._onDatesChange}
                          onFocusChange={this._onFocusChange}
                        ></CustomDateRangePicker>
                      </div>
                      {/* 
                      <Input
                        type="select"
                        name="status"
                        value={filters.status}
                        onChange={this._filterOnChange}
                        className="capitalize"
                      >
                        <option value="">Status</option>
                        {ppvStatusList.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Input> */}
                      {/* <Input
                        type="select"
                        name="viewCount"
                        value={filters.viewCountNumber}
                        onChange={this._filterOnChange}
                        className="capitalize"
                      >
                        <option value="">Viewers</option>
                        <option value="0-0">0</option>
                        <option value="1-10">1 - 10</option>
                        <option value="11-50">11 - 50</option>
                        <option value="51-100">51 - 200</option>
                        <option value="201-500">201 - 500</option>
                        <option value="0-500">500+</option>
                      </Input> */}
                    </div>

                    <div className="d-flex align-items-center mt-md-3 mt-xl-0">
                      <Input
                        type="text"
                        id="search"
                        placeholder="Search"
                        className="ml-2"
                        name="search"
                        autoComplete="off"
                        value={filters.search}
                        onChange={this._filterOnChange}
                      />

                      <Button
                        color="secondary"
                        className="ml-2"
                        onClick={() => this._applyFilterChanges()}
                      >
                        <i className="icon-magnifier"></i>
                      </Button>
                    </div>
                  </div>{" "}
                  <CustomDataTable
                    tableData={this.state.ppvList}
                    headerKeys={this.state.headerKeys}
                    dataFormat={this._dataFormat}
                    totalCount={totalCount}
                    rowSelection={true}
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
                    <i className="fa fa-spinner fa-spin"></i> &nbsp; Loading Pay
                    per view..
                  </div>
                </div>
              )}
            </Col>
          </Row>

          {/* The below "Row" will appear after the user selects row(s) from the above table */}
          <Row className="justify-content-center">
            <Col md="12" lg="12">
              <div className="d-flex my-5 flex-column w-75 mx-auto">
                <div className="d-flex justify-content-between">
                  <p>Send Reminder</p>
                  <Input
                    type="select"
                    style={{
                      width: "175px",
                      marginLeft: "40px",
                      marginRight: "40px",
                    }}
                    name="via"
                    value={contact.via}
                    onChange={this._contactOnChange}
                    className="capitalize"
                  >
                    <option value="email">Email</option>
                    <option value="push">Push</option>
                  </Input>

                  <div style={{ flex: 1 }}>
                    <TextEditor
                      content={contact.message}
                      onChange={(e) => this._setMessageContent(e, "message")}
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
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default PayPerView;
