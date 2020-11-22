import React, { Component } from "react";
import { Col, Input, Row, Label } from "reactstrap";
import Loader from "./loader";
import { getCreatorActivity } from "../http/http-calls";
import { showToast, deepClone } from "../helper-methods/index";
import CreatorFeedViewer from "./creator-feed-viewer";

class CreatorFeedList extends Component {
  state = {
    activities: [],
    isLoading: true
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
      getCreatorActivity(this.props.match.params.id)
        .then(resp => {
          this.setState({ activities: resp.posts, isLoading: false });
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
  render() {
    const { activities, isLoading } = deepClone(this.state);
    const { user } = this.props;
    
    return (
      <>
        <Row>
          <Col
            sm="12"
            style={{ display: "flex", justifyContent: "center" }}
          >
        
            {isLoading ? <Loader /> : null}

           
          </Col>
        </Row>
        {activities && activities.length ? (
          activities.map((activity, index) => (
            <CreatorFeedViewer
              key={index}
              feed={activity}
              user = {user}
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

export default CreatorFeedList;
