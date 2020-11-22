import React, { Component } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Input,
} from "reactstrap";
import { Bar, Line } from "react-chartjs-2";
import { CustomTooltips } from "../../node_modules/@coreui/coreui-plugin-chartjs-custom-tooltips";
import {
  getDashboardSummary,
  getAllCreators,
  getTopCreators,
  getTopSubscriber,
  getCreatorsPerMonth,
  getSubscribersPerMonth,
  getAllUsers,
} from "../http/http-calls";
// import { ToastsStore } from "react-toasts";
import config from "../config";
import moment from "moment";
import { formatCurrencyValue, showToast } from "../helper-methods";
const options = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips,
  },
  maintainAspectRatio: false,
  legend: false,
};

class Home extends Component {
  state = {
    creatorList: [],
    summary: {
      creators: 0,
      subscribers: 0,
      ppvs: 0,
      subscriptions: 0,
      tips: 0,
    },
    filterOptions: [
      { label: "This Week", value: "week" },
      { label: "This Month", value: "month" },
      { label: "This Year", value: "year" },
    ],
    filters: {
      topCreator: "week",
      topSubscriber: "week",
      creator: "",
    },
    topCreatorChartData: {},
    topSubscriberChartData: {},
    creatorsPerMonthChartData: {},
    subscribersPerMonthChartData: {},
    loading: {
      topCreator: false,
      topSubscriber: false,
      creatorsPerMonth: false,
      subscribersPerMonth: false,
    },
  };

  _manageLoading = (key, value) => {
    let {
      topCreator,
      topSubscriber,
      creatorsPerMonth,
      subscribersPerMonth,
    } = this.state.loading;
    if (key === "topCreator") {
      topCreator = value;
    } else if (key === "topSubscriber") {
      topSubscriber = value;
    } else if (key === "creatorsPerMonth") {
      creatorsPerMonth = value;
    } else if (key === "subscribersPerMonth") {
      subscribersPerMonth = value;
    }
    this.setState({
      loading: {
        topCreator,
        topSubscriber,
        creatorsPerMonth,
        subscribersPerMonth,
      },
    });
  };

  _getDashboardSummary = () => {
    console.log("getDashboardSummary");
    getDashboardSummary().then(
      (response) => {
        console.log(response);
        let summary = {
          creators: response.creators,
          subscribers: response.fans,
          liveEvents: formatCurrencyValue(response.liveEvents),
          payperviews: formatCurrencyValue(response.payperviews),
          subscriptions: formatCurrencyValue(response.subscriptions),
          tips: formatCurrencyValue(response.tips),
          unlocks: formatCurrencyValue(response.unlocks),
          vaults: formatCurrencyValue(response.vaults),
        };
        this.setState({ summary });
      },
      (error) => {
        console.log(error);
      }
    );
  };

  // not using now
  _getAllCreators = () => {
    // this._manageLoading('data', true);
    getAllCreators().then(
      (response) => {
        console.log(response);
        // this._manageLoading('data', false);
        let creatorList = response.influencers.map((each) => {
          return {
            name: each.name.full,
            id: each.id,
          };
        });
        this.setState({
          creatorList,
        });
      },
      (error) => {
        console.log(error);
        // this._manageLoading('data', false);
        // ToastsStore.error(error.reason, 3000);
      }
    );
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
        this.setState({
          creatorList,
        });
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

  _getTopCreators = (data) => {
    getTopCreators(data).then(
      (response) => {
        let topCreator = response.influencers.sort(function (a, b) {
          return b._subCount - a._subCount;
        });
        topCreator = topCreator.slice(0, 10);
        console.log(topCreator);
        let topCreatorChartData = {
          labels: topCreator.map((e, i) => {
            return e.name.full;
          }),
          datasets: [
            {
              label: "",
              backgroundColor: "rgba(95, 66, 170, 0.3)",
              borderColor: "rgba(95, 66, 170, 1)",
              borderWidth: 1,
              hoverBackgroundColor: "rgba(95, 66, 170, 0.5)",
              hoverBorderColor: "rgba(95, 66, 170, 1)",
              data: topCreator.map((e, i) => {
                return e._subCount;
              }),
            },
          ],
        };
        this.setState({ topCreatorChartData });
      },
      (error) => {
        console.log(error);
      }
    );
  };

  _getTopSubscriber = (data) => {
    getTopSubscriber(data).then(
      (response) => {
        let topSubscriber = response.fans.sort(function (a, b) {
          return b._subCount - a._subCount;
        });
        topSubscriber = topSubscriber.slice(0, 10);
        let topSubscriberChartData = {
          labels: topSubscriber.map((e, i) => {
            return e.name.full.substring(0, 10);
          }),
          datasets: [
            {
              label: "",
              backgroundColor: "rgba(95, 66, 170, 0.3)",
              borderColor: "rgba(95, 66, 170, 1)",
              borderWidth: 1,
              hoverBackgroundColor: "rgba(95, 66, 170, 0.5)",
              hoverBorderColor: "rgba(95, 66, 170, 1)",
              data: topSubscriber.map((e, i) => {
                return e._subCount;
              }),
            },
          ],
        };
        this.setState({ topSubscriberChartData });
      },
      (error) => {
        console.log(error);
      }
    );
  };

  _getCreatorsPerMonth = () => {
    getCreatorsPerMonth().then(
      (response) => {
        console.log(response.influencers);
        let creatorsData = config.monthList.map((each, index) => {
          let creator = response.influencers.find((item) => {
            return item._id.month === index + 1;
          });
          if (creator) {
            return creator.count;
          } else {
            return 0;
          }
        });
        let creatorsPerMonthChartData = {
          labels: config.monthList,
          datasets: [
            {
              label: "",
              fill: false,
              lineTension: 0.1,
              backgroundColor: "rgba(95, 66, 170, 0.4)",
              borderColor: "rgba(95, 66, 170,1)",
              borderCapStyle: "butt",
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: "miter",
              pointBorderColor: "rgba(255, 64, 159, 1)",
              pointBackgroundColor: "#fff",
              pointBorderWidth: 5,
              pointHoverRadius: 8,
              pointHoverBackgroundColor: "rgba(95, 66, 170, 1)",
              pointHoverBorderColor: "rgba(220,220,220,1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: creatorsData,
            },
          ],
        };
        this.setState({ creatorsPerMonthChartData });
      },
      (error) => {
        console.log(error);
      }
    );
  };

  _getSubscribersPerMonth = () => {
    let data = {};
    if (this.state.filters.creator) {
      data.id = this.state.filters.creator;
    }
    getSubscribersPerMonth(data).then(
      (response) => {
        let subscriberData = config.monthList.map((each, index) => {
          let subscriber = response.subscriptions.find((item) => {
            return item._id.month === index + 1;
          });
          if (subscriber) {
            return subscriber.count;
          } else {
            return 0;
          }
        });
        let subscribersPerMonthChartData = {
          labels: config.monthList,
          datasets: [
            {
              label: "",
              fill: false,
              lineTension: 0.1,
              backgroundColor: "rgba(95, 66, 170, 0.4)",
              borderColor: "rgba(95, 66, 170,1)",
              borderCapStyle: "butt",
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: "miter",
              pointBorderColor: "rgba(255, 64, 159, 1)",
              pointBackgroundColor: "#fff",
              pointBorderWidth: 5,
              pointHoverRadius: 8,
              pointHoverBackgroundColor: "rgba(95, 66, 170, 1)",
              pointHoverBorderColor: "rgba(220,220,220,1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: subscriberData,
            },
          ],
        };
        this.setState({ subscribersPerMonthChartData });
      },
      (error) => {
        console.log(error);
      }
    );
  };

  _handleOnchange = ({ currentTarget }, key) => {
    const { filters } = this.state;
    filters[currentTarget.name] = currentTarget.value;
    this.setState({ filters });
    if (key === "topCreator") {
      console.log(filters.topCreator);
      if (filters.topCreator === "week") {
        const today = moment();
        const startdate = today
          .startOf("week")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        const enddate = today
          .endOf("week")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        this._getTopCreators({ startdate, enddate });
      } else if (filters.topCreator === "month") {
        const today = moment();
        const startdate = today
          .startOf("month")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        const enddate = today
          .endOf("month")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        this._getTopCreators({ startdate, enddate });
      } else {
        const today = moment();
        const startdate = today
          .startOf("year")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        const enddate = today
          .endOf("year")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        this._getTopCreators({ startdate, enddate });
      }
    } else {
      if (filters.topSubscriber === "week") {
        const today = moment();
        const startdate = today
          .startOf("week")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        const enddate = today
          .endOf("week")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        this._getTopSubscriber({ startdate, enddate });
      } else if (filters.topSubscriber === "month") {
        const today = moment();
        const startdate = today
          .startOf("month")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        const enddate = today
          .endOf("month")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        this._getTopSubscriber({ startdate, enddate });
      } else {
        const today = moment();
        const startdate = today
          .startOf("year")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        const enddate = today
          .endOf("year")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        this._getTopSubscriber({ startdate, enddate });
      }
    }
  };

  _getWeeklyTopCreators = () => {
    const today = moment();
    const startdate = today
      .startOf("week")
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    const enddate = today.endOf("week").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    this._getTopCreators({ startdate, enddate });
  };

  _getWeeklyTopSubscribers = () => {
    const today = moment();
    const startdate = today
      .startOf("week")
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    const enddate = today.endOf("week").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    this._getTopSubscriber({ startdate, enddate });
  };

  _onSelectCreator = ({ currentTarget }) => {
    const { filters } = this.state;
    filters[currentTarget.name] = currentTarget.value;
    this.setState({ filters });
    this._getSubscribersPerMonth();
  };

  componentDidMount() {
    this._getDashboardSummary();
    // this._getAllCreators();
    this._getAllUsers();
    this._getWeeklyTopCreators();
    this._getWeeklyTopSubscribers();
    this._getCreatorsPerMonth();
    this._getSubscribersPerMonth();
  }

  render() {
    const {
      summary,
      filters,
      filterOptions,
      topCreatorChartData,
      topSubscriberChartData,
      creatorsPerMonthChartData,
      subscribersPerMonthChartData,
      creatorList,
    } = this.state;
    return (
      <div className="app TruFansPgBg animated fadeIn">
        <Container>
          <Row>
            <Col xs="12">
              <div className="PgTitle">
                <h2>Dashboard</h2>
              </div>
            </Col>

            <Col sm="6" md="6" lg="3">
              <Card className="dashboardCard">
                <CardHeader>
                  Influencers
                  <span className="bgIcon">
                    <i className="icon-user"></i>
                  </span>
                </CardHeader>
                <CardBody>{summary.creators}</CardBody>
              </Card>
            </Col>

            <Col sm="6" md="6" lg="3">
              <Card className="dashboardCard">
                <CardHeader>
                  Subscribers
                  <span className="bgIcon" style={{ right: "-5px" }}>
                    <i className="icon-user-follow"></i>
                  </span>
                </CardHeader>
                <CardBody>{summary.subscribers}</CardBody>
              </Card>
            </Col>

            <Col sm="6" md="6" lg="3">
              <Card className="dashboardCard">
                <CardHeader>
                  Subscription Fees
                  <span
                    className="bgIcon"
                    style={{ right: "-7px", top: "-21px" }}
                  >
                    <i className="fa fa-dollar"></i>
                  </span>
                </CardHeader>
                <CardBody>{summary.subscriptions}</CardBody>
              </Card>
            </Col>
            <Col sm="6" md="6" lg="3">
              <Card className="dashboardCard">
                <CardHeader>
                  Live Events
                  <span
                    className="bgIcon"
                    style={{ right: "-7px", top: "-21px" }}
                  >
                    <i className="fa fa-calendar"></i>
                  </span>
                </CardHeader>
                <CardBody>{summary.liveEvents}</CardBody>
              </Card>
            </Col>
            <Col sm="6" md="6" lg="3">
              <Card className="dashboardCard">
                <CardHeader>
                  PPV
                  <span
                    className="bgIcon"
                    style={{ right: "-7px", top: "-21px" }}
                  >
                    <i className="fa fa-dollar"></i>
                  </span>
                </CardHeader>
                <CardBody>{summary.payperviews}</CardBody>
              </Card>
            </Col>
            <Col sm="6" md="6" lg="3">
              <Card className="dashboardCard">
                <CardHeader>
                  Vault
                  <span
                    className="bgIcon"
                    style={{ right: "-7px", top: "-21px" }}
                  >
                    <i className="fa fa-lock"></i>
                  </span>
                </CardHeader>
                <CardBody>{summary.vaults}</CardBody>
              </Card>
            </Col>
            <Col sm="6" md="6" lg="3">
              <Card className="dashboardCard">
                <CardHeader>
                  Unlock
                  <span
                    className="bgIcon"
                    style={{ right: "-7px", top: "-21px" }}
                  >
                    <i className="fa fa-unlock"></i>
                  </span>
                </CardHeader>
                <CardBody>{summary.unlocks}</CardBody>
              </Card>
            </Col>
            {/* <Col sm="6" md="6" lg="3">
              <Card className="dashboardCard">
                <CardHeader>
                  Tips
                  <span
                    className="bgIcon"
                    style={{ right: "-7px", top: "-21px" }}
                  >
                    <i className="fa fa-comment-o"></i>
                  </span>
                </CardHeader>
                <CardBody>83</CardBody>
              </Card>
            </Col> */}
          </Row>
          <Row>
            <Col sm="12" md="6">
              <Card className="dashboardCard-Graph">
                <CardHeader className="d-flex justify-content-between align-items-center">
                  Top 10 Creators
                  <Input
                    type="select"
                    name="topCreator"
                    style={{ width: "130px" }}
                    value={filters.topCreator}
                    onChange={(e) => this._handleOnchange(e, "topCreator")}
                  >
                    <option value="">Select</option>
                    {filterOptions.map((each) => (
                      <option value={each.value} key={each.label}>
                        {each.label}
                      </option>
                    ))}
                  </Input>
                </CardHeader>
                <CardBody>
                  <div className="chart-wrapper">
                    <Bar data={topCreatorChartData} options={options} />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col sm="12" md="6">
              <Card className="dashboardCard-Graph">
                <CardHeader className="d-flex justify-content-between align-items-center">
                  Top 10 Subscribers
                  <Input
                    type="select"
                    name="topSubscriber"
                    style={{ width: "130px" }}
                    value={filters.topSubscriber}
                    onChange={(e) => this._handleOnchange(e, "topSubscriber")}
                  >
                    <option value="">Select</option>
                    {filterOptions.map((each) => (
                      <option value={each.value} key={each.label}>
                        {each.label}
                      </option>
                    ))}
                  </Input>
                </CardHeader>
                <CardBody>
                  <div className="chart-wrapper">
                    <Bar data={topSubscriberChartData} options={options} />
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col sm="12" md="6">
              <Card className="dashboardCard-Graph">
                <CardHeader>No. of Creators joined per month</CardHeader>
                <CardBody>
                  <div className="chart-wrapper">
                    <Line data={creatorsPerMonthChartData} options={options} />
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col sm="12" md="6">
              <Card className="dashboardCard-Graph">
                <CardHeader className="d-flex justify-content-between align-items-center">
                  No. of Subscribers joined per month
                  <Input
                    type="select"
                    name="creator"
                    id=""
                    style={{ width: "130px" }}
                    value={filters.creator}
                    onChange={this._onSelectCreator}
                  >
                    <option value="">All</option>
                    {creatorList.map((each) => (
                      <option key={each.id} value={each.id}>
                        {each.name}
                      </option>
                    ))}
                  </Input>
                </CardHeader>
                <CardBody>
                  <div className="chart-wrapper">
                    <Line
                      data={subscribersPerMonthChartData}
                      options={options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <br />
        </Container>
      </div>
    );
  }
}

export default Home;
