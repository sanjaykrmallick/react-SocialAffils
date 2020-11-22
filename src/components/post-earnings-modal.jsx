import React, { Component } from "react";
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table
} from "reactstrap";
import { deepClone, showToast } from "../helper-methods";
import moment from "moment";

class PostEarningsModal extends Component {
  state = {};

  _calculateTotalTipAmount = () => {
    const { tipArr } = deepClone(this.props);
    if (tipArr && tipArr.length) {
      let totalTipsAmt = tipArr.reduce((acc, each) => {
        return (acc = acc + each.amount);
      }, 0);
      return totalTipsAmt;
    } else {
      return 0;
    }
  };

  _calculateTotalPPVAmount = () => {
    const { ppvArr } = deepClone(this.props);
    if (ppvArr && ppvArr.length) {
      let totalAmt = ppvArr.reduce((acc, each) => {
        return (acc = acc + each.amount);
      }, 0);
      return totalAmt;
    } else {
      return 0;
    }
  };

  render() {
    const { isVisible, feed, tipArr, ppvArr } = this.props;

    return (
      <Modal
        isOpen={isVisible}
        toggle={() => this.props.close()}
        className="modal-dialog-centered"
      >
        <ModalHeader toggle={() => this.props.close()}>
          Post Earnings
        </ModalHeader>
        <ModalBody className="py-2">
          {isVisible ? (
            <>
              <h4>
                Tips:{" "}
                <span style={{ color: "#1F1F1F" }}>
                  ${this._calculateTotalTipAmount()}
                </span>
              </h4>

              <Table responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Tip</th>
                  </tr>
                </thead>
                <tbody>
                  {tipArr.length
                    ? tipArr.map((tip, tipIndex) => (
                        <tr key={tipIndex}>
                          <td>
                            <div className="d-flex justify-content-start align-items-center">
                              <div className="fansImgWrap">
                                <img
                                  className="fansImg"
                                  src={
                                    tip._from.hasOwnProperty(
                                      "profilePicture"
                                    ) &&
                                    tip._from.profilePicture &&
                                    tip._from.profilePicture.length
                                      ? tip._from.profilePicture
                                      : "http://www.clipartpanda.com/clipart_images/user-66327738/download"
                                  }
                                  alt="Profile Thumbnail"
                                />
                              </div>
                              {tip._from.name.full}
                            </div>
                          </td>

                          <td>{moment(tip.time).format("DD MMM, YYYY LT")}</td>
                          <td>${tip.amount}</td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </Table>
              {!tipArr.length ? (
                <div>
                  <p className="text-danger" style={{ fontSize: "16px" }}>
                    No tip got yet
                  </p>
                </div>
              ) : null}

              <hr />
              {/* For PPV */}
              <h4>
                PPV:{" "}
                <span style={{ color: "#1F1F1F" }}>
                  ${this._calculateTotalPPVAmount()}
                </span>
              </h4>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ppvArr.length
                    ? ppvArr.map((ppv, ppvIndex) => (
                        <tr key={ppvIndex}>
                          <td>
                            <div className="d-flex justify-content-start align-items-center">
                              <div className="fansImgWrap">
                                <img
                                  className="fansImg"
                                  src={
                                    ppv._from.hasOwnProperty(
                                      "profilePicture"
                                    ) &&
                                    ppv._from.profilePicture &&
                                    ppv._from.profilePicture.length
                                      ? ppv._from.profilePicture
                                      : "http://www.clipartpanda.com/clipart_images/user-66327738/download"
                                  }
                                  alt="Profile Thumbnail"
                                />
                              </div>
                              {ppv._from.name.full}
                            </div>
                          </td>

                          <td>{moment(ppv.time).format("DD MMM, YYYY LT")}</td>
                          <td>{null}</td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </Table>
              {!ppvArr.length ? (
                <div>
                  <p className="text-danger" style={{ fontSize: "16px" }}>
                    No ppv amount got yet
                  </p>
                </div>
              ) : null}
            </>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            className="btn-pill btn btn-outline-dark"
            onClick={() => this.props.close()}
          >
            Close
          </button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default PostEarningsModal;
