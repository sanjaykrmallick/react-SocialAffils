import React, { Component } from "react";
import { Link } from "react-router-dom";
import CustomDateRangePicker from "../../components/date-range-picker";

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
import CustomTable from "../../components/custom-table";
import {
  getAllSubscribers,
  changeUserStatus,
  sendMessage,
  getAllOrders,
  editSeller,
  editOrder,
} from "../../http/http-calls";
import config from "../../config";
import { ToastsStore } from "react-toasts";
import SubscriptionListModal from "../../components/subscription-list-modal";
import OrderDetailModal from "../../components/order-detail-modal";
import TipsModal from "../../components/tips-list-modal";
import PpvListModal from "../../components/ppv-list-modal";
import CopyclipBoard from "../../components/copy-clipboard";
import { format } from "date-fns";
import TextEditor from "../../components/text-editor";
import { showToast, deepClone } from "../../helper-methods";
import CustomDataTable from "../../components/custom-data-table";
import { parsePhoneNumberFromString } from "libphonenumber-js";

class Subscribers extends Component {
  state = {
    modals: [false, false, false],
    orderDetailModal: {
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
        orderid: 1234,
        product: "Mobile",
        quantity: 2,
        amount: "$20",
        buyer: "rohan",
        seller: "amazon",
        affiliate: "shyam",
        status: "pending",
      },
    ],
    subscriberListBackup: [],
    orderList: [],
    orderListBackup: [],
    headerKeys: [
      { id: "id", label: "id" },
      { id: "orderId", label: "Order Id" },
      // { id: "flag", label: "Flag" },
      { id: "product", label: "Product" },
      { id: "quantity", label: "Quantity" },
      { id: "amount", label: "Amount" },
      { id: "buyer", label: "Buyer" },
      { id: "seller", label: "Seller" },
      { id: "affiliate", label: "Affiliate" },
      { id: "status", label: "Status" },
      // { id: "action", label: "Action", noSort: true }
    ],
    subscriptionCounts: config.subscriptionCounts,
    spentCounts: config.productCount,
    // filters: {
    //   subscriptions: "",
    //   status: "",
    //   search: "",
    //   spent: "",
    // },
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
  };

  _formatDate = (date) => {
    // console.log("TCL: Subscribers -> _formatDate -> date", date);
    return format(new Date(date), "MMM d, yyyy");
  };

  _onToggleSubscriptionModal = (data) => {
    let { orderDetailModal } = JSON.parse(JSON.stringify(this.state));
    orderDetailModal.isOpen = !orderDetailModal.isOpen;
    orderDetailModal.data = data;
    this.setState(
      {
        orderDetailModal,
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

  _getAllOrders = (data) => {
    let { orderList, tableConfig } = deepClone(this.state);
    if (!orderList.length) {
      this._manageLoading("data", true);
    }
    getAllOrders(data).then(
      (response) => {
        console.log(response);
        this._manageLoading("data", false);
        tableConfig.loading = false;
        this.setState({ tableConfig });
        let orderListResp = response.orders.map((each) => {
          return {
            orderId: each.id,
            product: each._product.category,
            quantity: each.quantity,
            amount: `$ ${each._product.price}.00`,
            buyer: each._buyer.name.last
              ? each._buyer.name.full
              : each._buyer.name.first,
            seller: each._seller.name.last
              ? each._seller.name.full
              : each._seller.name.first,
            affiliate: each._influencer.name.last
              ? each._influencer.name.full
              : each._influencer.name.first,
            status: each.isActive ? "Active" : "Inactive",
          };
        });
        this.setState({
          orderList: orderListResp,
          orderListBackup: orderListResp,
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
    let { orderList } = this.state;
    console.log("orderData: ",data)
    let creatorData = orderList.find((each) => each.orderId === data.orderId);
    // creatorData.status =
    //   creatorData.status === "Active" ? "Inactive" : "Active";
    this.setState({
      orderList,
      orderListBackup: orderList,
    });
    console.log(orderList);
    this._manageLoading("change-status", true);
    let status = {};
    if (creatorData.status.toLowerCase() === "active") {
      status["isActive"] = false;
      creatorData.status = "Inactive";
    } else {
      status["isActive"] = true;
      creatorData.status = "Active";
    }
    editOrder(status, data.orderId).then(
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
    if (header === "name") {
      console.log(row);
      return (
        <Link to={`/subscriber-view/${row.id}`}>
          <div className='d-flex justify-content-start align-items-center'>
            {/* <div className="personImgWrap">
              <img
                className="personImg"
                src={row.profilePicture}
                alt="Profile Thumbnail"
              />
            </div>
            {row.name} */}
            <img
              src={`https://www.countryflags.io/${row.flag}/flat/24.png`}
              alt='flag'
              className='mr-2'
            />
            {row.name}
          </div>
        </Link>
      );
    } else if (header === "orderId") {
      return (
        <div
          onClick={() => this._onToggleSubscriptionModal()}
          style={{ cursor: "pointer" }}>
          {row.orderId}
        </div>
      );
    } else if (header === "phone") {
      return row.phone !== "-" ? (
        <CopyclipBoard
          copiedValue={parsePhoneNumberFromString(
            row.phone
          ).formatInternational()}
          border='none'></CopyclipBoard>
      ) : (
        "-"
      );
    } else if (header === "joinedAt") {
      return cell ? this._formatDate(cell) : "-";
    } else if (header === "subscriptions") {
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
          type='select'
          value={cell}
          onChange={() => this._onStatusUpdate(row)}
          // disabled={this.state.loading.changeStatusLoading}
        >
          <option value='Active'>Active</option>
          <option value='Inactive'>Inactive</option>
        </Input>
      );
    } else if (header === "action") {
      return (
        <Link to={`/subscriber-view/${row.orderId}`}>
          <Button color='ghost-primary'>View</Button>
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
      this._filterSubscriberList();
      // this._applyFilterChanges();
    }
  };

  // old function for frontend filtering - not using now
  _filterSubscriberList = () => {
    let filterConditions = [];
    // console.log(this.state);
    let { filters, orderListBackup, orderList } = this.state;
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        filterConditions.push(key);
      }
    });
    console.log(filterConditions);
    orderList = orderListBackup;
    if (filterConditions.length) {
      if (filters.subscriptions) {
        console.log(filters.subscriptions);
        let range = this.state.subscriptionCounts[filters.subscriptions].value;
        console.log(range);
        orderList = orderList.filter((each) => {
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
        orderList = orderList.filter((each) => {
          return each.status.toLowerCase() === filters.status.toLowerCase();
        });
      }
      if (filters.search.trim().length) {
        orderList = orderList.filter((each) => {
          return (
            each.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.email.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.phone.toLowerCase().includes(filters.search.toLowerCase())
          );
        });
      }
      this.setState({ orderList });
    } else {
      this.setState({ orderList: orderListBackup });
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
        this._getAllOrders(this.state.tableConfig);
      });
    }, 100);
  };

  _onSortChange = (sortName, sortOrder) => {
    const { tableConfig } = deepClone(this.state);
    tableConfig.sort.sortBy = this.state.subscriberFieldsKeyMap[sortName];
    tableConfig.sort.sortOrder = sortOrder;
    tableConfig.loading = true;
    this.setState({ tableConfig }, () => {
      this._getAllOrders(tableConfig);
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
      this._getAllOrders(tableConfig);
    });
  };

  componentDidMount() {
    this._getAllOrders(this.state.tableConfig);
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
      <div className='app TruFansPgBg animated fadeIn'>
        <Container fluid>
          <Row>
            <Col xs='12'>
              <div className='PgTitle justify-content-start align-items-center'>
                {/* on clicking the below btn, it should take back the user to the previous page in history */}
                {/* <Button color="ghost-dark" className="customBackBtn">
                  <i className="fa fa-arrow-left"></i>
                </Button> */}

                <h2>Orders</h2>
              </div>
              {/* filters */}
              {!loading.loadingData && (
                <div>
                  <div className='filterWrap'>
                    <div className='d-flex align-items-center'>
                      <i className='fa fa-filter'></i>
                      <div className='ml-2'>
                        <CustomDateRangePicker
                          dateRange={filters.dateRange}
                          onDatesChange={this._onDatesChange}
                          onFocusChange={
                            this._onFocusChange
                          }></CustomDateRangePicker>
                      </div>
                      <Input
                        type='select'
                        name='subscriptions'
                        value={filters.subscriptions}
                        onChange={this._filterOnChange}>
                        <option value=''>Influencer</option>
                        {/* {subscriptionCounts.map((option, index) => (
                          <option key={index} value={index}>
                            {option.label}
                          </option>
                        ))} */}
                      </Input>
                      <Input
                        type='select'
                        name='subscriptions'
                        value={filters.subscriptions}
                        onChange={this._filterOnChange}>
                        <option value=''>Seller</option>
                        {/* {subscriptionCounts.map((option, index) => (
                          <option key={index} value={index}>
                            {option.label}
                          </option>
                        ))} */}
                      </Input>
                      <Input
                        type='select'
                        name='spent'
                        value={filters.spent}
                        onChange={this._filterOnChange}>
                        <option value=''>Product Category</option>
                        {spentCounts.map((option, index) => (
                          <option key={index} value={index}>
                            {option.label}
                          </option>
                        ))}
                      </Input>
                      <Input
                        type='select'
                        name='status'
                        value={filters.status}
                        onChange={this._filterOnChange}>
                        <option value=''>Status</option>
                        <option value='active'>Active</option>
                        <option value='inactive'>Inactive</option>
                      </Input>
                    </div>

                    <div className='d-flex align-items-center'>
                      <Input
                        type='text'
                        id='search'
                        name='search'
                        placeholder='Search'
                        autoComplete='off'
                        className='ml-2'
                        value={this.state.filters.search}
                        onChange={this._filterOnChange}
                      />

                      <Button
                        color='secondary'
                        className='ml-2'
                        onClick={() => this._applyFilterChanges()}>
                        <i className='icon-magnifier'></i>
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
                    tableData={this.state.orderList}
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
                    showTableLoading={tableConfig.loading}></CustomDataTable>
                </div>
              )}
              {loading.loadingData && (
                <div className='filterWrap'>
                  <div className='loading-section list-loading'>
                    <i className='fa fa-spinner fa-spin'></i> &nbsp; Loading
                    Subscribers..
                  </div>
                </div>
              )}
              {/* The below div will appear after the user selects row(s) from the above table */}
              {/* <div className="d-flex my-5 flex-column w-75 mx-auto">
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
                    there will be a "WYSIWYG" editor below in place of a textarea  
                    <Input
                      type="textarea"
                      id=""
                      rows="6"
                      placeholder="Enter your message here.."
                      name="message"
                      value={contact.message}
                      onChange={this._contactOnChange}
                    />
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
              </div> */}
              {/* Modal for "Subscriptions" */}
              <OrderDetailModal
                isOpen={this.state.orderDetailModal.isOpen}
                data={this.state.orderDetailModal.data}
                toggle={() =>
                  this._onToggleSubscriptionModal()
                }></OrderDetailModal>

              {/* Modal for "Tips" */}
              <TipsModal
                isOpen={this.state.tipsModal.isOpen}
                data={this.state.tipsModal.data}
                toggle={() => this._onToggleTipsModal()}></TipsModal>
              {/* Modal for "PPV" */}
              <PpvListModal
                isOpen={this.state.ppvModal.isOpen}
                data={this.state.ppvModal.data}
                toggle={() => this._onTogglePPVModal()}></PpvListModal>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Subscribers;
