import JavascriptTimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import React, { Component } from "react";
import ReactTimeAgo from "react-time-ago";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardText,
  Carousel,
  CarouselControl,
  CarouselIndicators,
  CarouselItem,
  Label
} from "reactstrap";
import { Link } from "react-router-dom";
import PollOption from "../components/poll-option-component";
import PostCommentSection from "../components/post-comment-section";
import PostEarningsModal from "../components/post-earnings-modal";
import config from "../config";
import { deepClone, getPostedDateValue } from "../helper-methods";
import { getComments } from "../http/http-calls";

class SubscriberFeedViewer extends Component {
  state = {
    comments: [],
    dropdownOpen: false,
    activeIndex: 0,
    duration: 0,
    decodedUserDetails: null,
    custom: [false],
    isCommentScetionOpen: false,
    isPrompt: false,
    isPostEarningsModalOpen: false
  };

  now = 60;

  constructor(props) {
    super(props);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goToIndex = this.goToIndex.bind(this);
    this.audio = React.createRef();
    this.postCommentRef = React.createRef();
    JavascriptTimeAgo.locale(en);
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

  _convertIntoDate = startDate => {
    return new Date(startDate);
  };

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  next() {
    const { feed } = deepClone(this.props);
    if (this.animating) return;
    const nextIndex =
      this.state.activeIndex === feed["_post"]._contents.length - 1
        ? 0
        : this.state.activeIndex + 1;
    this.setState({ activeIndex: nextIndex });
  }

  previous() {
    const { feed } = deepClone(this.props);

    if (this.animating) return;
    const nextIndex =
      this.state.activeIndex === 0
        ? feed["_post"]._contents.length - 1
        : this.state.activeIndex - 1;
    this.setState({ activeIndex: nextIndex });
  }

  goToIndex(newIndex) {
    if (this.animating) return;
    this.setState({ activeIndex: newIndex });
  }

  _getAllComments = id => {
    const { feed } = deepClone(this.props);
    return new Promise((resolve, reject) => {
      getComments(id)
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

  _toogleCommentSection = post => {
    const { isCommentScetionOpen } = this.state;
    if (!isCommentScetionOpen) {
      this._getAllComments(post["id"]);
    }
    this.setState({ isCommentScetionOpen: !isCommentScetionOpen });
  };

  _pinToProfile = isPinned => {
    const { feed } = deepClone(this.props);

    this.props.pinToProfile(feed["_post"]._id, !isPinned);
  };

  _postComment = (comment, id = null) => {
    // if (id === null) {
    //   postCommentOnFeed({
    //     category: "comment",
    //     content: comment,
    //     id: feed['_post']._id
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

  _getInteractionHeaderContent = feed => {
    if (feed["activityType"] === "like") {
      return feed._user.name.full + " liked this post";
    } else if (feed["activityType"] === "comment") {
      return feed._user.name.full + " commented on this post";
    } else if (
      feed["activityType"] === "ppv" ||
      feed["activityType"] === "tips"
    ) {
      return (
        feed._user.name.full +
        " " +
        (feed["activityType"] === "ppv" ? "paid" : "tipped") +
        " $" +
        (feed &&
          feed.hasOwnProperty("_transaction") &&
          feed._transaction.hasOwnProperty("amount")
          ? feed._transaction.amount
          : 0) +
        " for this post"
      );
    }
    // else if (feed["activityType"] === "tips") {
    //   return (
    //     feed._user.name.full +
    //     " tipped $" +
    //     (feed &&
    //     feed.hasOwnProperty("_transaction") &&
    //     feed._transaction.hasOwnProperty("amount")
    //       ? feed._transaction.amount
    //       : 0) +
    //     " for this post"
    //   );
    // }
    return null;
  };

  _renderCarousel = () => {
    const { feed } = deepClone(this.props);

    const slides = feed["_post"]._contents.map(item => {
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
    if (
      feed.hasOwnProperty("_post") &&
      feed._post.hasOwnProperty("_transactions") &&
      feed._post._transactions.length
    ) {
      let tips = feed._post._transactions.filter(each => {
        return each.paymentType === "tips";
      });
      return tips;
    }
    return [];
  };

  _fetchPPVTransactionList = () => {
    const { feed } = deepClone(this.props);

    if (
      feed.hasOwnProperty("_post") &&
      feed._post.hasOwnProperty("_transactions") &&
      feed._post._transactions.length
    ) {
      let arr = feed._post._transactions.filter(each => {
        return each.paymentType === "post";
      });
      return arr;
    }
    return [];
  };

  _redirectToPostDetails = () => {
    this.props.history.push("/post/" + this.props.feed._post._id);
  };

  _renderPreview = () => {
    const {
      activeIndex,
      decodedUserDetails,
      isCommentScetionOpen,
      comments,
      isPrompt
    } = deepClone(this.state);
    const { user, feed } = deepClone(this.props);
    const influencer =
      feed && feed.hasOwnProperty("_influencer") ? feed._influencer : null;
    const shownComment =
      feed &&
        feed.hasOwnProperty("_interaction") &&
        feed._interaction &&
        feed._interaction.hasOwnProperty("category") &&
        feed._interaction.category === "comment"
        ? feed._interaction
        : null;

    if (!feed.hasOwnProperty("_post")) {
      return <div />;
    } else {
      if (feed["_post"].category && feed["_post"].category === "general") {
        if (feed["_post"]._contents && feed["_post"]._contents.length > 1) {
          return (
            <>
              <Label>{this._getInteractionHeaderContent(feed)}</Label>
              <Card className="card-Feed mt-0" style={{ margin: "0 0 15 0" }}>
                <Link to={`/post/${this.props.feed._post._id}`}>
                  <CardHeader
                    onClick={this._redirectToPostDetails}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex justify-content-start">
                      <div className="personImgWrap">
                        <img
                          src={
                            influencer && influencer.profilePicture
                              ? influencer.profilePicture
                              : config["defaultUserPicture"]
                          }
                          alt="Profile Img"
                          className="personImg"
                        />
                      </div>
                      <div>
                        <h4>{influencer ? influencer.name.full : ""}</h4>
                        {influencer ? (
                          <a className="profileID">
                            @{influencer.username || "NA"}
                          </a>
                        ) : (
                            "NA"
                          )}
                      </div>
                    </div>
                    {/* post time */}
                    <div className="postTime-Feed">
                      {getPostedDateValue(feed["_post"].startDate)}
                    </div>
                  </CardHeader>
                </Link>
                <CardBody>
                  <CardText>{feed["_post"] && feed["_post"].text}</CardText>
                  <div className="mediaPhotoWrap-Feed">
                    {/* carousel */}
                    <Carousel
                      activeIndex={activeIndex}
                      next={this.next}
                      previous={this.previous}
                      ride="carousel"
                    >
                      <CarouselIndicators
                        items={feed["_post"]._contents}
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
                      <span>{feed["_post"].likes || 0}</span>
                    </Button>

                    <Button
                      color="ghost-info"
                      onClick={() => this._toogleCommentSection(feed["_post"])}
                      aria-controls="exampleAccordion1"
                    >
                      <i className="icon-bubble"></i>
                      <span>{feed["_post"].comments || 0}</span>
                    </Button>

                    <Button
                      color="ghost-info"
                      onClick={() => this._openPostEarningsModal(feed["_post"])}
                    >
                      <i className="fa fa-dollar"></i>
                      <span style={{ verticalAlign: "-1px" }}>
                        {this._calculatePostPrice(feed["_post"]) || 0}
                      </span>
                    </Button>
                  </div>{" "}
                  {/* options-Feed */}
                </CardBody>
              </Card>
              {shownComment && !isCommentScetionOpen ? (
                <div
                  className="commentSection"
                  onClick={() => this._toogleCommentSection(feed["_post"])}
                >
                  <div className="d-flex justify-content-start align-items-start">
                    <img
                      src={
                        user && user.profilePicture
                          ? user.profilePicture
                          : config["defaultUserPicture"]
                      }
                      alt="Profile Img"
                      className="personImg-Comment"
                    />

                    <div className="d-flex flex-column">
                      <div className="comments-Post">
                        <p>{shownComment["content"] || ""}</p>
                      </div>
                      <div className="d-flex justify-content-start align-items-center mb-2">
                        {shownComment && shownComment.createdAt ? (
                          <div className="commentTime ml-0">
                            <ReactTimeAgo
                              date={this._convertIntoDate(
                                shownComment.createdAt
                              )}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              <PostCommentSection
                feed={feed["_post"]}
                ref={this.postCommentRef}
                comments={comments}
                isOpen={isCommentScetionOpen}
                getComments={() => this._getAllComments()}
                user={this.props.user}
              />
            </>
          );
        } else if (
          feed["_post"]._contents &&
          feed["_post"]._contents.length === 1
        ) {
          if (feed["_post"]._contents[0]._content.contentType === "image") {
            // contains only one image
            return (
              <>
                <Label>{this._getInteractionHeaderContent(feed)}</Label>
                <Card className="card-Feed mt-0" style={{ margin: "0 0 15 0" }}>
                  <Link to={`/post/${this.props.feed._post._id}`}>
                    <CardHeader
                      onClick={this._redirectToPostDetails}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex justify-content-start">
                        <div className="personImgWrap">
                          <img
                            src={
                              influencer && influencer.profilePicture
                                ? influencer.profilePicture
                                : config["defaultUserPicture"]
                            }
                            alt="Profile Img"
                            className="personImg"
                          />
                        </div>
                        <div>
                          <h4>{influencer ? influencer.name.full : ""}</h4>
                          {influencer &&
                            influencer.username &&
                            influencer.username.length ? (
                              <a className="profileID">
                                @{influencer.username || "NA"}
                              </a>
                            ) : (
                              "NA"
                            )}
                        </div>
                      </div>
                      {/* post time */}
                      <div className="postTime-Feed">
                        {getPostedDateValue(feed["_post"].startDate)}
                      </div>
                    </CardHeader>
                  </Link>
                  <CardBody>
                    <CardText>
                      {feed["_post"].text && feed["_post"].text.length
                        ? feed["_post"].text
                        : ""}
                    </CardText>
                    <div className="mediaPhotoWrap-Feed">
                      <img
                        className="mediaPhoto-Feed"
                        src={feed["_post"]._contents[0]._content.url}
                        alt="Feed Img"
                      />
                    </div>
                    <div className="options-Feed">
                      <Button color="ghost-info" disabled>
                        <i className="icon-heart"></i>
                        <span>{feed["_post"].likes || 0}</span>
                      </Button>

                      <Button
                        color="ghost-info"
                        onClick={() =>
                          this._toogleCommentSection(feed["_post"])
                        }
                      >
                        <i className="icon-bubble"></i>
                        <span>{feed["_post"].comments || 0}</span>
                      </Button>

                      <Button
                        color="ghost-info"
                        onClick={() =>
                          this._openPostEarningsModal(feed["_post"])
                        }
                      >
                        <i className="fa fa-dollar"></i>
                        <span style={{ verticalAlign: "-1px" }}>
                          {this._calculatePostPrice(feed["_post"]) || 0}
                        </span>
                      </Button>
                    </div>{" "}
                    {/* options-Feed */}
                  </CardBody>
                </Card>
                {shownComment && !isCommentScetionOpen ? (
                  <div
                    className="commentSection"
                    onClick={() => this._toogleCommentSection(feed["_post"])}
                  >
                    <div className="d-flex justify-content-start align-items-start">
                      <img
                        src={
                          user && user.profilePicture
                            ? user.profilePicture
                            : config["defaultUserPicture"]
                        }
                        alt="Profile Img"
                        className="personImg-Comment"
                      />

                      <div className="d-flex flex-column">
                        <div className="comments-Post">
                          <p>{shownComment["content"] || ""}</p>
                        </div>
                        <div className="d-flex justify-content-start align-items-center mb-2">
                          {shownComment && shownComment.createdAt ? (
                            <div className="commentTime ml-0">
                              <ReactTimeAgo
                                date={this._convertIntoDate(
                                  shownComment.createdAt
                                )}
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                <PostCommentSection
                  feed={feed["_post"]}
                  ref={this.postCommentRef}
                  comments={comments}
                  isOpen={isCommentScetionOpen}
                  postComment={text => this._postComment(text)}
                  getComments={() => this._getAllComments()}
                  user={this.props.user}
                />
              </>
            );
          } else if (feed["_post"]._contents[0].contentType === "audio") {
            // contains only one audio file
            return (
              <>
                <Label>{this._getInteractionHeaderContent(feed)}</Label>
                <Card className="card-Feed mt-0" style={{ margin: "0 0 15 0" }}>
                  <Link to={`/post/${this.props.feed._post._id}`}>
                    <CardHeader
                      onClick={this._redirectToPostDetails}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex justify-content-start">
                        <div className="personImgWrap">
                          <img
                            src={
                              influencer && influencer.profilePicture
                                ? influencer.profilePicture
                                : config["defaultUserPicture"]
                            }
                            alt="Profile Img"
                            className="personImg"
                          />
                        </div>
                        <div>
                          <h4>{influencer ? influencer.name.full : ""}</h4>
                          {influencer &&
                            influencer.username &&
                            influencer.username.length ? (
                              <a className="profileID">
                                @{influencer.username || "NA"}
                              </a>
                            ) : (
                              "NA"
                            )}
                        </div>
                      </div>
                      {/* post time */}
                      <div className="postTime-Feed">
                        {getPostedDateValue(feed["_post"].startDate)}
                      </div>
                    </CardHeader>
                  </Link>
                  <CardBody>
                    <CardText>
                      {feed["_post"].text && feed["_post"].text.length
                        ? feed["_post"].text
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
                        src={feed["_post"]._contents[0]._content.url || ""}
                      ></audio>
                    </div>
                    <div className="options-Feed">
                      <Button color="ghost-info" disabled>
                        <i className="icon-heart"></i>
                        <span>{feed["_post"].likes || 0}</span>
                      </Button>

                      <Button
                        color="ghost-info"
                        onClick={() =>
                          this._toogleCommentSection(feed["_post"])
                        }
                      >
                        <i className="icon-bubble"></i>
                        <span>{feed["_post"].comments || 0}</span>
                      </Button>

                      <Button
                        color="ghost-info"
                        onClick={() =>
                          this._openPostEarningsModal(feed["_post"])
                        }
                      >
                        <i className="fa fa-dollar"></i>
                        <span style={{ verticalAlign: "-1px" }}>
                          {this._calculatePostPrice(feed["_post"]) || 0}
                        </span>
                      </Button>
                    </div>{" "}
                    {/* options-Feed */}
                  </CardBody>
                </Card>
                {shownComment && !isCommentScetionOpen ? (
                  <div
                    className="commentSection"
                    onClick={() => this._toogleCommentSection(feed["_post"])}
                  >
                    <div className="d-flex justify-content-start align-items-start">
                      <img
                        src={
                          user && user.profilePicture
                            ? user.profilePicture
                            : config["defaultUserPicture"]
                        }
                        alt="Profile Img"
                        className="personImg-Comment"
                      />

                      <div className="d-flex flex-column">
                        <div className="comments-Post">
                          <p>{shownComment["content"] || ""}</p>
                        </div>
                        <div className="d-flex justify-content-start align-items-center mb-2">
                          {shownComment && shownComment.createdAt ? (
                            <div className="commentTime ml-0">
                              <ReactTimeAgo
                                date={this._convertIntoDate(
                                  shownComment.createdAt
                                )}
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                <PostCommentSection
                  feed={feed["_post"]}
                  ref={this.postCommentRef}
                  comments={comments}
                  isOpen={isCommentScetionOpen}
                  postComment={text => this._postComment(text)}
                  getComments={() => this._getAllComments()}
                  user={this.props.user}
                />
              </>
            );
          } else if (feed["_post"]._contents[0].contentType === "video") {
            // contains only one video
            return (
              <>
                <Label>{this._getInteractionHeaderContent(feed)}</Label>
                <Card className="card-Feed mt-0" style={{ margin: "0 0 15 0" }}>
                  <Link to={`/post/${this.props.feed._post._id}`}>
                    <CardHeader
                      onClick={this._redirectToPostDetails}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex justify-content-start">
                        <div className="personImgWrap">
                          <img
                            src={
                              influencer && influencer.profilePicture
                                ? influencer.profilePicture
                                : config["defaultUserPicture"]
                            }
                            alt="Profile Img"
                            className="personImg"
                          />
                        </div>
                        <div>
                          <h4>{influencer ? influencer.name.full : ""}</h4>
                          {influencer &&
                            influencer.username &&
                            influencer.username.length ? (
                              <a className="profileID">
                                @{influencer.username || "NA"}
                              </a>
                            ) : (
                              "NA"
                            )}
                        </div>
                      </div>
                      {/* post time */}
                      <div className="postTime-Feed">
                        {getPostedDateValue(feed["_post"].startDate)}
                      </div>
                    </CardHeader>
                  </Link>
                  <CardBody>
                    <CardText>
                      {feed["_post"].text && feed["_post"].text.length
                        ? feed["_post"].text
                        : ""}
                    </CardText>
                    <div className="embed-responsive embed-responsive-16by9 mediaVideoWrap-Feed">
                      {/* <iframe className="embed-responsive-item" src="https://www.youtube.com/embed/zpOULjyy-n8?rel=0" allowfullscreen></iframe> */}
                      <video
                        className="embed-responsive-item"
                        src={feed["_post"]._contents[0]._content.url}
                        controls
                        controlsList="nodownload"
                      ></video>
                    </div>
                    <div className="options-Feed">
                      <Button color="ghost-info" disabled>
                        <i className="icon-heart"></i>
                        <span>{feed["_post"].likes || 0}</span>
                      </Button>

                      <Button
                        color="ghost-info"
                        onClick={() =>
                          this._toogleCommentSection(feed["_post"])
                        }
                      >
                        <i className="icon-bubble"></i>
                        <span>{feed["_post"].comments || 0}</span>
                      </Button>

                      <Button
                        color="ghost-info"
                        onClick={() =>
                          this._openPostEarningsModal(feed["_post"])
                        }
                      >
                        <i className="fa fa-dollar"></i>
                        <span style={{ verticalAlign: "-1px" }}>
                          {this._calculatePostPrice(feed["_post"]) || 0}
                        </span>
                      </Button>
                    </div>{" "}
                    {/* options-Feed */}
                  </CardBody>
                </Card>
                {shownComment && !isCommentScetionOpen ? (
                  <div
                    className="commentSection"
                    onClick={() => this._toogleCommentSection(feed["_post"])}
                  >
                    <div className="d-flex justify-content-start align-items-start">
                      <img
                        src={
                          user && user.profilePicture
                            ? user.profilePicture
                            : config["defaultUserPicture"]
                        }
                        alt="Profile Img"
                        className="personImg-Comment"
                      />

                      <div className="d-flex flex-column">
                        <div className="comments-Post">
                          <p>{shownComment["content"] || ""}</p>
                        </div>
                        <div className="d-flex justify-content-start align-items-center mb-2">
                          {shownComment && shownComment.createdAt ? (
                            <div className="commentTime ml-0">
                              <ReactTimeAgo
                                date={this._convertIntoDate(
                                  shownComment.createdAt
                                )}
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                <PostCommentSection
                  ref={this.postCommentRef}
                  comments={comments}
                  isOpen={isCommentScetionOpen}
                  postComment={text => this._postComment(text)}
                  getComments={() => this._getAllComments()}
                  feed={feed["_post"]}
                  user={this.props.user}
                />
              </>
            );
          }
        } else if (
          feed["_post"]._contents &&
          feed["_post"]._contents.length === 0
        ) {
          // text only post
          return (
            <>
              <Label>{this._getInteractionHeaderContent(feed)}</Label>
              <Card className="card-Feed mt-0" style={{ margin: "0 0 15 0" }}>
                <Link to={`/post/${this.props.feed._post._id}`}>
                  <CardHeader
                    onClick={this._redirectToPostDetails}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex justify-content-start">
                      <div className="personImgWrap">
                        <img
                          src={
                            influencer && influencer.profilePicture
                              ? influencer.profilePicture
                              : config["defaultUserPicture"]
                          }
                          alt="Profile Img"
                          className="personImg"
                        />
                      </div>
                      <div>
                        <h4>{influencer ? influencer.name.full : ""}</h4>
                        {influencer &&
                          influencer.username &&
                          influencer.username.length ? (
                            <a className="profileID">
                              @{influencer.username || "NA"}
                            </a>
                          ) : (
                            "NA"
                          )}
                      </div>
                    </div>
                    {/* post time */}
                    <div className="postTime-Feed">
                      {getPostedDateValue(feed["_post"].startDate)}
                    </div>
                  </CardHeader>
                </Link>
                <CardBody>
                  <CardText>
                    {feed["_post"].text && feed["_post"].text.length
                      ? feed["_post"].text
                      : ""}
                  </CardText>
                  {/* <div className="embed-responsive embed-responsive-16by9 mediaVideoWrap-Feed">
                  <iframe className="embed-responsive-item" src="https://www.youtube.com/embed/zpOULjyy-n8?rel=0" allowfullscreen></iframe>
              </div> */}
                  <div className="options-Feed">
                    <Button color="ghost-info" disabled>
                      <i className="icon-heart"></i>
                      <span>{feed["_post"].likes || 0}</span>
                    </Button>

                    <Button
                      color="ghost-info"
                      onClick={() => this._toogleCommentSection(feed["_post"])}
                    >
                      <i className="icon-bubble"></i>
                      <span>{feed["_post"].comments || 0}</span>
                    </Button>

                    <Button
                      color="ghost-info"
                      onClick={() => this._openPostEarningsModal(feed["_post"])}
                    >
                      <i className="fa fa-dollar"></i>
                      <span style={{ verticalAlign: "-1px" }}>
                        {this._calculatePostPrice(feed["_post"]) || 0}
                      </span>
                    </Button>
                  </div>{" "}
                  {/* options-Feed */}
                </CardBody>
              </Card>
              {shownComment && !isCommentScetionOpen ? (
                <div
                  className="commentSection"
                  onClick={() => this._toogleCommentSection(feed["_post"])}
                >
                  <div className="d-flex justify-content-start align-items-start">
                    <img
                      src={
                        user && user.profilePicture
                          ? user.profilePicture
                          : config["defaultUserPicture"]
                      }
                      alt="Profile Img"
                      className="personImg-Comment"
                    />

                    <div className="d-flex flex-column">
                      <div className="comments-Post">
                        <p>{shownComment["content"] || ""}</p>
                      </div>
                      <div className="d-flex justify-content-start align-items-center mb-2">
                        {shownComment && shownComment.createdAt ? (
                          <div className="commentTime ml-0">
                            <ReactTimeAgo
                              date={this._convertIntoDate(
                                shownComment.createdAt
                              )}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              <PostCommentSection
                feed={feed["_post"]}
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
      } else if (feed["_post"].category && feed["_post"].category === "poll") {
        return (
          <>
            <Label>{this._getInteractionHeaderContent(feed)}</Label>
            <Card className="card-Feed mt-0" style={{ margin: "0 0 15 0" }}>
              <Link to={`/post/${this.props.feed._post._id}`}>
                <CardHeader
                  onClick={this._redirectToPostDetails}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex justify-content-start">
                    <div className="personImgWrap">
                      <img
                        src={
                          influencer && influencer.profilePicture
                            ? influencer.profilePicture
                            : config["defaultUserPicture"]
                        }
                        alt="Profile Img"
                        className="personImg"
                      />
                    </div>
                    <div>
                      <h4>{influencer ? influencer.name.full : ""}</h4>
                      {influencer &&
                        influencer.username &&
                        influencer.username.length ? (
                          <a className="profileID">
                            @{influencer.username || "NA"}
                          </a>
                        ) : (
                          "NA"
                        )}
                    </div>
                  </div>
                  {/* post time */}
                  <div className="postTime-Feed">
                    {getPostedDateValue(feed["_post"].startDate)}
                  </div>
                </CardHeader>
              </Link>
              <CardBody>
                <CardText>
                  {feed["_post"].description && feed["_post"].description.length
                    ? feed["_post"].description
                    : null}
                  {feed["_post"].description &&
                    feed["_post"].description.length ? (
                      <br />
                    ) : null}
                  {feed["_post"].text && feed["_post"].text.length
                    ? feed["_post"].text
                    : ""}
                </CardText>
                {/* poll options should always be wrapped inside the below div */}
                <div className="d-block mb-2 pollOptionWrap">
                  {feed["_post"].options && feed["_post"].options.length
                    ? feed["_post"].options.map((option, optionIndex) => (
                      <PollOption
                        feed={feed["_post"]}
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
                    <span>{feed["_post"].likes || 0}</span>
                  </Button>

                  <Button
                    color="ghost-info"
                    onClick={() => this._toogleCommentSection(feed["_post"])}
                  >
                    <i className="icon-bubble"></i>
                    <span>{feed["_post"].comments || 0}</span>
                  </Button>

                  {/* <Button color="ghost-secondary" onClick={() => this._openPostEarningsModal(feed['_post'])}>
                    <i className="fa fa-dollar"></i>
                    <span style={{ verticalAlign: "-1px" }}>
                      {this._calculatePostPrice(feed['_post']) || 0}
                    </span>
                  </Button> */}
                </div>{" "}
                {/* options-Feed */}
              </CardBody>
            </Card>
            {shownComment && !isCommentScetionOpen ? (
              <div
                className="commentSection"
                onClick={() => this._toogleCommentSection(feed["_post"])}
              >
                <div className="d-flex justify-content-start align-items-start">
                  <img
                    src={
                      user && user.profilePicture
                        ? user.profilePicture
                        : config["defaultUserPicture"]
                    }
                    alt="Profile Img"
                    className="personImg-Comment"
                  />

                  <div className="d-flex flex-column">
                    <div className="comments-Post">
                      <p>{shownComment["content"] || ""}</p>
                    </div>
                    <div className="d-flex justify-content-start align-items-center mb-2">
                      {shownComment && shownComment.createdAt ? (
                        <div className="commentTime ml-0">
                          <ReactTimeAgo
                            date={this._convertIntoDate(shownComment.createdAt)}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <PostCommentSection
              feed={feed["_post"]}
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
    }
  };

  render() {
    const { isPrompt, isPostEarningsModalOpen } = deepClone(this.state);
    const { feed } = deepClone(this.props);

    return (
      <>
        {this._renderPreview()}{" "}
        <PostEarningsModal
          isVisible={isPostEarningsModalOpen}
          feed={feed["_post"]}
          close={this._closePostEarningsModal}
          tipArr={this._fetchTipTransactionList()}
          ppvArr={this._fetchPPVTransactionList()}
          isSubscriber={true}
          user={this.props.user}
        />
      </>
    );
  }
}

export default SubscriberFeedViewer;
