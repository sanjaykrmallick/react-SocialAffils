import React, { Component } from "react";
import { Route, Switch, BrowserRouter, Redirect } from "react-router-dom";
import DefaultLayout from "./containers/DefaultLayout/DefaultLayout";
// import { renderRoutes } from 'react-router-config';
import "./App.scss";

import { Login, ForgotPassword } from "./pages/index";
import {
  ToastsContainer,
  ToastsStore,
  ToastsContainerPosition,
} from "react-toasts";
import PublicRoute from "./components/public-route";
import { persistor, store } from "./redux/store";
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';

// import ForgotPassword from "./pages/ForgotPassword/forgot-password";

// const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;

// Containers

// Pages
// import ForgotPassword from "./views/Pages/ForgotPassword/forgot-password";

// const Login = React.lazy(() => import('./views/Pages/Login'));
// const Register = React.lazy(() => import('./views/Pages/Register'));
// const Page404 = React.lazy(() => import('./views/Pages/Page404'));
// const Page500 = React.lazy(() => import('./views/Pages/Page500'));

class App extends Component {
  render() {
    // console.log = () => {};
    return (
      // <HashRouter>
      //     <React.Suspense fallback={loading()}>
      //       <Switch>
      //         <Route exact path="/login" name="Login Page" render={props => <Login {...props}/>} />
      //         <Route exact path="/register" name="Register Page" render={props => <Register {...props}/>} />
      //         <Route exact path="/404" name="Page 404" render={props => <Page404 {...props}/>} />
      //         <Route exact path="/500" name="Page 500" render={props => <Page500 {...props}/>} />
      //         <Route path="/" name="Home" render={props => <DefaultLayout {...props}/>} />
      //       </Switch>
      //     </React.Suspense>
      // </HashRouter>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <BrowserRouter>
            <ToastsContainer
              store={ToastsStore}
              position={ToastsContainerPosition.TOP_RIGHT}
            />
            <div className='App'>
              {/* <Navbar /> */}
              <div className=''>
                <Switch>
                  <PublicRoute
                    path='/login'
                    component={Login}
                    redirectRoute={"/seller"}
                  />
                  <PublicRoute
                    path='/forgot-password'
                    component={ForgotPassword}
                    redirectRoute={"/seller"}
                  />

                  <Route path='/' component={DefaultLayout} />

                  <Route path='*' render={() => <Redirect to='/' />} />
                </Switch>
              </div>
            </div>
          </BrowserRouter>
        </PersistGate>
      </Provider>
    );
  }
}

export default App;
