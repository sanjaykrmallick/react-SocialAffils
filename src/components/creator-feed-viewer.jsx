import React, { Component } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardText,
  Carousel,
  CarouselControl,
  CarouselIndicators,
  CarouselItem
} from "reactstrap";
import { Link } from "react-router-dom";
import PostEarningsModal from "../components/post-earnings-modal";
import config from "../config";
import PollOption from "../components/poll-option-component";
import PostCommentSection from "../components/post-comment-section";
import { deepClone, getPostedDateValue } from "../helper-methods";
import { getComments } from "../http/http-calls";
import { ToastsStore } from "react-toasts";
import ReportPostModal from "./report-post-modal";
import ReactHtmlParser from "react-html-parser";

class CreatorFeedViewer extends Component {
  state = {
    comments: [],
    dropdownOpen: false,
    activeIndex: 0,
    duration: 0,
    decodedUserDetails: null,
    custom: [false],
    isCommentScetionOpen: false,
    isPrompt: false,
    isPostEarningsModalOpen: false,
    flagModalVisible: false
  };

  now = 60;

  constructor(props) {
    super(props);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goToIndex = this.goToIndex.bind(this);
    this.audio = React.createRef();
    this.postCommentRef = React.createRef();
  }

  componentDidMount() {
    let { decodedUserDetails } = this.state;
    // decodedUserDetails = decodeToken(this.props.userData.token);
    this.setState({ decodedUserDetails });
    if (this.audio !== null) {
      const audio = Object.assign({}, this.audio);
      audio.onloadedmetadata = () => {
        this.setState({
          duration: this.formatTime(audio.duration.toFixed(0))
        });
      };
    }
  }

  formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m > 9 ? m : h ? "0" + m : m || "0", s > 9 ? s : "0" + s]
      .filter(a => a)
      .join(":");
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  next() {
    if (this.animating) return;
    const nextIndex =
      this.state.activeIndex === this.props.feed._contents.length - 1
        ? 0
        : this.state.activeIndex + 1;
    this.setState({ activeIndex: nextIndex });
  }

  previous() {
    if (this.animating) return;
    const nextIndex =
      this.state.activeIndex === 0
        ? this.props.feed._contents.length - 1
        : this.state.activeIndex - 1;
    this.setState({ activeIndex: nextIndex });
  }

  goToIndex(newIndex) {
    if (this.animating) return;
    this.setState({ activeIndex: newIndex });
  }

  _getAllComments = () => {
    const { feed } = this.props;
    return new Promise((resolve, reject) => {
      getComments(feed._id)
        .then(response => {
          if (response && response.hasOwnProperty("comments")) {
            this.setState({ comments: response["comments"] }, () => {
              resolve();
            });
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  };

  _toogleCommentSection = () => {
    const { isCommentScetionOpen } = this.state;
    if (!isCommentScetionOpen) {
      this._getAllComments();
    }
    this.setState({ isCommentScetionOpen: !isCommentScetionOpen });
  };

  _pinToProfile = isPinned => {
    this.props.pinToProfile(this.props.feed._id, !isPinned);
  };

  _postComment = (comment, id = null) => {
    // if (id === null) {
    //   postCommentOnFeed({
    //     category: "comment",
    //     content: comment,
    //     id: this.props.feed._id
    //   })
    //     .then(res => {
    //       this.postCommentRef.current._clearComment();
    //       this._getAllComments();
    //       this.props.getAllPosts();
    //       showToast("Commented successfully", "success");
    //     })
    //     .catch(err => {
    //       showToast(
    //         err.reason && err.reason.length
    //           ? err.reason
    //           : "Server error. Try again after sometime.",
    //         "error"
    //       );
    //     });
    // } else {
    //   // edit comment
    // }
  };

  _renderCarousel = () => {
    const slides = this.props.feed._contents.map(item => {
      item = item._content;
      return (
        <CarouselItem
          onExiting={this.onExiting}
          onExited={this.onExited}
          key={item._id}
        >
          {item.contentType === "video" ? (
            <video
              className="d-block w-100"
              src={item.url}
              controlsList="nodownload"
              controls
            />
          ) : (
              <img
                className="d-block w-100"
                src={item.url}
                alt={item.contentType}
              />
            )}
        </CarouselItem>
      );
    });
    return slides;
    // return (
    //     <>
    //     {
    //         items.map((item) => {
    //             return (
    //                 <CarouselItem onExiting={this.onExiting} onExited={this.onExited} key={item.src}>
    //                     <img className="d-block w-100" src={item.src} alt={item.altText} />
    //                 </CarouselItem>
    //             );
    //         })
    //     }
    //     </>
    // )
  };

  _onPromptSuccess = () => {
    this.props.deletePost();
    this.setState({ isPrompt: false });
  };

  _onPromptDismiss = () => {
    this.setState({ isPrompt: false });
  };

  _deletePost = () => {
    this.setState({ isPrompt: true });
  };

  _calculatePostPrice = feed => {
    if (feed._transactions && feed._transactions.length) {
      let arr = feed._transactions.filter(each => {
        return each.paymentType === "post" || each.paymentType === "tips";
      });
      let totalPrice = arr.reduce((acc, each) => {
        return (acc = acc + each.amount);
      }, 0);
      return totalPrice;
    }
    return 0;
  };

  _closePostEarningsModal = () => {
    this.setState({ isPostEarningsModalOpen: false });
  };

  _openPostEarningsModal = feed => {
    this.setState({ isPostEarningsModalOpen: true });
  };

  _fetchTipTransactionList = () => {
    const { feed } = deepClone(this.props);
    if (feed._transactions && feed._transactions.length) {
      let tips = feed._transactions.filter(each => {
        return each.paymentType === "tips";
      });
      return tips;
    }
    return [];
  };

  _fetchPPVTransactionList = () => {
    const { feed } = deepClone(this.props);
    if (feed._transactions && feed._transactions.length) {
      let arr = feed._transactions.filter(each => {
        return each.paymentType === "post";
      });
      return arr;
    }
    return [];
  };

  _dismissFlagModal = () => {
    this.setState({ flagModalVisible: false });
  };

  _showFlagModal = () => {
    this.setState({ flagModalVisible: true });
  };

  _onFlagConfirmation = () => {
    ToastsStore.success("Successfully flagged", 3000);
    this._dismissFlagModal();
  };

  _redirectToPostDetails = () => {
    this.props.history.push("/post/" + this.props.feed._id);
  };

  _renderPreview = () => {
    const {
      activeIndex,
      decodedUserDetails,
      isCommentScetionOpen,
      comments,
      isPrompt,
      flagModalVisible
    } = deepClone(this.state);
    const { user, feed } = deepClone(this.props);

    if (this.props.feed.category && this.props.feed.category === "general") {

      if (this.props.feed._contents && this.props.feed._contents.length > 1) {
        return (
          <>
            <ReportPostModal
              isVisible={flagModalVisible}
              feed={this.props.feed}
              onSuccess={this._onFlagConfirmation}
              onDismiss={this._dismissFlagModal}
            />
            <Card className="card-Feed">
              <Link to={`/post/${this.props.feed._id}`}>
                <CardHeader onClick={this._redirectToPostDetails}
                  style={{ cursor: "pointer" }}>
                  <div className="d-flex justify-content-start">
                    <div className="personImgWrap">
                      <img
                        src={
                          user && user.profilePicture
                            ? user.profilePicture
                            : config["defaultUserPicture"]
                        }
                        alt="Profile Img"
                        className="personImg"
                      />
                    </div>
                    <div>
                      <h4>{user ? user.name.full : ""}</h4>
                      {user ? (
                        <a className="profileID">@{user.username || "NA"}</a>
                      ) : null}
                    </div>
                  </div>
                  {/* post time */}
                  <div className="postTime-Feed">
                    {getPostedDateValue(this.props.feed.startDate)}
                  </div>
                </CardHeader>
              </Link>
              <CardBody>
                <CardText>
                  {this.props.feed.text && this.props.feed.text.length
                  ? ReactHtmlParser(this.props.feed.text)
                  : ""}
                </CardText>
                <div className="mediaPhotoWrap-Feed">
                  {/* carousel */}
                  <Carousel
                    activeIndex={activeIndex}
                    next={this.next}
                    previous={this.previous}
                    ride="carousel"
                  >
                    <CarouselIndicators
                      items={this.props.feed._contents}
                      activeIndex={activeIndex}
                      onClickHandler={this.goToIndex}
                    />
                    {this._renderCarousel()}
                    <CarouselControl
                      direction="prev"
                      directionText="Previous"
                      onClickHandler={this.previous}
                    />
                    <CarouselControl
                      direction="next"
                      directionText="Next"
                      onClickHandler={this.next}
                    />
                  </Carousel>
                </div>
                <div className="options-Feed">
                  <Button color="ghost-info" disabled>
                    <i className="icon-heart"></i>
                    <span>{this.props.feed.likes || 0}</span>
                  </Button>

                  <Button
                    color="ghost-info"
                    onClick={() => this._toogleCommentSection()}
                    aria-controls="exampleAccordion1"
                  >
                    <i className="icon-bubble"></i>
                    <span>{this.props.feed.comments || 0}</span>
                  </Button>

                  <Button
                    color="ghost-info"
                    onClick={() => this._openPostEarningsModal(this.props.feed)}
                  >
                    <i className="fa fa-dollar"></i>
                    <span style={{ verticalAlign: "-1px" }}>
                      {this._calculatePostPrice(this.props.feed) || 0}
                    </span>
                  </Button>
                  <Button color="ghost-secondary" onClick={this._showFlagModal}>
                    <i className="fa fa-flag-o" aria-hidden="true"></i>
                  </Button>
                </div>{" "}
                {/* options-Feed */}
              </CardBody>
            </Card>
            <PostCommentSection
              feed={this.props.feed}
              ref={this.postCommentRef}
              comments={comments}
              isOpen={isCommentScetionOpen}
              getComments={() => this._getAllComments()}
              user={this.props.user}
            />
          </>
        );
      } else if (
        this.props.feed._contents &&
        this.props.feed._contents.length === 1
      ) {
        if (this.props.feed._contents[0]._content.contentType === "image") {
          // contains only one image
          return (
            <>
              <ReportPostModal
                isVisible={flagModalVisible}
                feed={this.props.feed}
                onSuccess={this._onFlagConfirmation}
                onDismiss={this._dismissFlagModal}
              />
              <Card className="card-Feed">
                <Link to={`/post/${this.props.feed._id}`}>
                  <CardHeader onClick={this._redirectToPostDetails}
                    style={{ cursor: "pointer" }}>
                    <div className="d-flex justify-content-start">
                      <div className="personImgWrap">
                        <img
                          src={
                            user && user.profilePicture
                              ? user.profilePicture
                              : config["defaultUserPicture"]
                          }
                          alt="Profile Img"
                          className="personImg"
                        />
                      </div>
                      <div>
                        <h4>{user ? user.name.full : ""}</h4>
                        {user ? (
                          <a className="profileID">@{user.username || "NA"}</a>
                        ) : null}
                      </div>
                    </div>
                    {/* post time */}
                    <div className="postTime-Feed">
                      {getPostedDateValue(this.props.feed.startDate)}
                    </div>
                  </CardHeader>
                </Link>
                <CardBody>
                  <CardText>
                    {this.props.feed.text && this.props.feed.text.length
                    ? ReactHtmlParser(this.props.feed.text)
                    : ""}
                  </CardText>
                  <div className="mediaPhotoWrap-Feed">
                    <img
                      className="mediaPhoto-Feed"
                      src={this.props.feed._contents[0]._content.url}
                      alt="Feed Img"
                    />
                  </div>
                  <div className="options-Feed">
                    <Button color="ghost-info" disabled>
                      <i className="icon-heart"></i>
                      <span>{this.props.feed.likes || 0}</span>
                    </Button>

                    <Button
                      color="ghost-info"
                      onClick={() => this._toogleCommentSection()}
                    >
                      <i className="icon-bubble"></i>
                      <span>{this.props.feed.comments || 0}</span>
                    </Button>

                    <Button
                      color="ghost-info"
                      onClick={() =>
                        this._openPostEarningsModal(this.props.feed)
                      }
                    >
                      <i className="fa fa-dollar"></i>
                      <span style={{ verticalAlign: "-1px" }}>
                        {this._calculatePostPrice(this.props.feed) || 0}
                      </span>
                    </Button>
                    <Button
                      color="ghost-secondary"
                      onClick={this._showFlagModal}
                    >
                      <i className="fa fa-flag-o" aria-hidden="true"></i>
                    </Button>
                  </div>{" "}
                  {/* options-Feed */}
                </CardBody>
              </Card>
              <PostCommentSection
                feed={this.props.feed}
                ref={this.postCommentRef}
                comments={comments}
                isOpen={isCommentScetionOpen}
                postComment={text => this._postComment(text)}
                getComments={() => this._getAllComments()}
                user={this.props.user}
              />
            </>
          );
        } else if (this.props.feed._contents[0].contentType === "audio") {
          // contains only one audio file
          return (
            <>
              <ReportPostModal
                isVisible={flagModalVisible}
                feed={this.props.feed}
                onSuccess={this._onFlagConfirmation}
                onDismiss={this._dismissFlagModal}
              />
              <Card className="card-Feed">
                <Link to={`/post/${this.props.feed._id}`}>
                  <CardHeader onClick={this._redirectToPostDetails}
                    style={{ cursor: "pointer" }}>
                    <div className="d-flex justify-content-start">
                      <div className="personImgWrap">
                        <img
                          src={
                            user && user.profilePicture
                              ? user.profilePicture
                              : config["defaultUserPicture"]
                          }
                          alt="Profile Img"
                          className="personImg"
                        />
                      </div>
                      <div>
                        <h4>{user ? user.name.full : ""}</h4>
                        {user ? (
                          <a className="profileID">@{user.username || "NA"}</a>
                        ) : null}
                      </div>
                    </div>
                    {/* post time */}
                    <div className="postTime-Feed">
                      {getPostedDateValue(this.props.feed.startDate)}
                    </div>
                  </CardHeader>
                </Link>
                <CardBody>
                  <CardText>
                    {this.props.feed.text && this.props.feed.text.length
                    ? ReactHtmlParser(this.props.feed.text)
                    : ""}
                  </CardText>
                  <div className="my-2 px-2">
                    <audio
                      style={{ width: "100%" }}
                      ref={audio => {
                        this.audio = audio;
                      }}
                      controls
                      controlsList="nodownload"
                      src={this.props.feed._contents[0]._content.url || ""}
                    ></audio>
                  </div>
                  <div className="options-Feed">
                    <Button color="ghost-info" disabled>
                      <i className="icon-heart"></i>
                      <span>{this.props.feed.likes || 0}</span>
                    </Button>

                    <Button
                      color="ghost-info"
                      onClick={() => this._toogleCommentSection()}
                    >
                      <i className="icon-bubble"></i>
                      <span>{this.props.feed.comments || 0}</span>
                    </Button>

                    <Button
                      color="ghost-info"
                      onClick={() =>
                        this._openPostEarningsModal(this.props.feed)
                      }
                    >
                      <i className="fa fa-dollar"></i>
                      <span style={{ verticalAlign: "-1px" }}>
                        {this._calculatePostPrice(this.props.feed) || 0}
                      </span>
                    </Button>
                    <Button
                      color="ghost-secondary"
                      onClick={this._showFlagModal}
                    >
                      <i className="fa fa-flag-o" aria-hidden="true"></i>
                    </Button>
                  </div>{" "}
                  {/* options-Feed */}
                </CardBody>
              </Card>
              <PostCommentSection
                feed={this.props.feed}
                ref={this.postCommentRef}
                comments={comments}
                isOpen={isCommentScetionOpen}
                postComment={text => this._postComment(text)}
                getComments={() => this._getAllComments()}
                user={this.props.user}
              />
            </>
          );
        } else if (this.props.feed._contents[0].contentType === "video") {
          // contains only one video
          return (
            <>
              <ReportPostModal
                isVisible={flagModalVisible}
                feed={this.props.feed}
                onSuccess={this._onFlagConfirmation}
                onDismiss={this._dismissFlagModal}
              />
              <Card className="card-Feed">
                <Link to={`/post/${this.props.feed._id}`}>
                  <CardHeader onClick={this._redirectToPostDetails}
                    style={{ cursor: "pointer" }}>
                    <div className="d-flex justify-content-start">
                      <div className="personImgWrap">
                        <img
                          src={
                            user && user.profilePicture
                              ? user.profilePicture
                              : config["defaultUserPicture"]
                          }
                          alt="Profile Img"
                          className="personImg"
                        />
                      </div>
                      <div>
                        <h4>{user ? user.name.full : ""}</h4>
                        {user ? (
                          <a className="profileID">@{user.username || "NA"}</a>
                        ) : null}
                      </div>
                    </div>
                    {/* post time */}
                    <div className="postTime-Feed">
                      {getPostedDateValue(this.props.feed.startDate)}
                    </div>
                  </CardHeader>
                </Link>
                <CardBody>
                  <CardText>
                    {this.props.feed.text && this.props.feed.text.length
                    ? ReactHtmlParser(this.props.feed.text)
                    : ""}
                  </CardText>
                  <div className="embed-responsive embed-responsive-16by9 mediaVideoWrap-Feed">
                    {/* <iframe className="embed-responsive-item" src="https://www.youtube.com/embed/zpOULjyy-n8?rel=0" allowfullscreen></iframe> */}
                    <video
                      className="embed-responsive-item"
                      src={this.props.feed._contents[0]._content.url}
                      controls
                      controlsList="nodownload"
                    ></video>
                  </div>
                  <div className="options-Feed">
                    <Button color="ghost-info" disabled>
                      <i className="icon-heart"></i>
                      <span>{this.props.feed.likes || 0}</span>
                    </Button>

                    <Button
                      color="ghost-info"
                      onClick={() => this._toogleCommentSection()}
                    >
                      <i className="icon-bubble"></i>
                      <span>{this.props.feed.comments || 0}</span>
                    </Button>

                    <Button
                      color="ghost-info"
                      onClick={() =>
                        this._openPostEarningsModal(this.props.feed)
                      }
                    >
                      <i className="fa fa-dollar"></i>
                      <span style={{ verticalAlign: "-1px" }}>
                        {this._calculatePostPrice(this.props.feed) || 0}
                      </span>
                    </Button>
                    <Button
                      color="ghost-secondary"
                      onClick={this._showFlagModal}
                    >
                      <i className="fa fa-flag-o" aria-hidden="true"></i>
                    </Button>
                  </div>{" "}
                  {/* options-Feed */}
                </CardBody>
              </Card>
              <PostCommentSection
                ref={this.postCommentRef}
                comments={comments}
                isOpen={isCommentScetionOpen}
                postComment={text => this._postComment(text)}
                getComments={() => this._getAllComments()}
                feed={this.props.feed}
                user={this.props.user}
              />
            </>
          );
        }
      } else if (
        this.props.feed._contents &&
        this.props.feed._contents.length === 0
      ) {
        // text only post
        return (
          <>
            <ReportPostModal
              isVisible={flagModalVisible}
              feed={this.props.feed}
              onSuccess={this._onFlagConfirmation}
              onDismiss={this._dismissFlagModal}
            />
            <Card className="card-Feed">
              <Link to={`/post/${this.props.feed._id}`}>
                <CardHeader onClick={this._redirectToPostDetails}
                  style={{ cursor: "pointer" }}>
                  <div className="d-flex justify-content-start">
                    <div className="personImgWrap">
                      <img
                        src={
                          user && user.profilePicture
                            ? user.profilePicture
                            : config["defaultUserPicture"]
                        }
                        alt="Profile Img"
                        className="personImg"
                      />
                    </div>
                    <div>
                      <h4>{user ? user.name.full : ""}</h4>
                      {user ? (
                        <a className="profileID">@{user.username || "NA"}</a>
                      ) : null}
                    </div>
                  </div>
                  {/* post time */}
                  <div className="postTime-Feed">
                    {getPostedDateValue(this.props.feed.startDate)}
                  </div>
                </CardHeader>
              </Link>
              <CardBody>
                <CardText>
                  {this.props.feed.text && this.props.feed.text.length
                    ? ReactHtmlParser(this.props.feed.text)
                    : ""}
                </CardText>
                {/* <div className="embed-responsive embed-responsive-16by9 mediaVideoWrap-Feed">
                <iframe className="embed-responsive-item" src="https://www.youtube.com/embed/zpOULjyy-n8?rel=0" allowfullscreen></iframe>
            </div> */}
                <div className="options-Feed">
                  <Button color="ghost-info" disabled>
                    <i className="icon-heart"></i>
                    <span>{this.props.feed.likes || 0}</span>
                  </Button>

                  <Button
                    color="ghost-info"
                    onClick={() => this._toogleCommentSection()}
                  >
                    <i className="icon-bubble"></i>
                    <span>{this.props.feed.comments || 0}</span>
                  </Button>

                  <Button
                    color="ghost-info"
                    onClick={() => this._openPostEarningsModal(this.props.feed)}
                  >
                    <i className="fa fa-dollar"></i>
                    <span style={{ verticalAlign: "-1px" }}>
                      {this._calculatePostPrice(this.props.feed) || 0}
                    </span>
                  </Button>
                  <Button color="ghost-secondary" onClick={this._showFlagModal}>
                    <i className="fa fa-flag-o" aria-hidden="true"></i>
                  </Button>
                </div>{" "}
                {/* options-Feed */}
              </CardBody>
            </Card>
            <PostCommentSection
              feed={this.props.feed}
              ref={this.postCommentRef}
              comments={comments}
              isOpen={isCommentScetionOpen}
              postComment={text => this._postComment(text)}
              getComments={() => this._getAllComments()}
              user={this.props.user}
            />
          </>
        );
      }
    } else if (
      this.props.feed.category &&
      this.props.feed.category === "poll"
    ) {
      return (
        <>
          <ReportPostModal
            isVisible={flagModalVisible}
            feed={this.props.feed}
            onSuccess={this._onFlagConfirmation}
            onDismiss={this._dismissFlagModal}
          />
          <Card className="card-Feed">
            <Link to={`/post/${this.props.feed._id}`}>
              <CardHeader onClick={this._redirectToPostDetails}
                style={{ cursor: "pointer" }}>
                <div className="d-flex justify-content-start">
                  <div className="personImgWrap">
                    <img
                      src={
                        user && user.profilePicture
                          ? user.profilePicture
                          : "http://www.clipartpanda.com/clipart_images/user-66327738/download"
                      }
                      alt="Profile Img"
                      className="personImg"
                    />
                  </div>
                  <div>
                    <h4>{user ? user.name.full : ""}</h4>
                    {user ? (
                      <a className="profileID">@{user.username || "NA"}</a>
                    ) : null}
                  </div>
                </div>
                {/* post time */}
                <div className="postTime-Feed">
                  {getPostedDateValue(this.props.feed.startDate)}
                </div>
              </CardHeader>
            </Link>
            <CardBody>
              <CardText>
                {this.props.feed.description &&
                  this.props.feed.description.length
                  ? ReactHtmlParser(this.props.feed.description)
                  : null}
                {this.props.feed.description &&
                  this.props.feed.description.length ? (
                    <br />
                  ) : null}
                {this.props.feed.text && this.props.feed.text.length
                  ? ReactHtmlParser(this.props.feed.text)
                  : ""}
              </CardText>
              {/* poll options should always be wrapped inside the below div */}
              <div className="d-block mb-2 pollOptionWrap">
                {this.props.feed.options && this.props.feed.options.length
                  ? this.props.feed.options.map((option, optionIndex) => (
                    <PollOption
                      feed={this.props.feed}
                      option={option}
                      key={optionIndex}
                      index={optionIndex}
                    />
                  ))
                  : null}
              </div>
              <div className="options-Feed">
                <Button color="ghost-info" disabled>
                  <i className="icon-heart"></i>
                  <span>{this.props.feed.likes || 0}</span>
                </Button>

                <Button
                  color="ghost-info"
                  onClick={() => this._toogleCommentSection()}
                >
                  <i className="icon-bubble"></i>
                  <span>{this.props.feed.comments || 0}</span>
                </Button>
                <Button color="ghost-secondary" onClick={this._showFlagModal}>
                  <i className="fa fa-flag-o" aria-hidden="true"></i>
                </Button>
                {/* <Button color="ghost-secondary" onClick={() => this._openPostEarningsModal(this.props.feed)}>
                  <i className="fa fa-dollar"></i>
                  <span style={{ verticalAlign: "-1px" }}>
                    {this._calculatePostPrice(this.props.feed) || 0}
                  </span>
                </Button> */}
              </div>{" "}
              {/* options-Feed */}
            </CardBody>
          </Card>
          <PostCommentSection
            feed={this.props.feed}
            ref={this.postCommentRef}
            comments={comments}
            isOpen={isCommentScetionOpen}
            postComment={text => this._postComment(text)}
            getComments={() => this._getAllComments()}
            user={this.props.user}
          />
        </>
      );
    }

    return <div />;
  };

  render() {
    const { isPrompt, isPostEarningsModalOpen } = deepClone(this.state);
    return (
      <>
        {this._renderPreview()}{" "}
        <PostEarningsModal
          isVisible={isPostEarningsModalOpen}
          feed={this.props.feed}
          close={this._closePostEarningsModal}
          tipArr={this._fetchTipTransactionList()}
          ppvArr={this._fetchPPVTransactionList()}
        />
      </>
    );
  }
}

export default CreatorFeedViewer;
