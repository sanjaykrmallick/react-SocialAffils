import * as _deepClone from "clone-deep";
import { ToastsStore } from "react-toasts";
import moment from "moment";

export const deepClone = (data) => {
  return _deepClone(data);
};

export const showToast = (message, type = "error", duration = 4000) => {
  ToastsStore[type](message, duration);
};

export const sleepTime = (n) => new Promise((r) => setTimeout(() => r(), n));

export const getPostedDateValue = (postedDate) => {
  if (moment().isSame(postedDate, "year")) {
    return moment(postedDate).format("MMM DD");
  } else {
    return moment(postedDate).format("MMM DD, YYYY");
  }
};

export const sortedThreads = (arr, attr) => {
  return arr.sort((t1, t2) => {
    return new Date(t2[attr]) - new Date(t1[attr]);
  });
};

export const formatCurrencyValue = (data) => {
  var formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  return formatter.format(data); /* $2,500.00 */
};

export const capitalize = s => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};
export const getPhoneNumberFromBrackets = (number) => {
  return (
    number.split(')')[1] ? (number.split(')')[1]) : number
  )
}
