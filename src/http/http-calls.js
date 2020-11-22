import {
  makeGetRequest,
  makePostRequest,
  makePutRequest,
  // makeDeleteRequests
  uploadFileMultiPart
} from "./http-service";
import config from "../config/index";

export const login = ({ handle, password }) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.baseURL + "login", false, {
      handle,
      password,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const uploadImageOnCloudinary = (formData) => {
  return new Promise((resolve, reject) => {
    uploadFileMultiPart(false, formData)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
}

export const fotgotPassword = ({ handle }) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.publicURL + "forgotpassword", false, {
      handle,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getAllSeller = () => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "sellers", true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getSellerById = (id) => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + `seller/${id}`, true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const editSeller = (data, id) => {
  return new Promise((resolve, reject) => {
    makePutRequest(config.baseURL + `seller/${id}`, true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const createSeller = (data) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.baseURL + `seller`, true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getAllCreators = () => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "influencers", true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getCreatorDetails = (id) => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "influencer/" + id, true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};


export const getInfluencerById = (id) => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + `influencer/${id}`, true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const editInfluencer = (data, id) => {
  return new Promise((resolve, reject) => {
    makePutRequest(config.baseURL + `influencer/${id}`, true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const createInfluencer = (data) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.baseURL + `influencer`, true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getAllOrders = () => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "orders", true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getOrderById = (id) => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + `order/${id}`, true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};
export const editOrder = (data, id) => {
  return new Promise((resolve, reject) => {
    makePutRequest(config.baseURL + `order/${id}`, true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};
export const changeOrderStatus = (data, id) => {
  return new Promise((resolve, reject) => {
    makePutRequest(config.baseURL + `order/${id}`, true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getAllProducts = () => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "products", true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getProductById = (id) => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + `product/${id}`, true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const editProductStatus = (data, id) => {
  return new Promise((resolve, reject) => {
    makePutRequest(config.baseURL + `product/${id}`, true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getAllPayouts = () => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "payouts", true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const editPayoutStatus = (id, data) => {
  return new Promise((resolve, reject) => {
    makePutRequest(config.baseURL + `payout/${id}`, true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const changeUserStatus = (id) => {
  return new Promise((resolve, reject) => {
    makePutRequest(config.baseURL + "change/status/" + id, true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};


export const getAllSubscribers = (data) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.baseURL + "fans", true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getSubscriberDetails = (id) => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "fan/" + id, true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getAllAdminUsers = () => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "admins", true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const changeAdminStatus = (id) => {
  return new Promise((resolve, reject) => {
    makePutRequest(config.baseURL + "admin/status/" + id, true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const createAdmin = (data) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.baseURL + "create/admin", true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getAllInvitations = () => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "invitations", true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getInvitationRequests = () => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "invitationRequests", true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const sendInvite = (data) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.baseURL + "invitation", true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getContentModerations = () => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "reports", true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const updateContentModeration = (id, data) => {
  return new Promise((resolve, reject) => {
    makePutRequest(config.baseURL + "report/" + id, true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getAllTransactions = (data) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.baseURL + "transactions", true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const updateTransactions = (data) => {
  return new Promise((resolve, reject) => {
    makePutRequest(config.baseURL + "transactions", true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const onUpdatePPVStatus = (data) => {
  console.log(data);
  let payload = {
    status: data.status,
  };
  return new Promise((resolve, reject) => {
    makePutRequest(config.baseURL + "payperview/" + data.id, true, payload)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getSettings = () => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "settings", true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const updteSettings = (data) => {
  return new Promise((resolve, reject) => {
    makePutRequest(config.baseURL + "settings", true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};


export const updatePayout = (id, data) => {
  return new Promise((resolve, reject) => {
    makePutRequest(config.baseURL + "withdrawal/" + id, true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const sendMessage = (option, data) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.baseURL + "users/emails/" + option, true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getDashboardSummary = () => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "dashboard/summary", true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getTopCreators = (data) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.baseURL + "dashboard/influencer/summary", true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getTopSubscriber = (data) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.baseURL + "dashboard/fan/summary", true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getCreatorsPerMonth = () => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "dashboard/influencer/month", true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getSubscribersPerMonth = (data) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.baseURL + "dashboard/fan/month", true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getCreatorActivity = (id) => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "influencer/activity/" + id, true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getComments = (id) => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "/post/comments/" + id, true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("getComments call error: ", e);
        reject(e);
      });
  });
};

export const getSubscriberActivity = (id) => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "fan/activity/" + id, true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const updateInfluencerDetails = (id, data) => {
  return new Promise((resolve, reject) => {
    makePutRequest(config.baseURL + "influencer/" + id, true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const acceptOrRejectInvitationRequest = (id, data) => {
  return new Promise((resolve, reject) => {
    makePutRequest(config.baseURL + "invitationRequest/" + id, true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const flagPost = (payload) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.baseURL + "report", true, payload)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("flagPost call error: ", e);
        reject(e);
      });
  });
};

export const getPostDetails = (id) => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "post/" + id, true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "users", true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getLiveEvents = (data) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.baseURL + "events", true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getLiveEventDetails = (id) => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "event/" + id, true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getAllPPVs = (data) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.baseURL + "payperviews", true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getPPVDetails = (id) => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "payperview/" + id, true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getAllVaultFolder = (data) => {
  return new Promise((resolve, reject) => {
    makePostRequest(config.baseURL + "folders", true, data)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};

export const getAllVaultFolderDetail = (id) => {
  return new Promise((resolve, reject) => {
    makeGetRequest(config.baseURL + "folder/" + id, true)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        console.log("API call error: ", e);
        reject(e);
      });
  });
};
