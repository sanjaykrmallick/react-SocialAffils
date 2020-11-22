import React, { Component } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
  Button,
} from "reactstrap";
import { format } from "date-fns";
import { capitalize } from "../helper-methods/index";
import { Link } from "react-router-dom";
class SubscriptionListModal extends Component {
  state = {};

  _closeModal = (action) => {
    console.log("in _closeModal");
  };

  componentDidMount() {
    console.log("componentDidMount", this.props);
  }

  _formatDate(date) {
    return format(new Date(date), "MMM d, yyyy");
  }

  render() {
    console.log("from modal", this.props);
    return (
      <Modal
        isOpen={this.props.isOpen}
        className="modal-dialog-centered"
        toggle={() => this.props.toggle(null)}
      >
        <ModalHeader toggle={() => this.props.toggle(null)}>
          Subscriptions
        </ModalHeader>
        <ModalBody>
          {this.props.data && (
            <Table
              responsive
              className="adminTable mb-1"
              style={{ boxShadow: "none" }}
            >
              <thead>
                <tr>
                  <th>Creator</th>
                  <th>Fee</th>
                  <th>Start Date</th>
                  <th>Tier & Cycle</th>
                </tr>
              </thead>
              <tbody>
                {this.props.data.subscriptions.map((each) => (
                  <tr key={each.id}>
                    <td>
                      <Link to={`/creator-view/${each._influencer.id}`}>
                        {each._influencer.name.full}
                      </Link>
                    </td>
                    <td>${each.amount}</td>
                    <td>{this._formatDate(each.start)}</td>
                    <td>
                      {capitalize(each.tier)} | {each.billingCycle/30} Month
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="dark"
            outline
            className="btn-pill"
            onClick={() => this.props.toggle("openSubscriberModal")}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default SubscriptionListModal;
