import React, { Component } from "react";
import {
  Modal, ModalBody, ModalFooter, ModalHeader, Table,
  Button
} from "reactstrap";
import { format } from "date-fns";
import { Link } from "react-router-dom";
class TipsModal extends Component {
  state = {};

  _closeModal = action => {
    console.log("in _closeModal");
  };

  componentDidMount() {
    console.log("componentDidMount", this.props);
  }

  _formatDate(date) {
    return format(new Date(date), 'MMM d, yyyy');
  }

  render() {
    // console.log('from modal', this.props);
    return (
      <Modal
        isOpen={this.props.isOpen}
        className="modal-dialog-centered"
        toggle={() => this.props.toggle(null)}
      >
        <ModalHeader toggle={() => this.props.toggle(null)}>
          Tips
        </ModalHeader>
        <ModalBody>
          {this.props.data && <Table
            responsive
            className="adminTable mb-1"
            style={{ boxShadow: "none" }}
          >
            <thead>
              <tr>
                <th>Creator</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Post / Message</th>
              </tr>
            </thead>
            <tbody>
              {this.props.data.tips.map((each, index) =>
                <tr key={index}>
                  <td>
                    <Link to={`/creator-view/${each._to.id}`}>
                      {each._to.name.full}
                    </Link>
                  </td>
                  <td>{this._formatDate(each.time)}</td>
                  <td>${each.amount}</td>
                  <td>
                    {each._message && each._message.content[0] && <>Message</>} <br />
                    {each._message && each._message.content[0] && <a href={each._message.content[0].thumbnail} rel="noopener noreferrer" target="_blank">
                      Link
                  </a>}
                    {!each._message && '-'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>}
        </ModalBody>
        <ModalFooter>
          <Button
            color="dark"
            outline
            className="btn-pill"
            onClick={() => this.props.toggle('openSubscriberModal')}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default TipsModal;
