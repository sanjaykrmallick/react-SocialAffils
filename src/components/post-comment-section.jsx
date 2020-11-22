import React, { Component } from "react";
import { Input, Collapse } from "reactstrap";
import Comment from "../components/comment";
// import { fetchAndDecodeToken } from "../helper-methods/index";

class PostCommentSection extends Component {
  state = {
    custom: [false],
    comment: "",
    userData: {}
  };

  componentDidMount() {
    // const userData = fetchAndDecodeToken();
    // this.setState({ userData });
  }

  _updateComment = value => {
    this.setState({ comment: value });
  };

  _clearComment = () => {
    this.setState({ comment: "" });
  };

//   _onEnterPressed = event => {
//     const code = event.keyCode || event.which;
//     if (code === 13) {
//       const { comment } = this.state;

//       //13 is the enter keycode
//       //Do stuff in here
//       event.preventDefault();
//       if (comment.length) {
//         this.props.postComment(comment);
//       }
//     }
//   };

  render() {
    const { comment } = this.state;
    const { user } = this.props;
    

    return (
      <>
        {/* comment section/accordion/collapse */}
        <Collapse
          isOpen={this.props.isOpen}
          data-parent="#exampleAccordion"
          id="exampleAccordion1"
          className="commentSection"
        >
         
          {/* comments list */}
          {this.props.comments && this.props.comments.length ? (
            this.props.comments.map((comment, index) => (
              <Comment
                key={index}
                comment={comment}
                isSubComment={false}
                getComments={() => this.props.getComments()}
                user = {user}
              />
            ))
          ) : (
            <span>No comments yet</span>
          )}
        </Collapse>
      </>
    );
  }
}

export default PostCommentSection;
