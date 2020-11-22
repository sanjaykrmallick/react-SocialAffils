import JavascriptTimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import React, { Component } from "react";
import ReactTimeAgo from "react-time-ago";
import { deepClone } from "../helper-methods";

class Comment extends Component {
  state = {
    isDropDownOpen: false,
    isReplySectionShown: false,
    comment: "",
    existingComment: "",
    isTyped: false,
    isEditFieldOpened: false,
    isPrompt: false,
    reply: "",
    userDetails: null
  };

  constructor(props) {
    super(props);
    JavascriptTimeAgo.locale(en);
  }

  static getDerivedStateFromProps(props, state) {
    if (!state.isTyped) {
      return {
        comment:
          props.comment && props.comment.content ? props.comment.content : ""
      };
    }
    return null;
  }

  // for dropdown
  _toggleDropdown = () => {
    let { isDropDownOpen } = deepClone(this.state);
    isDropDownOpen = !isDropDownOpen;
    this.setState({ isDropDownOpen });
  };

  _toggleReplySection = () => {
    if (this.props.isSubComment) {
      this.props.toggleReplySection();
    } else {
      let { isReplySectionShown } = deepClone(this.state);
      isReplySectionShown = !isReplySectionShown;
      this.setState({ isReplySectionShown });
    }
  };

  _updateComment = value => {
    let { comment, isTyped } = deepClone(this.state);
    comment = value;
    isTyped = true;
    this.setState({ comment, isTyped });
  };

  _replyComment = value => {
    let { reply, isTyped } = deepClone(this.state);
    reply = value;
    isTyped = true;
    this.setState({ reply, isTyped });
  };

  _toggleCommentField = () => {
    let { isEditFieldOpened } = this.state;
    isEditFieldOpened = !isEditFieldOpened;
    this.setState({ isEditFieldOpened });
  };

  _convertIntoDate = startDate => {
    return new Date(startDate);
  };

  _editExistingComment = value => {
    let { isTyped, existingComment } = deepClone(this.state);
    isTyped = true;
    existingComment = value;
    this.setState({ existingComment, isTyped });
  };

  render() {
    const {
      isDropDownOpen,
      isReplySectionShown,
      isEditFieldOpened,
      comment,
      isPrompt,
      reply,
      userData
    } = deepClone(this.state);
    const { user } = this.props;
    return (
      <>
        <div className="d-flex justify-content-start align-items-start">
          <img
            src={
              this.props.comment._user &&
              this.props.comment._user.profilePicture &&
              this.props.comment._user.profilePicture.length
                ? this.props.comment._user.profilePicture
                : "http://www.clipartpanda.com/clipart_images/user-66327738/download"
            }
            alt="Profile Img"
            className="personImg-Comment"
          />

          <div className="d-flex flex-column">
            <div className="comments-Post">
              <p>{comment || ""}</p>
            </div>
            <div className="d-flex justify-content-start align-items-center mb-2">
              {/* <Button
                className="replyBtn"
                onClick={() => this._toggleReplySection()}
              >
                Reply
              </Button> */}
              {this.props.comment && this.props.comment.createdAt ? (
                <div className="commentTime ml-0">
                  <ReactTimeAgo
                    date={this._convertIntoDate(this.props.comment.createdAt)}
                  />
                </div>
              ) : null}
            </div>
            {/* Comment Thread */}
            {this.props.comment.hasOwnProperty("_subComments") &&
            this.props.comment._subComments.length
              ? this.props.comment._subComments.map((subComment, subIndex) => (
                  <React.Fragment key={subIndex}>
                    <Comment
                      key={subIndex}
                      comment={subComment}
                      isSubComment={true}
                      parentComment={this.props.comment}
                      toggleReplySection={() => this._toggleReplySection()}
                      getComments={() => this.props.getComments()}
                      fetchPosts={() => this.props.fetchPosts()}
                      userData={this.props.userData}
                      user={user}
                    />
                    {/* Comment Thread */}
                  </React.Fragment>
                ))
              : null}

            {/* comment area inside thread */}
            {isReplySectionShown ? (
              <div className="d-flex justify-content-start align-items-center mb-3">
                <img
                  src={
                    comment._user &&
                    comment._user.profilePicture &&
                    comment._user.profilePicture.length
                      ? comment._user.profilePicture
                      : "http://www.clipartpanda.com/clipart_images/user-66327738/download"
                  }
                  alt="Profile Img"
                  className="personImg-Comment"
                />
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  }
}

export default Comment;
