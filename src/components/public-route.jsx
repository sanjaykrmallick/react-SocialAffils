import { Route, Redirect } from "react-router-dom";
import React from "react";
const PublicRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (localStorage.socialAffilAdminToken) {
          return (
            <Redirect
              to={{
                pathname: rest.redirectRoute,
                extras: { ...rest.location },
              }}
            />
          );
        } else {
          return <Component {...props} />;
        }
      }}
    />
  );
};

export default PublicRoute;
