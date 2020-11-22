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
import CopyclipBoard from "../components/copy-clipboard";
import { Link } from "react-router-dom";
class SubscriberListModal extends Component {
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
    // console.log('from modal', this.props);
    return (
      <Modal
        isOpen={this.props.isOpen}
        className="modal-dialog-centered modal-lg"
        toggle={() => this.props.toggle(null)}
      >
        <ModalHeader toggle={() => this.props.toggle(null)}>
          Subscribers
        </ModalHeader>
        <ModalBody>
          {this.props.creatorData && (
            <Table
              responsive
              className="adminTable mb-1"
              style={{ boxShadow: "none" }}
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {this.props.creatorData.subscribers.map((each) => (
                  <tr key={each.id}>
                    <td>
                      <Link to={`/subscriber-view/${each._fan._id}`}>
                        <span>
                          {each._fan.name.first} {each._fan.name.last}
                        </span>
                      </Link>
                    </td>
                    <td>
                      {each._fan.email ? (
                        <CopyclipBoard
                          copiedValue={each._fan.email}
                          border="none"
                        ></CopyclipBoard>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      {each._fan.phone ? (
                        <CopyclipBoard
                          copiedValue={each._fan.phone}
                          border="none"
                        ></CopyclipBoard>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>{this._formatDate(each.start)}</td>
                    <td>${each.amount}</td>
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

export default SubscriberListModal;
