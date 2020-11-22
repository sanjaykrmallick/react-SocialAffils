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
import {
  getAllSubscribers,
  changeUserStatus,
  sendMessage,
  getAllVaultFolder,
  getAllSeller,
  editSeller,
} from "../http/http-calls";
import config from "../config";
import { ToastsStore } from "react-toasts";
import AddEditSellerModal from "../components/add-seller-modal";
import TipsModal from "../components/tips-list-modal";
import PpvListModal from "../components/ppv-list-modal";
// import CopyclipBoard from "../../components/copy-clipboard";
import CopyclipBoard from "../components/copy-clipboard";
import { format } from "date-fns";
import TextEditor from "../components/text-editor";
import { showToast, deepClone } from "../helper-methods";
import CustomDataTable from "../components/custom-data-table";
import { parsePhoneNumberFromString } from "libphonenumber-js";

class Seller extends Component {
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
    addSellerModal: {
      isOpen: false,
      data: null,
      type: "add",
    },
    // subscriberList: [
    //   {
    //     sellerStore: "abcde",
    //     name: "xyz",
    //     email: "qwerty@gmail.com",
    //     phone: "9090909090",
    //     products: "20",
    //     sales: "$2190",
    //     status: "active",
    //   },
    // ],
    // subscriberListBackup: [],
    headerKeys: [
      { id: "id", label: "id" },
      { id: "sellerStore", label: "Seller Store" },
      { id: "name", label: "Name" },
      { id: "email", label: "Email" },
      { id: "phone", label: "Phone" },
      { id: "products", label: "Products" },
      { id: "sales", label: "Sales" },
      { id: "status", label: "Status" },
      // { id: "creator", label: "Creator" },
      // { id: "price", label: "Price" },
      // { id: "items", label: "Items" },
      // { id: "flag", label: "Flag" },
      // { id: "joinedAt", label: "Joined" },
      // { id: "subscriptions", label: "Subscriptions" },
      // { id: "tipAmount", label: "Tips" },
      // { id: "spent", label: "Lifetime Spend" },
      // { id: "status", label: "Status" },
      // { id: "action", label: "Action", noSort: true }
    ],
    // subscriptionCounts: config.subscriptionCounts,
    priceCounts: config.priceCounts,
    salesCounts: [{ label: "0", value: { min: 0, max: 0 } },
    { label: "< 1,000", value: { min: 0, max: 1000 } },
    { label: "< 10,000", value: { min: 0, max: 10000 } },
    { label: "< 25,000", value: { min: 0, max: 25000 } },
    { label: "25,000+", value: { min: 25000 } },],
    filters: {
      subscriptions: "",
      creator: "",
      status: "",
      search: "",
      sales: "",
      price: "",
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
    sellerList: [],
  };

  _formatDate = (date) => {
    // console.log("TCL: Subscribers -> _formatDate -> date", date);
    return format(new Date(date), "MMM d, yyyy");
  };

  _onToggleSellerModal = (type, data) => {
    console.log(type, data);
    let { addSellerModal } = JSON.parse(JSON.stringify(this.state));
    addSellerModal.isOpen = !addSellerModal.isOpen;
    addSellerModal.type = type;
    addSellerModal.data = data;
    this.setState(
      {
        addSellerModal,
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

  _onStatusUpdate = (data) => {
    // let { subscriberList } = this.state;
    let { sellerList } = this.state;
    let creatorData = sellerList.find((each) => each.id === data.id);
    this.setState({
      sellerList,
      sellerListBackup: sellerList,
    });
    console.log(sellerList);
    this._manageLoading("change-status", true);

    let status = {}

    if(creatorData.status.toLowerCase()==='active') {
        status['isActive'] = false;
        creatorData.status = 'Inactive'
    } else {
        status['isActive'] = true;
        creatorData.status = 'Active'
    }
    
    editSeller(status,data.id).then(
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
    if (header === "vaultfolder") {
      return (
        <Link to={`/vault-view/${row.id}`}>
          <div className='d-flex justify-content-start align-items-center'>
            <div className='personImgWrap'>
              {row.vaultimage ? (
                <img
                  className='Image'
                  src={row.vaultimage}
                  alt='Profile Thumbnail'
                />
              ) : (
                <img className='Image' src={row.vaultfolder} alt='Thumbnail' />
              )}
            </div>
            {row.vaultfolder}
          </div>
        </Link>
      );
    } else if (header === "sellerStore") {
      return (
        <div
          color='ghost-primary'
          onClick={() => this._onToggleSellerModal("edit", row)}
          style={{ cursor: "pointer" }}>
          {row.sellerStore}
        </div>
      );
    } else if (header === "-phone") {
      return row.phone !== "-" ? (
        <CopyclipBoard
          copiedValue={row.phone}
          // copiedValue={parsePhoneNumberFromString(
          //   row.phone
          // ).formatInternational()}
          // border="none"
        ></CopyclipBoard>
      ) : (
        "-"
      );
    } else if (header === "published") {
      return cell ? this._formatDate(cell) : "-";
    } else if (header === "sales") {
      return row.sales > 0
        ? //<span onClick={() => this._onToggleVaultModal(row.salesList)}>
          row.sales
        : // </span>
          0;
    } else if (header === "products") {
      return row.products > 0 ? row.products : 0;
    } else if (header === "status") {
      return (
        <Input
          type='select'
          value={cell}
          onChange={() => this._onStatusUpdate(row)}
          disabled={this.state.loading.changeStatusLoading}>
          <option value='Active'>Active</option>
          <option value='Inactive'>Inactive</option>
        </Input>
      );
    } else if (header === "action") {
      return (
        <Link to={`/subscriber-view/${row.id}`}>
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
      this._filterSubscriberList();
      // this._applyFilterChanges();
  };

  // old function for frontend filtering - not using now
  _filterSubscriberList = () => {
    let filterConditions = [];
    // console.log(this.state);
    let { filters, sellerListBackup, sellerList } = this.state;
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        filterConditions.push(key);
      }
    });
    console.log(filterConditions);
    sellerList = sellerListBackup;
    if (filterConditions.length) {
      if (filters.sales) {
        const salesFilter = JSON.parse(filters.sales)
        if(salesFilter.max === 0 && salesFilter.min === 0) {
          sellerList = sellerList.filter((each) => {
            return each.sales === 0
          })
        } else if(!salesFilter.max) {
          sellerList = sellerList.filter((each) => {
              return each.sales > salesFilter.min
            })
        } else {
          sellerList = sellerList.filter((each) => {
              return each.sales > salesFilter.min && each.sales <= salesFilter.max
            })
        }
        console.log(salesFilter, sellerList)
      }
      if (filters.status) {
        sellerList = sellerList.filter((each) => {
          return each.status.toLowerCase() === filters.status.toLowerCase();
        });
      }
      if (filters.search.trim().length) {
        sellerList = sellerList.filter((each) => {
          return (
            each.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.email.toLowerCase().includes(filters.search.toLowerCase()) ||
            each.phone.toLowerCase().includes(filters.search.toLowerCase())
          );
        });
      }
      this.setState({ sellerList });
    } else {
      this.setState({ sellerList: sellerListBackup });
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
        this._getAllSeller(this.state.tableConfig);
      });
    }, 100);
  };

  _onSortChange = (sortName, sortOrder) => {
    const { tableConfig } = deepClone(this.state);
    tableConfig.sort.sortBy = this.state.subscriberFieldsKeyMap[sortName];
    tableConfig.sort.sortOrder = sortOrder;
    tableConfig.loading = true;
    this.setState({ tableConfig }, () => {
      this._getAllSeller(tableConfig);
    });
    console.log("sortName, sortOrder :", sortName, sortOrder);
  };

  _applyFilterChanges = () => {
    const { filters, tableConfig } = deepClone(this.state);
    console.log("filters :", filters);
    let data = {};
    if (filters.sales.length) {
      data = {
        salesUpper: this.state.salesCounts[filters.sales].value.min,
        salesLower: this.state.salesCounts[filters.sales].value.max,
      };
    }
    if (filters.creator.length) {
      data = {
        creatorId: this.state.filters.creator,
      };
    }
    if (filters.price.length) {
      data = {
        priceLower: this.state.priceCounts[filters.price].value.min,
        priceUpper: this.state.priceCounts[filters.price].value.max,
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
    console.log(tableConfig);
    this.setState({ tableConfig }, () => {
      this._getAllSeller(tableConfig);
    });
  };

  componentDidMount() {
    this._getAllSeller();
  }

  _getAllSeller = () => {
    this._manageLoading("data", true);
    getAllSeller()
      .then((res) => {
        console.log("api res: ", res);

        const sellerList = res.sellers.map((e) => {
          return {
            id: e._id,
            sellerStore: e.storeName,
            name: `${e.name.first} ${e.name.last}`,
            phone: e.phone && e.phone !== "-" ? e.phone : "-",
            email: e.email,
            status: e.isActive ? "Active" : "Inactive",
            products: e.productCount,
            sales: e.totalEarned,
          };
        });
        this.setState({ sellerList: sellerList, sellerListBackup: sellerList , totalCount: res.count,});
        this._manageLoading("data", false);
      })
      .catch((err) => {
        console.log("api error: ", err);
        showToast(
          err.reason && err.reason.length
            ? err.reason
            : "Server error. Try again after sometime.",
          "error"
        );
      });
  };

  render() {
    const {
      filters,
      loading,
      subscriptionCounts,
      salesCounts,
      priceCounts,
      contact,
      totalCount,
      tableConfig,
      subscriberListBackup,
      sellerList,
    } = this.state;
    //  console.log("this.state",this.state)
    const creator = subscriberListBackup
      .map((i) => {
        return { creator: i.creator, creatorId: i.creatorId };
      })
      .filter((item, pos, arr) => {
        return arr.findIndex((i) => i.creatorId === item.creatorId) === pos;
      });
    console.log(creator);
    return (
      <div className='app TruFansPgBg animated fadeIn'>
        <Container fluid>
          <Row>
            <Col xs='12'>
              <div className='PgTitle'>
                <div className=' justify-content-start align-items-center'>
                  {/* on clicking the below btn, it should take back the user to the previous page in history */}
                  {/* <Button color="ghost-dark" className="customBackBtn">
                  <i className="fa fa-arrow-left"></i>
                </Button> */}

                  <h2>Sellers</h2>
                </div>
                <button
                  className='BtnPurple'
                  onClick={() => this._onToggleSellerModal("add", null)}>
                  New Seller
                </button>
              </div>
              {/* filters */}
              {!loading.loadingData && (
                <div>
                  <div className='filterWrap'>
                    <div className='d-flex align-items-center'>
                      <i className='fa fa-filter'></i>

                      {/* <Input
                        type="select"
                        name="creator"
                        value={filters.creator}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Creator</option>
                        {creator.map((option, index) => (
                          <option key={index} value={option.creatorId}>
                            {option.creator}
                          </option>
                        ))}
                      </Input> */}
                      {/* <Input
                        type="select"
                        name="price"
                        value={filters.price}
                        onChange={this._filterOnChange}
                      >
                        <option value="">Price</option>

                        {priceCounts.map((option, index) => (
                          <option key={index} value={index}>
                            {option.label}
                          </option>
                        ))}
                      </Input> */}
                      <Input
                        type='select'
                        name='sales'
                        value={filters.sales}
                        onChange={this._filterOnChange}>
                        <option value=''>Sales</option>
                        {/*<option value='0'>0</option>
                        <option value='1,000'>&lt; $1,000</option>
                        <option value='10,000'>&lt; $10,000</option>
                        <option value='25,000'>&lt; $25,000</option>
                        <option value='25,000'>$25,000+</option> */}
                        {salesCounts.map((option, index) => (
                          <option key={index} value={JSON.stringify(option.value)}>
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
                    tableData={sellerList}
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
              <AddEditSellerModal
                type={this.state.addSellerModal.type}
                data={this.state.addSellerModal.data}
                isOpen={this.state.addSellerModal.isOpen}
                toggle={() => this._onToggleSellerModal()}
                reloadSellerList={this._getAllSeller}></AddEditSellerModal>

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

export default Seller;
