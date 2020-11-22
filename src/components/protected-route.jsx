import { Route, Redirect } from "react-router-dom";
import React from "react";
const ProtectedRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (localStorage.socialAffilAdminToken) {
          return <Component {...props} />;
        } else {
          return (
            <Redirect
              to={{
                pathname: rest.redirectRoute,
                extras: { ...rest.location },
              }}
            />
          );
        }
      }}
    />
  );
};

export default ProtectedRoute;
