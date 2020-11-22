import React, { Component } from "react";
import { Col, Container, Row, Button } from "reactstrap";
import { deepClone, showToast } from "../helper-methods";
import { getPostDetails } from "../http/http-calls";
import SubscriberFeedViewer from "../components/subscriber-feed-viewer";
import CreatorFeedViewer from "../components/creator-feed-viewer";

class PostDetailsPage extends Component {
  state = {
    feed: JSON.parse(localStorage.getItem("feed")),
    loading: {
      loadingData: false,
      sendingMessage: false
    }
  };

  componentDidMount() {
    this._manageLoading("data", true);

    this._fetchPostDetails();
  }

  _manageLoading = (key, value) => {
    let { loadingData, changeStatusLoading } = this.state.loading;
    if (key === "data") {
      loadingData = value;
    } else if (key === "change-status") {
      changeStatusLoading = value;
    }
    this.setState({ loading: { loadingData, changeStatusLoading } });
  };

  _fetchPostDetails = () => {
    getPostDetails(this.props.match.params.id)
      .then(res => {
        console.log("TCL: PostDetailsPage -> res", res);
        this.setState(
          {
            feed: res.post
          },
          () => {
            this._manageLoading("data", false);
            // this.props.hideLoader();
          }
        );
      })
      .catch(err => {
        // this.props.hideLoader();
        showToast(
          err.reason && err.reason.length
            ? err.reason
            : "Server error. Try again after sometime.",
          "error"
        );
        this.props.history.goBack();
      });
  };

  //   _pinToProfile = (id, isPinned) => {

  //     editPost({ isPinned }, id)
  //       .then(response => {
  //         showToast("Updated Successfully", "success");
  //         this._fetchPostDetails();
  //         // this._scrollToTop();
  //         // this._getPosts();
  //       })
  //       .catch(err => {
  //         showToast(
  //           err.reason && err.reason.length
  //             ? err.reason
  //             : "Server error. Try again after sometime.",
  //           "error"
  //         );
  //       });
  //   };

  //   _deletePost = feed => {

  //     deletPost(feed.id)
  //       .then(resp => {
  //         this.props.hideLoader();
  //         showToast("Deleted Successfully", "success");
  //         this.props.history.push("/feed");
  //         // this._getPosts();
  //       })
  //       .catch(err => {
  //         this.props.hideLoader();

  //         showToast(
  //           err.reason && err.reason.length
  //             ? err.reason
  //             : "Server error. Try again after sometime.",
  //           "error"
  //         );
  //       });
  //   };

  render() {
    const { feed, loading } = deepClone(this.state);
    console.log("TCL: PostDetailsPage -> render -> feed", feed);
    return (
      <div className="app TruFansPgBg animated fadeIn">
        <Container>
          <Button
            color="ghost-dark"
            className="customBackBtn"
            style={{ paddingTop: 30, paddingLeft: 80 }}
            onClick={this.props.history.goBack}
          >
            <i className="fa fa-arrow-left"></i>
          </Button>
          {loading.loadingData && (
            <div className="filterWrap">
              <div className="loading-section list-loading">
                <i className="fa fa-spinner fa-spin"></i> &nbsp; Fetching post
                details...
              </div>
            </div>
          )}{" "}
          {!loading.loadingData && (
            <Row className="mb-4 justify-content-center mt-3 mt-sm-3 mt-md-4">
              <Col sm={12} md={10} lg={8}>
                {feed ? (
                  <CreatorFeedViewer feed={feed} user={feed._influencer} {...this.props} />
                ) : null}
              </Col>
            </Row>
          )}
        </Container>
      </div>
    );
  }
}

export default PostDetailsPage;
