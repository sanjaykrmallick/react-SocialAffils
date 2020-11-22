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
  getLiveEvents,
} from "../http/http-calls";
import { ToastsStore } from "react-toasts";
import config from "../config";
import { format } from "date-fns";
import TextEditor from "../components/text-editor";
import moment from "moment";
import { showToast, deepClone } from "../helper-methods";
import CustomDataTable from "../components/custom-data-table";

class LiveEvents extends Component {
  state = {
    eventList: [],
    eventListBackup: [],
    creatorList: [],
    subscriberList: [],
    transactionList: [],
    transactionListBackup: [],
    paymentTypes: config.paymentTypes,
    paymentStatusList: config.paymentStatusList,
    headerKeys: [
      { id: "id", label: "id" },
      { id: "name", label: "Event Name" },
      { id: "creatorName", label: "Creator" },
      // { id: "flag", label: "Flag" },
      { id: "time", label: "Scheduled Date" },
      { id: "rsvp", label: "RSVP" },
      { id: "price", label: "Fee" },
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
      attending: {
        upper: "",
        lower: "",
      },
      type: "",
      creator: "",
      status: "",
      search: "",
    },
    loading: {
      loadingData: true,
      changeStatusLoading: false,
      tableLoading: false,
    },
    contact: {
      via: "email",
      message: "",
    },
    bulkStatus: "",
    selectedTransactions: [],
    totalCount: 0,
    liveEventsFieldsKeyMap: {
      name: "eventName",
      time: "time",
      rsvp: "rsvp",
      price: "price",
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
    events: [],
  };

  componentDidMount() {
    this._getAllUsers();
    this._getLiveEvents(this.state.tableConfig);
  }

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

        this.setState({ creatorList });
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

  _getLiveEvents = (data) => {
    const { tableConfig } = this.state;
    console.log("LiveEvents -> _getLiveEvents -> tableConfig", data);
    getLiveEvents(data)
      .then((response) => {
        this._manageLoading("data", false);
        tableConfig.loading = false;
        this.setState({ tableConfig });
        let eventListResp = response.events.map((each) => {
          return {
            name: each.name,
            creatorName: each._influencer.name.full,
            id: each._id,
            flag: each._influencer.address.country,
            creatorId: each._influencer._id,
            profilePicture:
              each._influencer.profilePicture || config.defaultUserPicture,

            time: moment(each.scheduledAt).format("LLL"),

            status: each.status,

            createdAt: each.createdAt,
            rsvp: each.rsvpYes && each.rsvpYes.length ? each.rsvpYes.length : 0,
            basicPrice: each.price ? each.price : 0,
            premiumPrice: each.premiumPrice ? each.premiumPrice : 0,
            plusPrice: each.plusPrice ? each.plusPrice : 0,
          };
        });
        this.setState({
          eventList: eventListResp,
          eventListBackup: eventListResp,
          totalCount: response.count,
        });
      })
      .catch((err) => {});
  };

  _formatDate(date, dateFormat) {
    return format(new Date(date), dateFormat);
  }

  _onDatesChange = (startDate, endDate) => {
    let { filters } = this.state;
    filters.dateRange.startDate = startDate;
    filters.dateRange.endDate = endDate;
    this.setState({ filters }, () => {
      if (filters.dateRange.startDate && filters.dateRange.endDate) {
        // this._filterTransactionList();
        this._applyFilterChanges();
      }
    });
  };

  _onFocusChange = (input) => {
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

  _dataFormat = (cell, row, header) => {
    // console.log("_dataFormat -> row", row);
    // console.log(cell, row, header);_formatDate
    if (header === "name") {
      return (
        <Link to={`/events-view/${row.id}`}>          
          <span className="capitalize">{row.name}</span>
        </Link>
      );
    } else if (header === "amount") {
      return typeof cell === "number" ? "$" + cell.toFixed(2) : "-";
    } else if (header === "time") {
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
    } else if (header === "status") {
      return <p>{row.status}</p>;
    } else if (header === "price") {
      return (
        <p>
          <span title="Basic" style={{ textDecoration: "none" }}>
            {row.basicPrice && Number.isInteger(row.basicPrice)
              ? "$"+row.basicPrice
              : row.basicPrice === 0
              ? 0
              : "$"+row.basicPrice.toFixed(2)}
          </span>
          &nbsp; &nbsp;
          <span title="Plus" style={{ textDecoration: "none" }}>
            {row.plusPrice && Number.isInteger(row.plusPrice)
              ? "$"+row.plusPrice
              : row.plusPrice === 0
              ? 0
              : "$"+row.plusPrice.toFixed(2)}
          </span>
          &nbsp; &nbsp;
          <span title="Premium" style={{ textDecoration: "none" }}>
            {row.premiumPrice && Number.isInteger(row.premiumPrice)
              ? "$"+row.premiumPrice
              : row.premiumPrice === 0
              ? 0
              : "$"+row.premiumPrice.toFixed(2)}
          </span>
        </p>
      );
    } else {
      return cell;
    }
  };

  _filterOnChange = ({ currentTarget }) => {
    let { filters } = this.state;
    // filters[currentTarget.name] = currentTarget.value;

    if (currentTarget.name === "attending") {
      let breakAttendingNumber = currentTarget.value.split("-");
      filters[currentTarget.name].upper = breakAttendingNumber[1];
      filters[currentTarget.name].lower = breakAttendingNumber[0];
    } else {
      filters[currentTarget.name] = currentTarget.value;
    }

    this.setState({ filters }, () => {
      if (currentTarget.name !== "search") {
        // this._filterTransactionList();
        this._applyFilterChanges();
      }
    });
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
          this._getLiveEvents(this.state.tableConfig);
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
    const { tableConfig } = this.state;
    tableConfig.pageNumber = pageNumber;
    tableConfig.pageSize = pageSize;
    tableConfig.loading = true;
    setTimeout(() => {
      this.setState({ tableConfig }, () => {
        this._getLiveEvents(this.state.tableConfig);
      });
    }, 100);
  };

  _onSortChange = (sortName, sortOrder) => {
    const { tableConfig } = deepClone(this.state);
    tableConfig.sort.sortBy = this.state.liveEventsFieldsKeyMap[sortName];
    tableConfig.sort.sortOrder = sortOrder;
    tableConfig.loading = true;
    this.setState({ tableConfig }, () => {
      this._getLiveEvents(tableConfig);
    });
  };

  _applyFilterChanges = () => {
    const { filters, tableConfig } = deepClone(this.state);
    console.log(filters);
    let data = {
      attending: {
        // lower: "",
        // upper: "",
      },
    };
    if (filters.type.length) {
      data.paymentType = filters.type;
    }

    if (filters.attending.upper || filters.attending.lower) {
      data.attending.upper = filters.attending.upper;
      data.attending.lower = filters.attending.lower;
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
    tableConfig.filters = data;
    if (filters.search.length) {
      tableConfig.search = filters.search;
    } else {
      tableConfig.search = "";
    }
    tableConfig.loading = true;
    this.setState({ tableConfig }, () => {
      this._getLiveEvents(tableConfig);
    });
  };

  render() {
    const {
      filters,
      loading,
      subscriberList,
      creatorList,
      paymentTypes,
      paymentStatusList,
      bulkStatus,
      contact,
      totalCount,
      tableConfig,
    } = this.state;

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

                <h2>Live Events</h2>
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
                      <div className="ml-2">
                        <CustomDateRangePicker
                          dateRange={filters.dateRange}
                          onDatesChange={this._onDatesChange}
                          onFocusChange={this._onFocusChange}
                        ></CustomDateRangePicker>
                      </div>

                      <Input
                        type="select"
                        name="status"
                        value={filters.status}
                        onChange={this._filterOnChange}
                        className="capitalize"
                      >
                        <option value="">Status</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="cancelled">Canceled</option>
                        <option value="ongoing"> Ongoing</option>
                        <option value="complete"> Completed</option>
                      </Input>
                      <Input
                        type="select"
                        name="attending"
                        value={filters.attendingNumber}
                        onChange={this._filterOnChange}
                        className="capitalize"
                      >
                        <option value="">Attending</option>
                        <option value="0-0">0</option>
                        <option value="1-10">1 - 10</option>
                        <option value="11-50">11 - 50</option>
                        <option value="51-100">51 - 200</option>
                        <option value="201-500">201 - 500</option>
                        <option value="0-500">500+</option>
                      </Input>
                      {/* <Input
                        type="select"
                        name="subscriber"
                        value={filters.subscriber}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Subscriber</option>
                        {subscriberList.map(option => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </Input> */}
                      {/* <Input
                        type="select"
                        name="creator"
                        value={filters.creator}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Creator</option>
                        {creatorList.map(option => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
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
                  {/* filterWrap */}
                  {/* <CustomTable
                    tableData={this.state.transactionList}
                    headerKeys={this.state.headerKeys}
                    dataFormat={this._dataFormat}
                    rowSelection={true}
                    setSelectedRows={data => this._setSelectedRows(data)}
                  ></CustomTable> */}
                  <CustomDataTable
                    tableData={this.state.eventList}
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
                    Events..
                  </div>
                </div>
              )}
            </Col>
          </Row>

          {/* The below "Row" will appear after the user selects row(s) from the above table */}
          {/* <Row className="justify-content-center">
            <Col md="12" lg="12">
              <div className="d-flex my-5 flex-column w-75 mx-auto">
                <div className="d-flex justify-content-between">
                  <p>Send Reminder</p>
                  <Input
                    type="select"
                    style={{
                      width: "175px",
                      marginLeft: "40px",
                      marginRight: "40px"
                    }}
                    name="bulkStatus"
                    value={bulkStatus}
                    onChange={this._onBulkStatusChange}
                    className="capitalize"
                  >
                    <option value="">Email</option>
                    <option value="">Push</option>
                  </Input>

                  <div style={{ flex: 1 }}>
                    <TextEditor
                      onChange={e => this._setMessageContent(e, "message")}
                    ></TextEditor>

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
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          </Row> */}
        </Container>
      </div>
    );
  }
}

export default LiveEvents;
