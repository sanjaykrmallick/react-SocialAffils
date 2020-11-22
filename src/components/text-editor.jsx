import React, { Component } from 'react';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
class TextEditor extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }
  modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" }
      ]
    ]
  };
  formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent"
  ];
  
  handleChange(value) {
    this.props.onChange(value);
    // console.log(value, this.props);
  }
  render() { 
    return ( <div>
       <ReactQuill
        value={this.props.content || ''}
        name='renterRefundPolicy'
        onChange={this.handleChange}
        className="editor"
        modules={this.modules}
        formats={this.formats}
        placeholder='Enter your message here..'
      />
    </div> );
  }
}
 
export default TextEditor;