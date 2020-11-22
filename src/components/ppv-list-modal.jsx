import React, { Component } from "react";
import {
  Modal, ModalBody, ModalFooter, ModalHeader, Table,
  Button
} from "reactstrap";
import { format } from "date-fns";
import { Link } from "react-router-dom";
class PpvListModal extends Component {
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

  _openMedia(data) {
    console.log(data);
    window.open(data.thumbnail, '_blank');
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
          PPV
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
                <th>Message</th>
                <th>Attached Media</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {this.props.data.ppv.map((each, index) =>
                <tr key={index}>
                  <td>
                    <Link to={`/creator-view/${each._to.id}`}>
                      {each._to.name.full}
                    </Link>
                  </td>
                  <td>{this._formatDate(each.time)}</td>
                  <td>{each.message || '-'}</td>
                  <td>
                    {each._message && each._message.content[0] && <Button color="primary" outline onClick={() => this._openMedia(each._message.content[0])}>
                      <i className="icon-control-play"></i>
                    </Button>}
                    {!each._message && '-'}
                  </td>
                  <td>${each.amount}</td>
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

export default PpvListModal;
