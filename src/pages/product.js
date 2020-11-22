import React, { Component } from "react";
import { Link } from "react-router-dom";
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
import CustomDateRangePicker from "../components/date-range-picker";
import {
  getAllSubscribers,
  changeUserStatus,
  sendMessage,
  getAllProducts,
  editProductStatus,
} from "../http/http-calls";
import config from "../config";
import { ToastsStore } from "react-toasts";
import SubscriptionListModal from "../components/subscription-list-modal";
import TipsModal from "../components/tips-list-modal";
import PpvListModal from "../components/ppv-list-modal";
// import CopyclipBoard from "../../components/copy-clipboard";
import CopyclipBoard from "../components/copy-clipboard";
import { format } from "date-fns";
import TextEditor from "../components/text-editor";
import { showToast, deepClone } from "../helper-methods";
import CustomDataTable from "../components/custom-data-table";
import { parsePhoneNumberFromString } from "libphonenumber-js";

class Shoutout extends Component {
  state = {
    modals: [false, false, false],
    subscriptionModal: {
      isOpen: false,
      data: null,
    },
    tipsModal: {
      isOpen: false,
      data: null,
    },
    ppvModal: {
      isOpen: false,
      data: null,
    },
    subscriberList: [
      {
        productid: 12345,
        productname: "Samsung Mobile",
        category: "Mobile",
        seller: "Abc",
        influencers: 2,
        cost: "$150",
        orders: 4,
        status: "active",
      },
    ],
    subscriberListBackup: [],
    productList:[],
    productListBackup:[],
    headerKeys: [
      { id: "id", label: "id" },
      { id: "productid", label: "Product Id" },
      { id: "productname", label: "Product Name" },
      { id: "category", label: "Category" },
      { id: "seller", label: "Seller" },
      { id: "influencers", label: "Influencers" },
      { id: "cost", label: "Cost" },
      { id: "orders", label: "Orders" },
      { id: "status", label: "Status" },
      // { id: "name", label: "Name" },
      // { id: "flag", label: "Flag" },
      // { id: "email", label: "Email" },
      // { id: "phone", label: "Phone" },
      // { id: "joinedAt", label: "Joined" },
      // { id: "subscriptions", label: "Subscriptions" },
      // { id: "tipAmount", label: "Tips" },
      // { id: "spent", label: "Lifetime Spend" },
      // { id: "status", label: "Status" },
      // { id: "action", label: "Action", noSort: true }
    ],
    subscriptionCounts: config.subscriptionCounts,
    spentCounts: config.spentCounts,
    filters: {
      dateRange: {
        startDate: null,
        endDate: null,
        focusedInput: null,
        startDateId: "startDate",
        endDateId: "endDate",
      },
      subscriptions: "",
      status: "",
      search: "",
      spent: "",
    },
    loading: {
      loadingData: false,
      changeStatusLoading: false,
      sendingMessage: false,
    },
    contact: {
      via: "email",
      message: "",
    },
    selectedSubscribers: [],
    totalCount: 0,
    subscriberFieldsKeyMap: {
      name: "name",
      email: "email",
      phone: "phone",
      subscriptions: "spent",
      joinedAt: "createdAt",
      tipAmount: "tips",
      spent: "spent",
      status: "isActive",
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

  _formatDate = (date) => {
    // console.log("TCL: Subscribers -> _formatDate -> date", date);
    return format(new Date(date), "MMM d, yyyy");
  };

  _onToggleSubscriptionModal = (data) => {
    let { subscriptionModal } = JSON.parse(JSON.stringify(this.state));
    subscriptionModal.isOpen = !subscriptionModal.isOpen;
    subscriptionModal.data = data;
    this.setState(
      {
        subscriptionModal,
      },
      () => {
        console.log(this.state);
      }
    );
  };

  _onToggleTipsModal = (data) => {
    let { tipsModal } = JSON.parse(JSON.stringify(this.state));
    tipsModal.isOpen = !tipsModal.isOpen;
    tipsModal.data = data;
    this.setState(
      {
        tipsModal,
      },
      () => {
        console.log(this.state);
      }
    );
  };

  _onTogglePPVModal = (data) => {
    let { ppvModal } = JSON.parse(JSON.stringify(this.state));
    ppvModal.isOpen = !ppvModal.isOpen;
    ppvModal.data = data;
    this.setState(
      {
        ppvModal,
      },
      () => {
        console.log(this.state);
      }
    );
  };

  _manageLoading = (key, value) => {
    let {
      loadingData,
      changeStatusLoading,
      sendingMessage,
    } = this.state.loading;
    if (key === "data") {
      loadingData = value;
    } else if (key === "change-status") {
      changeStatusLoading = value;
    } else if (key === "send-message") {
      sendingMessage = value;
    }
    this.setState({
      loading: { loadingData, changeStatusLoading, sendingMessage },
    });
  };

  _getAllProducts = (data) => {
    let { productList, tableConfig } = deepClone(this.state);
    if (!productList.length) {
      this._manageLoading("data", true);
    }
    getAllProducts(data).then(
      (response) => {
        console.log(response);
        this._manageLoading("data", false);
        tableConfig.loading = false;
        this.setState({ tableConfig });
        let productListResp = response.products.map((each) => {
          return {
            productid: each.id,
            productname:each.name,
            category: each.category,
            seller:each._seller.name.last?each._seller.name.full:each._seller.name.first,
            influencers:each.influencers,
            cost:`$ ${each.price}.00`,
            orders:each.orders,
            status: each.isActive ? "Active" : "Inactive",
          };
        });
        this.setState({
          productList: productListResp,
          productListBackup: productListResp,
          totalCount: response.count,
        });
      },
      (error) => {
        console.log(error);
        this._manageLoading("data", false);
        tableConfig.loading = false;
        this.setState({ tableConfig });
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

  _onStatusUpdate = (data) => {
    let { productList } = this.state;
    let creatorData = productList.find((each) => each.productid === data.productid);
    // creatorData.status =
    //   creatorData.status === "Active" ? "Inactive" : "Active";
    this.setState({
      productList,
      productListBackup: productList,
    });
    console.log(productList);
    this._manageLoading("change-status", true);
    let status = {}
    if(creatorData.status.toLowerCase()==='active') {
      status['isActive'] = false;
      creatorData.status = 'Inactive'
  } else {
      status['isActive'] = true;
      creatorData.status = 'Active'
  }
    editProductStatus(status,data.productid).then(
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

  _dataFormat = (cell, row, header) => {
    if (header === "productid") {
      console.log(row);
      return (
        // <Link to={`/product-view/${row.id}`}>
        <Link to={`/product-view/5f791cf9db0d183d82b4c142`}>
          <div className="d-flex justify-content-start align-items-center">
            {row.productid}
          </div>
        </Link>
      );
    } else if (header === "email") {
      return (
        <CopyclipBoard copiedValue={row.email} border="none"></CopyclipBoard>
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
    } else if (header === "joinedAt") {
      return cell ? this._formatDate(cell) : "-";
    } else if (header === "sales") {
      return cell && cell.length ? (
        <span onClick={() => this._onToggleSubscriptionModal(row)}>
          {cell.length}
        </span>
      ) : (
        0
      );
    } else if (header === "status") {
      return (
        <Input
          type="select"
          value={cell}
          onChange={() => this._onStatusUpdate(row)}
          // disabled={this.state.loading.changeStatusLoading}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </Input>
      );
    } else if (header === "action") {
      return (
        <Link to={`/subscriber-view/${row.id}`}>
          <Button color="ghost-primary">View</Button>
        </Link>
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
      // this._filterSubscriberList();
      this._applyFilterChanges();
    }
  };

  // old function for frontend filtering - not using now
  _filterSubscriberList = () => {
    let filterConditions = [];
    // console.log(this.state);
    let { filters, productListBackup, productList } = this.state;
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        filterConditions.push(key);
      }
    });
    console.log(filterConditions);
    productList = productListBackup;
    if (filterConditions.length) {
      if (filters.subscriptions) {
        console.log(filters.subscriptions);
        let range = this.state.subscriptionCounts[filters.subscriptions].value;
        console.log(range);
        productList = productList.filter((each) => {
          // console.log(
          //   each.subscriptions,
          //   each.subscriptions >= range.min,
          //   each.subscriptions <= range.max
          // );
          if (range.min && !range.max) {
            return each.subscriptions.length > range.min;
          } else {
            return (
              each.subscriptions.length >= range.min &&
              each.subscriptions.length <= range.max
            );
          }
        });
      }
      if (filters.status) {
        productList = productList.filter((each) => {
          return each.status.toLowerCase() === filters.status.toLowerCase();
        });
      }
      if (filters.search.trim().length) {
        productList = productList.filter((each) => {
          return (
            each.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.email.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.phone.toLowerCase().includes(filters.search.toLowerCase())
          );
        });
      }
      this.setState({ productList });
    } else {
      this.setState({ productList: productListBackup });
    }
  };

  _setSelectedRows = (data) => {
    console.log(data);
    let { selectedSubscribers } = this.state;
    selectedSubscribers = data;
    this.setState({ selectedSubscribers });
  };

  _contactOnChange = ({ currentTarget }) => {
    let { contact } = this.state;
    contact[currentTarget.name] = currentTarget.value;
    this.setState({ contact });
  };

  _setMessageContent = (value, key) => {
    let { contact } = this.state;
    contact[key] = value;
    this.setState({ contact });
  };

  _extractContent = (s) => {
    var span = document.createElement("span");
    span.innerHTML = s;
    return span.textContent || span.innerText;
  };

  _sendMessage = () => {
    let { contact, selectedSubscribers } = this.state;
    let data = {
      idlist: selectedSubscribers,
      text:
        contact.via === "email"
          ? contact.message
          : this._extractContent(contact.message),
    };
    if (!data.idlist.length) {
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

  _paginate = (pageNumber, pageSize) => {
    console.log("pageNumber, pageSize :", pageNumber, pageSize);
    const { tableConfig } = this.state;
    tableConfig.pageNumber = pageNumber;
    tableConfig.pageSize = pageSize;
    tableConfig.loading = true;
    setTimeout(() => {
      this.setState({ tableConfig }, () => {
        this._getAllProducts(this.state.tableConfig);
      });
    }, 100);
  };

  _onSortChange = (sortName, sortOrder) => {
    const { tableConfig } = deepClone(this.state);
    tableConfig.sort.sortBy = this.state.subscriberFieldsKeyMap[sortName];
    tableConfig.sort.sortOrder = sortOrder;
    tableConfig.loading = true;
    this.setState({ tableConfig }, () => {
      this._getAllProducts(tableConfig);
    });
    console.log("sortName, sortOrder :", sortName, sortOrder);
  };

  _applyFilterChanges = () => {
    const { filters, tableConfig } = deepClone(this.state);
    console.log("filters :", filters);
    let data = {};
    if (filters.subscriptions.length) {
      data._subscriptions = {
        lowerLimit: this.state.subscriptionCounts[filters.subscriptions].value
          .min,
        upperLimit: this.state.subscriptionCounts[filters.subscriptions].value
          .max,
      };
    }
    if (filters.spent.length) {
      data.spent = {
        lowerLimit: this.state.spentCounts[filters.spent].value.min,
        upperLimit: this.state.spentCounts[filters.spent].value.max,
      };
    }
    if (filters.status.length) {
      data.isActive = filters.status === "active" ? true : false;
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
      this._getAllProducts(tableConfig);
    });
  };

  componentDidMount() {
    this._getAllProducts(this.state.tableConfig);
  }

  render() {
    const {
      filters,
      loading,
      subscriptionCounts,
      spentCounts,
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

                <h2>Products</h2>
              </div>
              {/* filters */}
              {!loading.loadingData && (
                <div>
                  <div className="filterWrap">
                    <div className="d-flex align-items-center">
                      <i className="fa fa-filter"></i>

                      <Input
                        type="select"
                        name="creator"
                        value={filters.creator}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Category</option>
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
                      {/* <div className="ml-2">
                        <CustomDateRangePicker
                          dateRange={filters.dateRange}
                          onDatesChange={this._onDatesChange}
                          onFocusChange={this._onFocusChange}
                        ></CustomDateRangePicker>
                      </div> */}
                      {/* <Input
                        type="select"
                        name="price"
                        value={filters.price}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Price</option>
                        <option value="0-20">0-20</option>
                        <option value="20-50">20-50</option>
                        <option value="50-100">50-100</option>
                        <option value="100-250">100-250</option>
                        <option value="250-500">250-500</option>
                        <option value="500">500+</option>
                       
                      </Input> */}
                      <Input
                        type="select"
                        name="sales"
                        value={filters.sales}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Price</option>
                        {/* <option value="0">0</option>
                        <option value="20-50">1-5</option>
                        <option value="50-100">6-10</option>
                        <option value="100-250">11-20</option>
                        <option value="250-500">21-50</option>
                        <option value="250-500">51-100</option>
                        <option value="500">100+</option> */}
                      </Input>
                      {/* <Input
                        type="select"
                        name="type"
                        value={filters.type}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Type</option> */}
                      {/* <option value="active">Active</option>
                        <option value="inactive">Inactive</option> */}
                      {/* </Input> */}
                    </div>

                    <div className="d-flex align-items-center">
                      <Input
                        type="text"
                        id="search"
                        name="search"
                        placeholder="Search"
                        autoComplete="off"
                        className="ml-2"
                        value={this.state.filters.search}
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
                    tableData={this.state.subscriberList}
                    headerKeys={this.state.headerKeys}
                    dataFormat={this._dataFormat}
                    rowSelection={true}
                    setSelectedRows={data => this._setSelectedRows(data)}
                  ></CustomTable> */}
                  <CustomDataTable
                    tableData={this.state.productList}
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
                    Subscribers..
                  </div>
                </div>
              )}
              {/* The below div will appear after the user selects row(s) from the above table */}

              {/* there will be a "WYSIWYG" editor below in place of a textarea  */}
              {/* <Input
                      type="textarea"
                      id=""
                      rows="6"
                      placeholder="Enter your message here.."
                      name="message"
                      value={contact.message}
                      onChange={this._contactOnChange}
                    /> */}

              {/* Modal for "Subscriptions" */}
              <SubscriptionListModal
                isOpen={this.state.subscriptionModal.isOpen}
                data={this.state.subscriptionModal.data}
                toggle={() => this._onToggleSubscriptionModal()}
              ></SubscriptionListModal>

              {/* Modal for "Tips" */}
              <TipsModal
                isOpen={this.state.tipsModal.isOpen}
                data={this.state.tipsModal.data}
                toggle={() => this._onToggleTipsModal()}
              ></TipsModal>
              {/* Modal for "PPV" */}
              <PpvListModal
                isOpen={this.state.ppvModal.isOpen}
                data={this.state.ppvModal.data}
                toggle={() => this._onTogglePPVModal()}
              ></PpvListModal>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Shoutout;
