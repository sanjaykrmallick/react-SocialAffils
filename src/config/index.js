export default {
  // baseURL: "http://178.128.127.115:3000/admin/v1/", // for dev
  // publicURL: "http://178.128.127.115:3000/api/v1/", // for dev
  // cloudinaryURL: "https://api.cloudinary.com/v1_1/soumyanil/${mediaType}/upload?upload_preset=idbhf8rq", // for dev

  // baseURL: "https://api-dev.truefanz.com/admin/v1/", // for test dev
  // publicURL: "https://api-dev.truefanz.com/api/v1/", // for test dev
  // cloudinaryURL:
  //   "https://api.cloudinary.com/v1_1/soumyanil/${mediaType}/upload?upload_preset=idbhf8rq", // for test dev

  baseURL:
    process.env.REACT_APP_BACKEND_ENV === "live"
      ? "http://139.59.14.81:3000/admin/v1/"
      : "http://139.59.14.81:3000/admin/v1/",
  publicURL:
    process.env.REACT_APP_BACKEND_ENV === "live"
      ? "http://139.59.14.81:3000/admin/v1/"
      : "http://139.59.14.81:3000/admin/v1/",
  cloudinaryURL:
    process.env.REACT_APP_BACKEND_ENV === "live"
      ? "https://api.cloudinary.com/v1_1/alphatec/${mediaType}/upload?upload_preset=fzxhy6mj"
      : "https://api.cloudinary.com/v1_1/soumyanil/${mediaType}/upload?upload_preset=idbhf8rq",

  defaultUserPicture:
    "https://tf-prod-images.s3.us-east-2.amazonaws.com/DEFAULT_PROFILE_PICTURE.png",
  defaultCoverPicture:
    "https://sc-default-content.s3.amazonaws.com/DEFAULT_COVER_PICTURE.png",
  noImageAvialableUrl:
    "https://tf-prod-images.s3.us-east-2.amazonaws.com/NO_IMAGE_AVAILABLE.png",
  leftMenu: {
    items: [
      // {
      //   name: "Dashboard",
      //   url: "/home",
      //   icon: "fa fa-dashboard",
      //   isHeaderMenu: true,
      // },
      {
        name: "Sellers",
        url: "/sellers",
        icon: "fa fa-exchange",
        isHeaderMenu: true,
      },
      {
        name: "Influencers",
        url: "/influencer",
        icon: "icon-user",
        isHeaderMenu: true,
      },
      {
        name: "Orders",
        url: "/order",
        icon: "icon-user-follow",
        isHeaderMenu: true,
      },
      // {
      //   name: "Products",
      //   url: "/live-events",
      //   icon: "icon-settings",
      //   isHeaderMenu: true,
      // },
      {
        name: "Products",
        url: "/product",
        icon: "fa fa-exchange",
        isHeaderMenu: true,
      },
      // {
      //   name: "sales",
      //   url: "/sales",
      //   icon: "icon-settings",
      //   isHeaderMenu: true,
      // },
      // {
      //   name: "Vault",
      //   url: "/vault",
      //   icon: "fa fa-exchange",
      //   isHeaderMenu: true,
      // },
      // {
      //   name: "Transactions",
      //   url: "/transactions",
      //   icon: "fa fa-exchange",
      //   isHeaderMenu: true,
      // },
      // {
      //   name: "Content Moderation",
      //   url: "/content-moderation",
      //   icon: "icon-pencil",
      //   isHeaderMenu: true,
      // },
      // {
      //   name: "Invitations",
      //   url: "/invitations",
      //   icon: "fa fa-plus",
      //   isHeaderMenu: true,
      // },
      // {
      //   name: "Creator Requests",
      //   url: "/creator-requests",
      //   icon: "fa fa-plus",
      //   isHeaderMenu: true,
      // },
      {
        name: "Payouts",
        url: "/payouts",
        icon: "fa fa-dollar",
        isHeaderMenu: true,
      },
      {
        name: "Admin Accounts",
        url: "/admin-accounts",
        icon: "fa fa-black-tie",
        isHeaderMenu: true,
      },
      // {
      //   name: "Settings",
      //   url: "/settings",
      //   icon: "icon-settings",
      //   isHeaderMenu: true,
      // },
      {
        name: "Logout",
        url: "/login",
        icon: "icon-power",
        isHeaderMenu: false,
      },
    ],
  },
  // subscriberCounts: [
  //   { label: "0", value: { min: 0, max: 0 } },
  //   { label: "1-5", value: { min: 1, max: 5 } },
  //   { label: "6-10", value: { min: 6, max: 10 } },
  //   { label: "11-50", value: { min: 11, max: 50 } },
  //   { label: "51-100", value: { min: 51, max: 100 } },
  //   { label: "101-500", value: { min: 101, max: 500 } },
  //   { label: "500+", value: { min: 500 } },
  // ],

  productCount: [
    { label: "0", value: { min: 0, max: 0 } },
    { label: "1-5", value: { min: 1, max: 5 } },
    { label: "6-20", value: { min: 6, max: 20 } },
    { label: "20+", value: { min: 20 } },
  ],
  invitationsStatusColor: {
    pending: "warning",
    accepted: "success",
    expired: "danger",
  },
  contentModerationStatusList: [
    "User Blocked",
    "Content within guidelines",
    "Content Removed",
    "Pending Inquiry",
  ],
  contentModerationReasonList: [
    "Explicit Content",
    "Hate Speech",
    "Promotes Illegal Activity",
    "Racism",
    "Violence",
    "Other",
  ],
  spentCounts: [
    { label: "0", value: { min: 0, max: 0 } },
    { label: "1-50", value: { min: 1, max: 50 } },
    { label: "51-200", value: { min: 51, max: 200 } },
    { label: "201-500", value: { min: 201, max: 500 } },
    { label: "500+", value: { min: 500 } },
  ],
  orderStatus: [
    { label: 'Placed', value: 'placed'},
    { label: 'Cancelled Seller', value: 'cancelled-seller'},
    { label: 'Cancelled Buyer', value: 'cancelled-buyer'},
    { label: 'Refund Requested', value: 'refund-requested'},
    { label: 'Refund Issued', value: 'refund-issued'},
    { label: 'In Transit', value: 'in-transit'},
    { label: 'Delivered', value: 'delivered'},
  ],
  paymentTypes: [
    "tips",
    "subscription",
    // "post",
    "message",
    "withdrawal",
    "vault",
    "unlock",
    "payperview",
    "chargeback",
    "refund",
    "liveEvent",
    // "remove post"
  ],
  liveStatusList: ["Scheduled", "Canceled", "Ongoing", "Completed"],
  paymentStatusList: ["pending", "released", "approved", "flagged", "refunded"],
  withdrawalStatus: [
    // "accepted",
    "requested",
    "approved",
    "rejected",
    "pending",
    "completed",
    // "paid",
    // "failed",
    // "canceled",
    // "updated",
  ],
  monthList: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  regexConfig: {
    digitOnly: /^[0-9]*$/,
    phone: /^(\+\d{1,3}[- ]?)?\d{8,11}$/,
  },
  rsvp: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],

  socialIconConfig: {
    facebook: "fa fa-facebook",
    twitter: "fa fa-twitter",
    youtube: "fa fa-youtube-play",
    instagram: "fa fa-instagram",
    tiktok: "fa fa-tiktok",
  },
};
