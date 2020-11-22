import React, { Component } from 'react';

class Loader extends Component {
    state = {  }
    render() { 
        const {loadingText} = this.props;
        return ( <>
        <div className="">
              <div className="loading-section list-loading">
                <i className="fa fa-spinner fa-spin"></i> &nbsp; {loadingText && loadingText.length ? loadingText : 'Loading..'}
              </div>
            </div>
        </> );
    }
}
 
export default Loader;