import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Input } from "reactstrap";
import CustomTable from "../../components/custom-table";
import {
  getAllCreators,
  changeUserStatus,
  sendMessage,
  editInfluencer,
} from "../../http/http-calls";
import config from "../../config";
import { ToastsStore } from "react-toasts";
import SubscriberListModal from "../../components/subscriber-list-modal";
import ReferralsListModal from "../../components/referrals-list-modal";
import CopyclipBoard from "../../components/copy-clipboard";
import TextEditor from "../../components/text-editor";
import { showToast, deepClone, formatPhoneNumber } from "../../helper-methods";
import cloneDeep from "clone-deep";
import CustomDataTable from "../../components/custom-data-table";
import AddInfluencerModal from "../../components/add-influencer-modal";
import { parsePhoneNumberFromString } from "libphonenumber-js";

class Creators extends Component {
  state = {
    subscriberModal: {
      isOpen: false,
      data: null,
    },
    referralsModal: {
      isOpen: false,
      data: null,
    },
    addInfluencerModal: {
      isOpen: false,
      data: null,
      type: "add",
    },
    creatorList: [],
    creatorListBackup: [],
    headerKeys: [
      { id: "id", label: "id" },
      { id: "name", label: "Name" },
      // { id: "flag", label: "Flag" },
      { id: "email", label: "Email" },
      { id: "phone", label: "Phone" },
      { id: "products", label: "Products" },
      { id: "sales", label: "Sales" },
      { id: "status", label: "Status" },
      { id: "action", label: "Action", noSort: true },

      // { id: "subscribers", label: "Subscribers" },
      // { id: "rate", label: "Rate" },
      // { id: "lifeTime", label: "Lifetime" },
      // { id: "referrals", label: "Referrals" },
      // { id: "paymentEnabled", label: "KYC" },
      // { id: "payoutEnabled", label: "Pay Out" },
    ],
    subscriberCounts: config.productCount,
    filters: {
      subscribers: "",
      status: "",
      search: "",
      products: "",
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
    selectedCreators: [],
    totalCount: 0,
    creatorFieldsKeyMap: {
      name: "name",
      email: "email",
      phone: "phone",
      subscribers: "_subscriptions",
      rate: "subscriptionFees",
      lifeTime: "_credit",
      referrals: "_invitations",
      paymentEnabled: "paymentEnabled",
      payoutEnabled: "payoutEnabled",
      status: "status",
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
    salesCounts: [
      { label: "0", value: { min: 0, max: 0 } },
      { label: "< 1,000", value: { min: 0, max: 1000 } },
      { label: "< 10,000", value: { min: 0, max: 10000 } },
      { label: "< 25,000", value: { min: 0, max: 25000 } },
      { label: "25,000+", value: { min: 25000 } },
    ],
  };

  _onToggleInfluencerModal = (type, data) => {
    let { addInfluencerModal } = JSON.parse(JSON.stringify(this.state));
    addInfluencerModal.isOpen = !addInfluencerModal.isOpen;
    addInfluencerModal.type = type;
    addInfluencerModal.data = data;

    // referralsModal.data = creator;
    this.setState(
      {
        addInfluencerModal,
      },
      () => {
        console.log(this.state);
      }
    );
  };

  _onToggleSubscriberModal = (creator) => {
    let { subscriberModal } = JSON.parse(JSON.stringify(this.state));
    subscriberModal.isOpen = !subscriberModal.isOpen;
    subscriberModal.data = creator;
    this.setState(
      {
        subscriberModal,
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
    let { creatorList } = this.state;
    let creatorData = creatorList.find((each) => each.id === data.id);
    // creatorData.status =
    //   creatorData.status === "Active" ? "Inactive" : "Active";
    this.setState({
      creatorList,
      creatorListBackup: creatorList,
    });
    console.log(creatorList);
    this._manageLoading("change-status", true);

    let status = {};

    if (creatorData.status.toLowerCase() === "active") {
      status["isActive"] = false;
      creatorData.status = "Inactive";
    } else {
      status["isActive"] = true;
      creatorData.status = "Active";
    }

    editInfluencer(status, data.id).then(
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
    // console.log(cell, row, header);
    if (header === "-name") {
      return (
        <Link to={`/creator-view/${row.id}`}>
          <div className='d-flex justify-content-start align-items-center'>
            {/* <div className="personImgWrap">
              <img
                className="personImg"
                src={row.profilePicture}
                alt="Profile Thumbnail"
              />
            </div> */}
            <img
              src={`https://www.countryflags.io/${row.flag}/flat/24.png`}
              alt='flag'
              className='mr-2'
            />
            {row.name}
          </div>
        </Link>
      );
      // } else if (header === "flag") {
      //  return (
      //     <img src={`https://www.countryflags.io/${row.flag}/flat/24.png`} alt="flag" />
      //   )
    } else if (header === "-email") {
      return row.email ? (
        <CopyclipBoard copiedValue={row.email} border='none'></CopyclipBoard>
      ) : (
        "-"
      );
    } else if (header === "-phone") {
      return row.phone !== "-" ? (
        <CopyclipBoard
          copiedValue={row.phone}
          // copiedValue={parsePhoneNumberFromString(
          //   row.phone
          // ).formatInternational()}
          border='none'></CopyclipBoard>
      ) : (
        "-"
      );
    } else if (header === "-sales") {
      return row.sales > 0 ? row.sales : 0;
    } else if (header === "-products") {
      return row.products > 0 ? row.products : 0;
    } else if (header === "subscribers") {
      return cell.length ? (
        <span onClick={() => this._onToggleSubscriberModal(row)}>
          {cell.length}
        </span>
      ) : (
        0
      );
    } else if (header === "referrals") {
      return cell.length ? (
        <span onClick={() => this._onToggleReferralsModal(row)}>
          {cell.length}
        </span>
      ) : (
        "-"
      );
    } else if (header === "paymentEnabled") {
      return (
        <div>
          {row.paymentEnabled ? (
            <i
              className='fa fa-check'
              aria-hidden='true'
              title='Pay in completed'></i>
          ) : (
            <i
              className='fa fa-times'
              aria-hidden='true'
              title='Pay in incompleted'></i>
          )}
          &nbsp;
          {row.payoutEnabled ? (
            <i
              className='fa fa-check'
              aria-hidden='true'
              title='Pay out completed'></i>
          ) : (
            <i
              className='fa fa-times'
              aria-hidden='true'
              title='Pay out incompleted'></i>
          )}
        </div>
      );
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
        <>
          {/* <Link to={`/creator-view/${row.id}`}> */}
          <Button
            className='mr-2'
            color='ghost-primary'
            onClick={() => this._onToggleInfluencerModal("edit", row)}>
            <i className='fa fa-pencil'></i>
            {/* Edit */}
          </Button>
          <Link to={"/"} target='_blank'>
            <span style={{ color: "orangered", textDecoration: "none" }}>
              {/* Profile View */}
              <i className='fa fa-eye'></i>
            </span>
          </Link>
          {/* <Button
            color="ghost-primary"
            onClick={() => this._onToggleInfluencerModal("view", row)}
          >
            View
          </Button> */}
          {/* </Link> */}
        </>
      );
    } else if (header === "rate") {
      return (
        <p>
          <span title='Basic' style={{ textDecoration: "none" }}>
            {row.rate && Number.isInteger(row.rate)
              ? "$" + row.rate
              : row.rate === 0
              ? 0
              : "$" + row.rate.toFixed(2)}
          </span>
          &nbsp; &nbsp;
          <span title='Plus' style={{ textDecoration: "none" }}>
            {row.plus && Number.isInteger(row.plus)
              ? "$" + row.plus
              : row.plus === 0
              ? 0
              : "$" + row.plus.toFixed(2)}
          </span>
          &nbsp; &nbsp;
          <span title='Premium' style={{ textDecoration: "none" }}>
            {row.premium && Number.isInteger(row.premium)
              ? "$" + row.premium
              : row.premium === 0
              ? 0
              : "$" + row.premium.toFixed(2)}
          </span>
        </p>
      );
      // return typeof cell === "number" ? "$" + cell.toFixed(2) : "-";
    } else if (header === "lifeTime") {
      return typeof cell === "number" ? cell.toFixed(2) : "-";
    } else {
      return cell;
    }
  };

  _getAllCreators = (data) => {
    let { creatorList, tableConfig } = deepClone(this.state);
    if (!creatorList.length) {
      this._manageLoading("data", true);
    }
    getAllCreators(data).then(
      (response) => {
        this._manageLoading("data", false);
        tableConfig.loading = false;
        this.setState({ tableConfig });
        let creatorListResp = response.influencers.map((each) => {
          return {
            name: `${each.name.first} ${each.name.last}`,
            id: each.id,
            email: each.email,
            phone: each.phone || "-",
            sales: each.totalEarned,
            products: each.productCount,
            status: each.isActive ? "Active" : "Inactive",
          };
        });
        this.setState({
          creatorList: creatorListResp,
          creatorListBackup: creatorListResp,
          totalCount: response.count,
        });
      },
      (error) => {
        console.log(error);
        tableConfig.loading = false;
        this.setState({ tableConfig });
        this._manageLoading("data", false);

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
    this.setState({ filters });
    // if (currentTarget.name !== "search") {
    this._filterCreatorList();
    // this._applyFilterChanges();
    // }
  };

  // old function for frontend filtering - not using now
  _filterCreatorList = () => {
    let filterConditions = [];
    // console.log(this.state);
    let { filters, creatorListBackup, creatorList } = this.state;
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        filterConditions.push(key);
      }
    });
    console.log(filterConditions);
    creatorList = creatorListBackup;
    if (filterConditions.length) {
      if (filters.sales) {
        const salesFilter = JSON.parse(filters.sales);
        if (salesFilter.max === 0 && salesFilter.min === 0) {
          creatorList = creatorList.filter((each) => {
            return each.sales === 0;
          });
        } else if (!salesFilter.max) {
          creatorList = creatorList.filter((each) => {
            return each.sales > salesFilter.min;
          });
        } else {
          creatorList = creatorList.filter((each) => {
            return (
              each.sales > salesFilter.min && each.sales <= salesFilter.max
            );
          });
        }
        console.log(salesFilter, creatorList);
      }
      if (filters.products) {
        const productsFilter = JSON.parse(filters.products);
        if (productsFilter.max === 0 && productsFilter.min === 0) {
          creatorList = creatorList.filter((each) => {
            return each.products === 0;
          });
        } else if (!productsFilter.max) {
          creatorList = creatorList.filter((each) => {
            return each.products > productsFilter.min;
          });
        } else {
          creatorList = creatorList.filter((each) => {
            return (
              each.products >= productsFilter.min &&
              each.products <= productsFilter.max
            );
          });
        }
        console.log(productsFilter, creatorList);
      }
      if (filters.status) {
        creatorList = creatorList.filter((each) => {
          return each.status.toLowerCase() === filters.status.toLowerCase();
        });
      }
      if (filters.search.trim().length) {
        creatorList = creatorList.filter((each) => {
          return (
            each.name
              .toLowerCase()
              .includes(filters.search.trim().toLowerCase()) ||
            each.email
              .toLowerCase()
              .includes(filters.search.trim().toLowerCase()) ||
            each.phone
              .toLowerCase()
              .includes(filters.search.trim().toLowerCase())
          );
        });
      }
      this.setState({ creatorList });
    } else {
      this.setState({ creatorList: creatorListBackup });
    }
  };

  _setSelectedRows = (data) => {
    console.log(data);
    let { selectedCreators } = this.state;
    selectedCreators = data;
    this.setState({ selectedCreators });
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
    let { contact, selectedCreators } = this.state;
    let data = {
      idlist: selectedCreators,
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
        this._getAllCreators(this.state.tableConfig);
      });
    }, 100);
  };

  _onSortChange = (sortName, sortOrder) => {
    const { tableConfig } = deepClone(this.state);
    tableConfig.sort.sortBy = this.state.creatorFieldsKeyMap[sortName];
    tableConfig.sort.sortOrder = sortOrder;
    tableConfig.loading = true;
    this.setState({ tableConfig }, () => {
      this._getAllCreators(tableConfig);
    });
    console.log("sortName, sortOrder :", sortName, sortOrder);
  };

  _applyFilterChanges = () => {
    const { filters, tableConfig } = deepClone(this.state);

    let data = {};
    if (filters.subscribers.length) {
      data._subscriptions = {
        lowerLimit: this.state.subscriberCounts[filters.subscribers].value.min,
        upperLimit: this.state.subscriberCounts[filters.subscribers].value.max,
      };
    }
    if (filters.status.length) {
      data.isActive = filters.status === "Active" ? true : false;
    }

    tableConfig.filters = data;
    if (filters.search.length) {
      tableConfig.search = filters.search;
    } else {
      tableConfig.search = "";
    }
    tableConfig.loading = true;
    this.setState({ tableConfig }, () => {
      this._getAllCreators(tableConfig);
    });
  };

  componentDidMount() {
    this._getAllCreators(this.state.tableConfig);
  }

  render() {
    console.log("creatorList", this.state.creatorList);
    const {
      contact,
      loading,
      totalCount,
      tableConfig,
      salesCounts,
    } = this.state;

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

                  <h2>Influencers</h2>
                </div>
                <button
                  className='BtnPurple'
                  onClick={() => this._onToggleInfluencerModal("add", null)}>
                  <i className='fa fa-plus mr-1'></i>New Influencer
                </button>
              </div>

              {!this.state.loading.loadingData && (
                <div>
                  {/* filters */}
                  <div className='filterWrap'>
                    <div className='d-flex align-items-center'>
                      <i className='fa fa-filter'></i>

                      <Input
                        type='select'
                        name='sales'
                        value={this.state.filters.sales}
                        onChange={this._filterOnChange}>
                        <option value=''>Sales</option>
                        {/* <option value=''>0</option>
                        <option value=''>&lt; $1,000</option>
                        <option value=''>&lt; $10,000</option>
                        <option value=''>&lt; $25,000</option>
                        <option value=''>$25,000+</option> */}
                        {salesCounts.map((option, index) => (
                          <option
                            key={index}
                            value={JSON.stringify(option.value)}>
                            {option.label}
                          </option>
                        ))}
                      </Input>

                      <Input
                        type='select'
                        name='products'
                        value={this.state.filters.products}
                        onChange={this._filterOnChange}>
                        <option value=''>Products</option>
                        {this.state.subscriberCounts.map((option, index) => (
                          <option
                            key={index}
                            value={JSON.stringify(option.value)}>
                            {option.label}
                          </option>
                        ))}
                      </Input>
                      <Input
                        type='select'
                        name='status'
                        value={this.state.filters.status}
                        onChange={this._filterOnChange}>
                        <option value=''>Status</option>
                        <option value='Active'>Active</option>
                        <option value='Inactive'>Inactive</option>
                      </Input>
                    </div>

                    <div className='d-flex align-items-center'>
                      <Input
                        type='text'
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
                  </div>

                  {/* <CustomTable
                    tableData={this.state.creatorList}
                    headerKeys={this.state.headerKeys}
                    dataFormat={this._dataFormat}
                    rowSelection={true}
                    setSelectedRows={data => this._setSelectedRows(data)}
                  ></CustomTable> */}

                  <CustomDataTable
                    tableData={this.state.creatorList}
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
              {this.state.loading.loadingData && (
                <div className='filterWrap'>
                  <div className='loading-section list-loading'>
                    <i className='fa fa-spinner fa-spin'></i> &nbsp; Loading
                    Creators..
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

              {/* Modal for "Subscribers" */}
              <SubscriberListModal
                isOpen={this.state.subscriberModal.isOpen}
                creatorData={this.state.subscriberModal.data}
                toggle={() =>
                  this._onToggleSubscriberModal()
                }></SubscriberListModal>

              {/* Modal for "Referrals" */}
              <ReferralsListModal
                isOpen={this.state.referralsModal.isOpen}
                creatorData={this.state.referralsModal.data}
                toggle={() =>
                  this._onToggleReferralsModal()
                }></ReferralsListModal>
              {/* Modal for adding Influencers */}
              <AddInfluencerModal
                type={this.state.addInfluencerModal.type}
                data={this.state.addInfluencerModal.data}
                isOpen={this.state.addInfluencerModal.isOpen}
                toggle={() => this._onToggleInfluencerModal()}
                reloadInfluencerList={
                  this._getAllCreators
                }></AddInfluencerModal>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Creators;
