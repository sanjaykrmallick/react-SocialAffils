export const getToken = () => {
  return new Promise((resolve, reject) => {
    let token = null;
    // const oldState = store.getState();
    // const state = { ...oldState };
    // Try to get token from state
    if (localStorage.socialAffilAdminToken) {
      token = localStorage.socialAffilAdminToken;
    }
    resolve(token);
  });
};
