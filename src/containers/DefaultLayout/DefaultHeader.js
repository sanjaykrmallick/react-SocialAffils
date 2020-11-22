import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Nav, NavItem } from "reactstrap";
import PropTypes from "prop-types";

import {
  // AppAsideToggler,
  AppNavbarBrand,
  AppSidebarToggler,
} from "@coreui/react";
import logo from "../../assets/socialaffil.png";
import sygnet from "../../assets/img/brand/sygnet.svg";
import config from "../../config/index";
import jwt_decode from "jwt-decode";

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
  state = {
    currentUser: jwt_decode(localStorage.socialAffilAdminToken),
  };

  componentDidMount() {
    console.log("this.state :", this.state);
  }

  logout = () => {
    localStorage.removeItem("socialAffilAdminToken");
    
    this.props.history.push("/login");
  };
  render() {
    // eslint-disable-next-line
    const { children, ...attributes } = this.props;
    const { currentUser } = this.state;

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-xl-none" display="lg" mobile />
        <AppNavbarBrand
          full={{ src: logo, width: 50, height: 50, alt: "Social Affill" }}
          minimized={{
            src: sygnet,
            width: 30,
            height: 30,
            alt: "SocialSocial Logo",
          }}
        />
        <AppSidebarToggler className="d-xl-down-none" display="lg" />

        <Nav className="d-lg-down-none pl-2 pl-md-3 pl-lg-0" navbar>
          {config.leftMenu.items.map((menu) =>
            (!currentUser.hasOwnProperty("isSuperAdmin") ||
              !currentUser.isSuperAdmin) &&
            menu.name === "Admin Accounts"
              ? null
              : menu.isHeaderMenu && (
                  <NavItem className="px-1 px-lg-2" key={menu.url}>
                    <NavLink to={menu.url} className="nav-link">
                      {menu.name}
                    </NavLink>
                  </NavItem>
                )
          )}
        </Nav>

        {/* logout option */}
        <Nav className="ml-auto d-lg-down-none mr-2" navbar>
          <NavItem onClick={this.logout}>
            {/* <NavLink to="" className="nav-link" > */}
            <i className="icon-power" style={{ fontSize: "20px" }}></i>
            {/* </NavLink> */}
          </NavItem>
        </Nav>

        {/* <AppAsideToggler className="d-md-down-none" />
        <AppAsideToggler className="d-lg-none" mobile /> */}
      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
