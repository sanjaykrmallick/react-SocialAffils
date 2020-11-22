import React, { Component } from "react";
import { Col, Input, Label, Row } from "reactstrap";
import { deepClone, showToast, sortedThreads } from "../helper-methods/index";
import { getSubscriberActivity } from "../http/http-calls";
import Loader from "./loader";
import SubscriberFeedViewer from "./subscriber-feed-viewer";

class SubscriberActivityList extends Component {
  state = {
    activities: [],
    isLoading: true,
    filterText: "",
    filteredActivities: []
  };

  constructor(props) {
    super(props);
    this._fetchActivities = this._fetchActivities.bind(this);
  }
  componentDidMount() {
    this.props.updateRef(this._fetchActivities);
  }

  _fetchActivities = () => {
    this.setState({ isLoading: true }, () => {
      getSubscriberActivity(this.props.match.params.id)
        .then(resp => {
          this.setState({
            activities: resp.activities,
            isLoading: false,
            filteredActivities: this._filterActvities(resp.activities)
          });
        })
        .catch(err => {
          this.setState({ isLoading: false });
          showToast(
            err.reason && err.reason.length
              ? err.reason
              : "Server error. Try again after sometime.",
            "error"
          );
        });
    });
  };

  _changeFilter = filterText => {
    const { activities } = deepClone(this.state);
    this.setState({ isLoading: true }, () => {
      this.setState({ filterText }, () => {
        this.setState(
          { filteredActivities: this._filterActvities(activities) },
          () => {
            this.setState({ isLoading: false });
          }
        );
      });
    });
  };

  _filterActvities = arr => {
    const { filterText } = deepClone(this.state);
    return arr.filter(item => {
      return (
        !filterText.length ||
        (filterText.length && item.activityType == filterText)
      );
    });
  };

  render() {
    const { isLoading, filterText, filteredActivities } = deepClone(this.state);
    const { user } = this.props;

    return (
      <>
        <Row>
          <Col sm="4" />
          <Col sm="4" style={{ display: "flex", justifyContent: "center" }}>
            {isLoading ? <Loader /> : null}
          </Col>
          <Col sm="4">
            <div style={{ width: "150px", float: "right" }}>
              <Input
                type="select"
                name="status"
                id=""
                style={{ minWidth: "150px" }}
                value={filterText}
                onChange={e => this._changeFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="comment">Comment</option>
                <option value="like">Like</option>
                <option value="ppv">Pay Per View</option>
                <option value="tips">Tips</option>
              </Input>
            </div>
          </Col>
        </Row>
        {filteredActivities && filteredActivities.length ? (
          filteredActivities.map((activity, index) => (
            <SubscriberFeedViewer
              key={index}
              feed={activity}
              user={user}
              {...this.props}
            />
          ))
        ) : !isLoading ? (
          <Label>No activity found yet</Label>
        ) : null}
      </>
    );
  }
}

export default SubscriberActivityList;
