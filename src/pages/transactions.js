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
  getAllCreators,
  getAllSubscribers,
  getAllTransactions,
  updateTransactions,
  getAllUsers,
} from "../http/http-calls";
import { ToastsStore } from "react-toasts";
import config from "../config";
import { format } from "date-fns";
import moment from "moment";
import { showToast, deepClone } from "../helper-methods";
import CustomDataTable from "../components/custom-data-table";

class Transactions extends Component {
  state = {
    creatorList: [],
    subscriberList: [],
    transactionList: [],
    transactionListBackup: [],
    paymentTypes: config.paymentTypes,
    paymentStatusList: config.paymentStatusList,
    headerKeys: [
      { id: "id", label: "id" },
      { id: "name", label: "Transaction" },
      { id: "amount", label: "Amount" },
      { id: "date", label: "Date" },
      { id: "subscriberName", label: "Subscriber" },
      { id: "creatorName", label: "Creator" },
      { id: "relatedContent", label: "Related Content", noSort: true },
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
      type: "",
      subscriber: "",
      creator: "",
      status: "",
      search: "",
    },
    loading: {
      loadingData: false,
      changeStatusLoading: false,
      tableLoading: false,
    },
    bulkStatus: "",
    selectedTransactions: [],
    totalCount: 0,
    transactionFieldsKeyMap: {
      name: "paymentType",
      amount: "amount",
      date: "time",
      subscriberName: "_from",
      creatorName: "_to",
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
    let { loadingData, changeStatusLoading, tableLoading } = this.state.loading;
    if (key === "data") {
      loadingData = value;
    } else if (key === "change-status") {
      changeStatusLoading = value;
    } else if (key === "table") {
      tableLoading = value;
    }
    this.setState({
      loading: { loadingData, changeStatusLoading, tableLoading },
    });
  };

  // not using now
  _getAllCreators = () => {
    // this._manageLoading('data', true);
    getAllCreators().then(
      (response) => {
        console.log(response);
        // this._manageLoading('data', false);
      },
      (error) => {
        console.log(error);
        // this._manageLoading('data', false);
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

  // not using now
  _getAllSubscribers = () => {
    // this._manageLoading("data", true);
    getAllSubscribers().then(
      (response) => {
        console.log(response);
        // this._manageLoading("data", false);
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
        this.setState({ subscriberList });
      },
      (error) => {
        console.log(error);
        // this._manageLoading("data", false);
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

  _getAllUsers = () => {
    getAllUsers().then(
      (response) => {
        console.log("response :", response);
        let creatorList = response.influencers.map((each) => {
          return {
            name: each.name.full.trim(),
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
            name: each.name.full.trim(),
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

  _getAllTransactions = (data) => {
    let { transactionList, tableConfig } = deepClone(this.state);
    if (!transactionList.length) {
      this._manageLoading("data", true);
    }
    getAllTransactions(data).then(
      (response) => {
        console.log(response);
        this._manageLoading("data", false);
        tableConfig.loading = false;
        this.setState({ tableConfig });
        let transactionListResp = response.transactions.map((each) => {
          return {
            name: each.paymentType,
            id: each._id,
            amount: each.amount ? Number(each.amount) : "-",
            date: each.time,
            subscriber: each._from,
            subscriberName:
              each._from && each._from.name ? each._from.name.full : "NA",
            creator: each._to,
            creatorName: each._to && each._to.name ? each._to.name.full : "NA",
            relatedContent: each._message || each._post,
            status: each.status,
          };
        });
        // transactionListResp = transactionListResp.sort((item1,item2)=>{
        //   return new Date(item2.date) - new Date(item1.date);
        // });
        transactionList = transactionListResp;
        this.setState({
          transactionList,
          transactionListBackup: transactionList,
          totalCount: response.count,
        });
      },
      (error) => {
        console.log(error);
        tableConfig.loading = false;
        this.setState({ tableConfig });
        this._manageLoading("data", false);
        // ToastsStore.error(error.reason);
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
    // console.log(cell, row, header);_formatDate
    if (header === "name") {
      console.log(row.name);
      return (
        <div className="capitalize">
          {row.name === "payperview"
            ? "Pay Per View"
            : row.name === "liveEvent"
            ? "Live Event"
            : row.name}
        </div>
      );
    } else if (header === "amount") {
      return typeof cell === "number" ? "$" + cell.toFixed(2) : "-";
    } else if (header === "date") {
      return (
        <>
          {this._formatDate(cell, "MMM d, yyyy")}
          <br />
          {this._formatDate(cell, "HH:mm")}
        </>
      );
    } else if (header === "subscriberName") {
      return cell ? (
        <Link to={`/subscriber-view/${row.subscriber._id}`}>
          <span>{cell}</span>
        </Link>
      ) : (
        "-"
      );
    } else if (header === "creatorName") {
      return cell ? (
        <Link to={`/creator-view/${row.creator._id}`}>
          <span>{cell}</span>
        </Link>
      ) : (
        "-"
      );
    } else if (header === "status") {
      return (
        <Input
          type="select"
          value={cell}
          className="capitalize"
          onChange={(e) => this._onUpdateTransactions(e, row)}
        >
          {this.state.paymentStatusList.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </Input>
      );
    } else if (header === "relatedContent") {
      let content = "";
      if (row.name === "message" && cell.content && cell.content[0].thumbnail) {
        content = (
          <a
            href={cell.content && cell.content[0].thumbnail}
            rel="noopener noreferrer"
            target="_blank"
          >
            Link
          </a>
        );
      } else if (
        row.name === "post" &&
        cell._contents.length &&
        cell._contents[0].thumbnail
      ) {
        content = (
          <a
            href={cell._contents[0].thumbnail}
            rel="noopener noreferrer"
            target="_blank"
          >
            Link
          </a>
        );
      } else {
        content = "-";
      }
      return content;
    } else {
      return cell;
    }
  };

  _filterOnChange = ({ currentTarget }) => {
    let { filters } = this.state;
    filters[currentTarget.name] = currentTarget.value;
    this.setState({ filters });
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

  _onUpdateTransactions({ currentTarget }, data) {
    console.log(currentTarget.value);
    let { transactionList } = this.state;
    let transaction = transactionList.find((each) => each.id === data.id);
    transaction.status = currentTarget.value;
    let dataToUpdate = {
      ids: [transaction.id],
      status: transaction.status,
    };
    console.log(dataToUpdate);
    this.setState({
      transactionList,
      transactionListBackup: transactionList,
    });
    updateTransactions(dataToUpdate).then(
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
  }

  _setSelectedRows = (data) => {
    console.log(data);
    let { selectedTransactions } = this.state;
    selectedTransactions = data;
    this.setState({ selectedTransactions });
  };

  _onBulkStatusChange = ({ currentTarget }) => {
    let { bulkStatus } = this.state;
    bulkStatus = currentTarget.value;
    this.setState({ bulkStatus });
  };

  _applyBulkStatusUpdate = () => {
    let { bulkStatus, selectedTransactions } = this.state;
    let dataToUpdate = {
      status: bulkStatus,
      ids: selectedTransactions,
    };
    if (!dataToUpdate.ids.length || !bulkStatus) {
      ToastsStore.warning(
        "Please select atleast one transaction and a status.",
        3000
      );
      return;
    } else {
      console.log(dataToUpdate);
      this._manageLoading("change-status", true);
      updateTransactions(dataToUpdate).then(
        (response) => {
          console.log(response);
          this._manageLoading("change-status", false);
          ToastsStore.success("Status changed Successfully!", 3000);
          selectedTransactions = [];
          this.setState({ selectedTransactions });
          this._getAllTransactions(this.state.tableConfig);
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
        this._getAllTransactions(this.state.tableConfig);
      });
    }, 100);
  };

  _onSortChange = (sortName, sortOrder) => {
    const { tableConfig } = deepClone(this.state);
    tableConfig.sort.sortBy = this.state.transactionFieldsKeyMap[sortName];
    tableConfig.sort.sortOrder = sortOrder;
    tableConfig.loading = true;
    this.setState({ tableConfig }, () => {
      this._getAllTransactions(tableConfig);
    });
    console.log("sortName, sortOrder :", sortName, sortOrder);
  };

  _applyFilterChanges = () => {
    const { filters, tableConfig } = deepClone(this.state);
    console.log("filters :", filters);
    let data = {};
    if (filters.type.length) {
      data.paymentType = filters.type;
    }
    if (filters.subscriber.length) {
      data._from = filters.subscriber;
    }
    if (filters.creator.length) {
      data._to = filters.creator;
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
      this._getAllTransactions(tableConfig);
    });
  };

  componentDidMount() {
    let { tableConfig } = deepClone(this.state);

    if (this.props.location.hasOwnProperty("creatorId")) {
      tableConfig.filters._to = this.props.location.creatorId;
      this.setState({ tableConfig }, () => {
        this._getAllTransactions(tableConfig);
        this._getAllUsers();
      });
    } else if (this.props.location.hasOwnProperty("subscriberId")) {
      tableConfig.filters._from = this.props.location.subscriberId;
      this.setState({ tableConfig }, () => {
        this._getAllTransactions(tableConfig);
        this._getAllUsers();
      });
    } else {
      this._getAllTransactions(tableConfig);
      this._getAllUsers();
    }
  }

  render() {
    const {
      filters,
      loading,
      subscriberList,
      creatorList,
      paymentTypes,
      paymentStatusList,
      bulkStatus,
      totalCount,
      tableConfig,
    } = this.state;

    console.log("subscriberList", subscriberList);

    return (
      <div className="app TruFansPgBg animated fadeIn">
        <Container fluid>
          <Row>
            <Col xs="12">
              <div className="PgTitle justify-content-start align-items-center">
                {/* on clicking the below btn, it should take back the user to the previous page in history */}
                {/* <Button color="ghost-dark" className="customBackBtn">
                  <i className="fa fa-arrow-left"></i>
                </Button> */}

                <h2>Transactions</h2>
              </div>
              {/* filters */}
              {!loading.loadingData && (
                <div>
                  <div className="filterWrap filterWrap-TransactionsPg">
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
                        name="type"
                        value={filters.type}
                        onChange={this._filterOnChange}
                        className="capitalize"
                      >
                        <option value="">Type</option>
                        {paymentTypes.map((option) => (
                          <option key={option} value={option}>
                            {option === "payperview"
                              ? "Pay Per View"
                              : option === "liveEvent"
                              ? "Live Event"
                              : option}
                          </option>
                        ))}
                      </Input>
                      <Input
                        type="select"
                        name="subscriber"
                        value={filters.subscriber}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Subscriber</option>
                        {subscriberList.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </Input>
                      <Input
                        type="select"
                        name="creator"
                        value={filters.creator}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Creator</option>
                        {creatorList.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </Input>
                      <Input
                        type="select"
                        name="status"
                        value={filters.status}
                        onChange={this._filterOnChange}
                        className="capitalize"
                      >
                        <option value="">Status</option>
                        {paymentStatusList.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Input>
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
                  {/* filterWrap */}
                  {/* <CustomTable
                    tableData={this.state.transactionList}
                    headerKeys={this.state.headerKeys}
                    dataFormat={this._dataFormat}
                    rowSelection={true}
                    setSelectedRows={data => this._setSelectedRows(data)}
                  ></CustomTable> */}
                  <CustomDataTable
                    tableData={this.state.transactionList}
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
                    <i className="fa fa-spinner fa-spin"></i> &nbsp; Loading
                    Transactions..
                  </div>
                </div>
              )}
            </Col>
          </Row>

          {/* The below "Row" will appear after the user selects row(s) from the above table */}
          <Row className="justify-content-center">
            <Col md="4" lg="3">
              <div className="d-flex my-5 flex-column">
                <h3 className="text-center mb-3">Change Status</h3>
                <Input
                  type="select"
                  name="bulkStatus"
                  value={bulkStatus}
                  onChange={this._onBulkStatusChange}
                  className="capitalize"
                >
                  <option value="">Select</option>
                  {paymentStatusList.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Input>
                <Button
                  className="BtnPurple mt-4 d-block mx-auto"
                  style={{ padding: "8px 25px" }}
                  onClick={this._applyBulkStatusUpdate}
                  disabled={loading.changeStatusLoading}
                >
                  {loading.changeStatusLoading ? (
                    <>
                      <i className="fa fa-spinner fa-spin mr5" />
                      &nbsp;
                    </>
                  ) : null}
                  Submit
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Transactions;
