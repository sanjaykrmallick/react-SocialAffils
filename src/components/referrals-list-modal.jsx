import React, { Component } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
  Button,
  Badge,
} from "reactstrap";
import config from "../config/index";
import CopyclipBoard from "../components/copy-clipboard";
import { Link } from "react-router-dom";
import { parsePhoneNumberFromString } from 'libphonenumber-js'
class ReferralsListModal extends Component {
  state = {
    invitationsStatusColor: config.invitationsStatusColor,
  };

  _closeModal = (action) => {
    console.log("in _closeModal");
  };

  componentDidMount() {
    console.log("componentDidMount", this.props);
  }

  render() {
    // console.log("from modal", this.props);
    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={() => this.props.toggle(null)}
        className="modal-dialog-centered modal-lg"
      >
        <ModalHeader toggle={() => this.props.toggle(null)}>
          Referrals
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
                  <th>Invited Creator</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {this.props.creatorData.referrals.map((each) => (
                  <tr key={each._id}>
                    {each.hasOwnProperty("acceptedBy") ? (
                      <td>
                        <Link to={`/creator-view/${each.acceptedBy}`}>
                          <span>
                            {each.name.first} {each.name.last}
                          </span>
                        </Link>
                      </td>
                    ) : (
                      <td>
                        {each.name.first} {each.name.last}
                      </td>
                    )}
                    <td>
                      {each.email ? (
                        <CopyclipBoard
                          copiedValue={each.email}
                          border="none"
                        ></CopyclipBoard>
                      ) : (
                        "N/A"
                      )}
                    </td>                    
                    <td>
                      {each.phone ? (
                        <CopyclipBoard
                          copiedValue={parsePhoneNumberFromString(each.phone).formatInternational()}
                          border="none"
                        ></CopyclipBoard>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                    ABC
                    </td>
                    <td>
                      <Badge
                        color={this.state.invitationsStatusColor[each.status]}
                        className="referralStatus capitalize"
                      >
                        {each.status}
                      </Badge>
                      {/* <Badge color="warning" className="referralStatus">
                      Pending
                    </Badge>
                    <Badge color="danger" className="referralStatus">
                      Expired
                    </Badge> */}
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
            onClick={() => this.props.toggle(null)}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default ReferralsListModal;
