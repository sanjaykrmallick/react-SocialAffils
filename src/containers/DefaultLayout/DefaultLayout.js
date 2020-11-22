import React, { Component, Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import * as router from "react-router-dom";
import { Container } from "reactstrap";

// pages
import {
  Home,
  Influencer,
  CreatorView,
  Order,
  SubscriberView,
  Transactions,
  Payouts,
  ContentModeration,
  Invitations,
  AdminAccounts,
  Settings,
  Seller,
  VaultView,
  Product,
} from "../../pages/index";

// import Subscribers from '../../pages/Subscribers/subscribers'
// import AdminAccounts from '../../pages/AdminAccounts/admin-accounts'
// import Creators from '../../pages/Creators/creators'
// import Invitations from '../../pages/Invitations/invitations'
// import Transactions from '../../pages/Transactions/transactions'
// import ContentModeration from '../../pages/ContentModeration/content-moderation'
// import Payouts from '../../pages/Payouts/payouts'
// import Settings from '../../pages/Settings/settings'
// import CreatorView from '../../pages/CreatorView/creator-view'
// import SubscriberView from '../../pages/SubscriberView/subscriber-view'

import {
  // AppAside,
  AppFooter,
  AppHeader,
  AppSidebar,
  // AppSidebarFooter,
  // AppSidebarForm,
  // AppSidebarHeader,
  // AppSidebarMinimizer,
  // AppBreadcrumb2 as AppBreadcrumb,
  AppSidebarNav2 as AppSidebarNav,
} from "@coreui/react";
// sidebar nav config
import config from "../../config/index";
// routes config
// import routes from '../../routes';

import ProtectedRoute from "../../components/protected-route";
import CreatorRequests from "../../pages/creator-requests";
import PostDetailsPage from "../../pages/post-details-page";
import LiveEvents from "../../pages/live-event";
import Sales from "../../pages/sales";
import EventsView from "../../pages/events-view";
import PayPerViewDetails from "../../pages/PayPerViewDetails";
import orderDetail from "../../pages/orderDetails";
// const DefaultAside = React.lazy(() => import('./DefaultAside'));
const DefaultFooter = React.lazy(() => import("./DefaultFooter"));
const DefaultHeader = React.lazy(() => import("./DefaultHeader"));

class DefaultLayout extends Component {
  loading = () => (
    <div className="animated fadeIn pt-1 text-center">Loading...</div>
  );

  signOut(e) {
    e.preventDefault();
    this.props.history.push("/login");
  }

  render() {
    console.log(config, this.props.match.path);
    return (
      <div className="app">
        <AppHeader fixed>
          <Suspense fallback={this.loading()}>
            <DefaultHeader onLogout={(e) => this.signOut(e)} {...this.props} />
          </Suspense>
        </AppHeader>
        <div className="app-body">
          <AppSidebar fixed display="xs">
            {/* <AppSidebarHeader />
            <AppSidebarForm /> */}

            <Suspense>
              <AppSidebarNav
                navConfig={config.leftMenu}
                {...this.props}
                router={router}
              />
            </Suspense>

            {/* <AppSidebarFooter />
            <AppSidebarMinimizer /> */}
          </AppSidebar>
          <main className="main">
            {/* <AppBreadcrumb appRoutes={routes} router={router}/> */}

            <Container fluid>
              {/* <Suspense fallback={this.loading()}> */}
              <Switch>
                <ProtectedRoute
                  path={`/order`}
                  component={Order}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/order-view/:id`}
                  component={orderDetail}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/admin-accounts`}
                  component={AdminAccounts}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/influencer`}
                  component={Influencer}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/product`}
                  component={Product}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/sellers`}
                  component={Seller}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/product-view/:id`}
                  component={VaultView}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/invitations`}
                  component={Invitations}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/transactions`}
                  component={Transactions}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/content-moderation`}
                  component={ContentModeration}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/payouts`}
                  component={Payouts}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/live-events`}
                  component={LiveEvents}
                  redirectRoute={"/login"}
                />
                {/* <ProtectedRoute
                  exact
                  path={`/sales`}
                  component={Sales}
                  redirectRoute={"/login"}
                /> */}

                <ProtectedRoute
                  exact
                  path={`/pay-per-view/:id`}
                  component={PayPerViewDetails}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute path={`/settings`} component={Settings} />
                <ProtectedRoute
                  path={`/home`}
                  component={Home}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/events-view/:id`}
                  component={EventsView}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/creator-view/:id`}
                  component={CreatorView}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/subscriber-view/:id`}
                  component={SubscriberView}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/creator-requests`}
                  component={CreatorRequests}
                  redirectRoute={"/login"}
                />
                <ProtectedRoute
                  path={`/post/:id`}
                  component={PostDetailsPage}
                  redirectRoute={"/login"}
                />

                {/* <Redirect from="/" to="/dashboard" /> */}
                <Route path="/" render={() => <Redirect to="/sellers" />} />
                {/* <Redirect from="/" exact to={localStorage.socialAffilAdminToken ? '/home' : '/login'} /> */}
              </Switch>
              {/* </Suspense> */}
            </Container>
          </main>

          {/* <AppAside fixed>
            <Suspense fallback={this.loading()}>
              <DefaultAside />
            </Suspense>
          </AppAside> */}
        </div>
        <AppFooter>
          <Suspense fallback={this.loading()}>
            <DefaultFooter />
          </Suspense>
        </AppFooter>
      </div>
    );
  }
}

export default DefaultLayout;
