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
class VaultListModal extends Component {
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
        <ModalHeader toggle={() => this.props.toggle(null)}>sales</ModalHeader>
        <ModalBody>
          {this.props.data && (
            <Table
              responsive
              className="adminTable mb-1"
              style={{ boxShadow: "none" }}
            >
              <thead>
                <tr>
                  <th>Subscriber</th>
                  <th>Paid</th>
                  <th>Date</th>
                  {/* <th>Tier & Cycle</th> */}
                </tr>
              </thead>
              <tbody>
                {console.log(this.props.data)}
                {this.props.data.map((each) => (
                  <tr key={each._id}>
                    <td>
                      <Link to={`/creator-view/${each._id}`}>
                        {each._from.name.full}
                      </Link>
                    </td>
                    <td>${each.amount}</td>
                    <td>{this._formatDate(each.time)}</td>
                    {/* <td>
                      {capitalize(each.tier)} | {each.billingCycle/30} Month
                    </td> */}
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
            onClick={() => this.props.toggle("openVaultModal")}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default VaultListModal;
