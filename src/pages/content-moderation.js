import React, { Component } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Input
  // FormGroup, Label
} from "reactstrap";
import { ToastsStore } from "react-toasts";
import { Link } from "react-router-dom";
import config from "../config/index";
import {
  getContentModerations,
  updateContentModeration
} from "../http/http-calls";
import CustomDateRangePicker from "../components/date-range-picker";
import CustomTable from "../components/custom-table";
import { format } from "date-fns";
import moment from "moment";
import { showToast } from "../helper-methods";

// import isWithinRange from 'date-fns';
// import moment from "moment";
class ContentModeration extends Component {
  state = {
    contentModerationStatusList: config.contentModerationStatusList,
    contentModerationReasonList: config.contentModerationReasonList,
    contentModerationList: [],
    contentModerationListBackup: [],
    headerKeys: [
      { id: "id", label: "id" },
      { id: "name", label: "Creator" },
      { id: "flaggedBy", label: "Flagged By" },
      { id: "date", label: "Date" },
      { id: "reason", label: "Reason" },
      { id: "status", label: "Status" },
      { id: "updatedAt", label: "Last Updated At" },
      { id: "details", label: "Details" }
    ],
    filters: {
      dateRange: {
        startDate: null,
        endDate: null,
        focusedInput: null,
        startDateId: "startDate",
        endDateId: "endDate"
      },
      reason: "",
      flaggedBy: "",
      status: "",
      search: ""
    },
    loading: {
      loadingData: false,
      changeStatusLoading: false,
      changeReasonLoading: false
    }
  };

  _onDatesChange = (startDate, endDate) => {
    console.log("on date change", startDate, endDate);
    let { filters } = this.state;
    filters.dateRange.startDate = startDate;
    filters.dateRange.endDate = endDate;
    this.setState({ filters });
    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      console.log("range selction complete");
      this._filterContentModerationList();
    }
  };

  _onFocusChange = input => {
    console.log(input);
    let { filters } = this.state;
    filters.dateRange.focusedInput = input;
    this.setState({ filters });
  };

  _formatDate(date, dateFormat) {
    return format(new Date(date), dateFormat);
  }

  _manageLoading = (key, value) => {
    let {
      loadingData,
      changeStatusLoading,
      changeReasonLoading
    } = this.state.loading;
    if (key === "data") {
      loadingData = value;
    } else if (key === "change-status") {
      changeStatusLoading = value;
    } else if (key === "change-reason") {
      changeReasonLoading = value;
    }
    this.setState({
      loading: { loadingData, changeStatusLoading, changeReasonLoading }
    });
  };

  _getContentModerations() {
    this._manageLoading("data", true);
    getContentModerations().then(
      response => {
        this._manageLoading("data", false);
        let contentModerationList = response.reports.map(each => {
          let influencer;
          if (each._userId) {
            influencer = each._userId.name.full;
          } else {
            influencer = each._postId._influencer.name.full;
          }
          each._reportedBy.userType =
            each._reportedBy.userType.toLowerCase() === "admin"
              ? "Admin"
              : "User";
          return {
            name: influencer,
            id: each._id,
            flaggedBy: each._reportedBy,
            date: each.createdAt,
            reason: each.subject,
            status: each.status,
            lastUpdatedBy: each.lastUpdatedBy,
            updatedAt: each.updatedAt,
            _postId: each.hasOwnProperty('_postId') ? each._postId : null
          };
        });
        contentModerationList = contentModerationList.sort((item1,item2)=>{
          return new Date(item2.date) - new Date(item1.date);
        })
        this.setState({
          contentModerationList,
          contentModerationListBackup: contentModerationList
        });
      },
      error => {
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
  }

  _dataFormat = (cell, row, header) => {
    // console.log(cell, row, header);
    if (header === "flaggedBy") {
      return row.flaggedBy.userType === "User" ? (
        <div>
          <Link to={`/subscriber-view/${row.flaggedBy.id}`}>
            {row.flaggedBy.userType} <br />({row.flaggedBy.name.full})
          </Link>
        </div>
      ) : (
        <div>
          {row.flaggedBy.userType} <br />({row.flaggedBy.name.full})
        </div>
      );
    } else if (header === "name") {
      return (
        <Link to={`/creator-view/${row._postId._influencer.id}`}>
          {row.name}
        </Link>
      )
    } else if (header === "date") {
      return <div>{this._formatDate(cell, "MMM d, yyyy")}</div>;
    } else if (header === "updatedAt") {
      return (
        <div>
          {row.lastUpdatedBy && row.lastUpdatedBy.name.full}
          <br />
          {this._formatDate(row.updatedAt, "MMM d, yyyy, HH:mm")}
        </div>
      );
    } else if (header === "reason") {
      return (
        <Input
          type="select"
          name="reason"
          value={cell}
          onChange={e => this._updateContentModeration(e, row, "reason")}
        >
          {this.state.contentModerationReasonList.map(reason => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </Input>
      );
    } else if (header === "status") {
      return (
        <Input
          type="select"
          name="status"
          value={cell}
          onChange={e => this._updateContentModeration(e, row, "status")}
        >
          {/* <option value="status">Status</option> */}
          {this.state.contentModerationStatusList.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Input>
      );
    } else if (header === "details") {
      console.log('cell details :', cell, row);
      return row._postId ? (
        <a href={'/post/'+row._postId._id} rel="noopener noreferrer">
          Link
        </a>
      ) : (
        <>N/A</>
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
      this._filterContentModerationList();
    }
  };

  _filterContentModerationList = () => {
    let filterConditions = [];
    // console.log(this.state);
    let {
      filters,
      contentModerationListBackup,
      contentModerationList
    } = this.state;
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        filterConditions.push(key);
      }
    });
    // console.log(filterConditions);
    contentModerationList = contentModerationListBackup;
    if (filterConditions.length) {
      if (filters.dateRange.startDate && filters.dateRange.endDate) {
        contentModerationList = contentModerationList.filter(each => {
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
      if (filters.reason) {
        contentModerationList = contentModerationList.filter(each => {
          return each.reason.toLowerCase() === filters.reason.toLowerCase();
        });
      }
      if (filters.flaggedBy) {
        contentModerationList = contentModerationList.filter(each => {
          return (
            each.flaggedBy.userType.toLowerCase() ===
            filters.flaggedBy.toLowerCase()
          );
        });
      }
      if (filters.status) {
        contentModerationList = contentModerationList.filter(each => {
          return each.status.toLowerCase() === filters.status.toLowerCase();
        });
      }
      if (filters.search.trim().length) {
        contentModerationList = contentModerationList.filter(each => {
          return (
            each.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.flaggedBy.name.full
              .toLowerCase()
              .includes(filters.search.toLowerCase()) ||
            each.reason.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.status.toLowerCase().includes(filters.search.toLowerCase())
          );
        });
      }
      this.setState({ contentModerationList });
    } else {
      this.setState({ contentModerationList: contentModerationListBackup });
    }
  };

  _updateContentModeration({ currentTarget }, data, key) {
    console.log(key, currentTarget.value);
    let { contentModerationList } = this.state;
    let content = contentModerationList.find(each => each.id === data.id);
    content[key] = currentTarget.value;
    let dataToUpdate = {
      subject: content.reason,
      status: content.status
    };
    this.setState({
      contentModerationList,
      contentModerationListBackup: contentModerationList
    });
    updateContentModeration(content.id, dataToUpdate).then(
      response => {
        console.log(response);
        let property = key.charAt(0).toUpperCase() + key.slice(1);
        ToastsStore.success(property + " changed Successfully!", 3000);
      },
      error => {
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

  componentDidMount() {
    this._getContentModerations();
  }

  render() {
    const {
      contentModerationStatusList,
      contentModerationReasonList,
      filters,
      loading
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

                <h2>Content Moderation</h2>
              </div>
              {!loading.loadingData && (
                <div>
                  {/* filters */}
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
                        name="reason"
                        value={filters.reason}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Reason</option>
                        {contentModerationReasonList.map(reason => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </Input>
                      <Input
                        type="select"
                        name="flaggedBy"
                        value={filters.flaggedBy}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Flagged By</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </Input>
                      <Input
                        type="select"
                        name="status"
                        value={filters.status}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Status</option>
                        {contentModerationStatusList.map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Input>
                    </div>

                    <div className="d-flex align-items-center mt-md-3 mt-xl-0">
                      <Input
                        type="text"
                        id="search"
                        name="search"
                        placeholder="Search"
                        autoComplete="off"
                        className="ml-2"
                        value={filters.search}
                        onChange={this._filterOnChange}
                      />
                      <Button
                        color="secondary"
                        className="ml-2"
                        onClick={this._filterContentModerationList}
                      >
                        <i className="icon-magnifier"></i>
                      </Button>
                    </div>
                  </div>{" "}
                  {/* filterWrap */}
                  <CustomTable
                    tableData={this.state.contentModerationList}
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
                    Content Moderations..
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

export default ContentModeration;
