import React, { Component } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Input,
  FormGroup,
  Label,
  Form,
  InputGroup,         
  InputGroupAddon,
  InputGroupText,
  Card,
  CardBody
} from "reactstrap";
import { getSettings, updteSettings } from "../http/http-calls";
import { ToastsStore } from "react-toasts";
import Chips, { Chip } from "react-chips";
import { showToast } from "../helper-methods";
import CustomChip from "../chip";

const chipsTheme = {
  chipsContainer: {
    display: "flex",
    position: "relative",
    border: "1px solid #e4e7ea",
    backgroundColor: "#fff",
    fontSize: "13px",
    minHeight: 24,
    alignItems: "center",
    flexWrap: "wrap",
    padding: "3px 4px 4px",
    borderRadius: "4px",
    ":focus": {
      border: "1px solid #5c6873"
    }
  },
  container: {
    flex: 1
  },
  containerOpen: {},
  input: {
    border: "none",
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
    padding: 5,
    margin: 0
  },
  suggestionsContainer: {},
  suggestionsList: {
    position: "absolute",
    border: "1px solid #ccc",
    zIndex: 10,
    left: 0,
    top: "100%",
    width: "100%",
    backgroundColor: "#fff",
    listStyle: "none",
    padding: 0,
    margin: 0
  },
  suggestion: {
    padding: "5px 15px"
  },
  suggestionHighlighted: {
    background: "#ddd"
  },
  sectionContainer: {},
  sectionTitle: {}
};

const chipTheme = {
  chip: {
    padding: "0 4px 4px",
    background: "#1F1F1F",
    color: "#fff",
    margin: "2.5px",
    borderRadius: 3,
    cursor: "default"
  },
  chipSelected: {
    background: "#888"
  },
  chipRemove: {
    fontWeight: "bold",
    marginLeft: "4px",
    marginRight: "1px",
    fontSize: "17px",
    color: "#fff",
    cursor: "pointer",
    ":hover": {
      color: "#fff"
    }
  }
};

class Settings extends Component {
  state = {
    chips: [],
    tipTexts: [],
    settings: {
      referPercentage: "",
      influencerPercentage: ""
    },
    errors: {},
    isDirty: {
      referPercentage: false,
      influencerPercentage: false
    },
    loading: {
      loadingData: false,
      updateLoading: false
    }
  };

  _goBack = () => {
    window.history.go(-1);
  };

  _manageLoading = (key, value) => {
    let { loadingData, updateLoading } = this.state.loading;
    if (key === "data") {
      loadingData = value;
    } else if (key === "update") {
      updateLoading = value;
    }
    this.setState({ loading: { loadingData, updateLoading } });
  };

  _getSettings = () => {
    this._manageLoading("data", true);
    getSettings().then(
      response => {
        console.log("_getSettings", response);
        this.setState({
          settings: response.setting,
          chips:
            response.setting && response.setting.categories
              ? response.setting.categories
              : [],
          tipTexts:
            response.setting && response.setting.tipTexts
              ? response.setting.tipTexts
              : []
        });
        this._manageLoading("data", false);
      },
      error => {
        this._manageLoading("data", false);
        // ToastsStore.error(error.reason, 3000);
        showToast(
          error.reason && error.reason.length
            ? error.reason
            : "Server error. Try again after sometime.",
          "error"
        );
      }
    );
  };

  _handleOnChange = ({ currentTarget }) => {
    const { settings, isDirty } = this.state;
    settings[currentTarget.name] = currentTarget.value;
    isDirty[currentTarget.name] = true;
    this.setState({ settings });
    this._validateForm();
  };
  /**
   * To handle submit of the form and validate it
   */
  _handleOnSubmit = event => {
    event.preventDefault();
    const { isDirty } = this.state;
    isDirty.referPercentage = true;
    isDirty.influencerPercentage = true;
    this.setState({ isDirty }, () => {
      console.log(this.state.isDirty);
      let errors = this._validateForm();
      console.log("TCL: errors", errors);
      // this.setState({errors});
      if (!errors) {
        console.log("Make API call");
        this._updateSettings();
      }
    });
  };
  /**
   * To Validate the form and show the error messages
   */
  _validateForm() {
    const { settings, errors, isDirty, chips, tipTexts } = this.state;
    console.log("TCL: _validateForm -> chips, tipTexts", chips, tipTexts);
    // console.log(settings, isDirty);
    Object.keys(settings).forEach(each => {
      if (each === "referPercentage" && isDirty.referPercentage) {
        if (!settings.referPercentage.toString().trim().length) {
          errors.referPercentage = "Referral Benefits is Required";
        } else if (
          settings.referPercentage.toString().trim().length &&
          (settings.referPercentage <= 0 || settings.referPercentage > 100)
        ) {
          errors.referPercentage =
            "Referral Benefits should be between 1 and 100";
        } else {
          delete errors[each];
          isDirty.referPercentage = false;
        }
      } else if (
        each === "influencerPercentage" &&
        isDirty.influencerPercentage
      ) {
        if (!settings.influencerPercentage.toString().trim().length) {
          errors[each] = "Creator Share is Required";
        } else if (
          settings.influencerPercentage.toString().trim().length &&
          (settings.influencerPercentage <= 0 ||
            settings.influencerPercentage > 100)
        ) {
          errors[each] = "Creator Share should be between 1 and 100";
        } else {
          delete errors[each];
          isDirty.influencerPercentage = false;
        }
      }
    });
    if (!chips.length) {
      errors["chips"] = "You have to add at least one category";
    }
    if (!tipTexts.length) {
      errors["tipTexts"] = "You have to add at least one tip text";
    }

    console.log("errors :", errors);
    this.setState({ errors }, () => {
      console.log("TCL: _validateForm -> errors", errors);
    });
    return Object.keys(errors).length ? errors : null;
  }

  _updateSettings = () => {
    let { settings, chips, tipTexts } = this.state;
    settings.referPercentage = Number(settings.referPercentage);
    settings.influencerPercentage = Number(settings.influencerPercentage);
    settings["categories"] = chips;
    settings["tipTexts"] = tipTexts;
    this._manageLoading("update", true);
    updteSettings(settings).then(
      response => {
        this._manageLoading("update", false);
        ToastsStore.success("Settings updated Successfully", 3000);
      },
      error => {
        this._manageLoading("update", false);
        // ToastsStore.error(error.reason, 3000);
        showToast(
          error.reason && error.reason.length
            ? error.reason
            : "Server error. Try again after sometime.",
          "error"
        );
      }
    );
  };

  _onChipSelect = (chips, arrName = "chips") => {
    console.log("TCL: _onChipSelect -> chips", chips);
    let lastAddedChip = "";
    if (chips.length) {
      lastAddedChip = chips[chips.length - 1].trim();
      console.log("TCL: _onChipSelect -> lastAddedChip", lastAddedChip);
      chips.pop();
    }

    const filterChips = chips.filter(
      chip => chip.trim().toLowerCase() === lastAddedChip.toLowerCase()
    );
    if (!filterChips.length && lastAddedChip.length) {
      chips.push(lastAddedChip);
    }
    this.setState({ [arrName]: chips.length ? chips : [] }, () => {
      console.log("this.state :", this.state);
    });
  };

  _updateChip = arr => {
    console.log("on _updateChip :", arr);
  };

  componentDidMount() {
    this._getSettings();
  }

  render() {
    let { settings, loading, chips, tipTexts } = this.state;
    console.log("TCL: render -> this.state", this.state);
    return (
      <div className="app TruFansPgBg animated fadeIn">
        <Container fluid>
          <Row>
            <Col xs="12">
              <div className="PgTitle justify-content-start align-items-center">
                {/* on clicking the below btn, it should take back the user to the previous page in history */}
                {/* <Button
                  color="ghost-dark"
                  className="customBackBtn"
                  onClick={this._goBack}
                >
                  <i className="fa fa-arrow-left"></i>
                </Button> */}
                <h2>Settings</h2>
              </div>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col xs="12" sm="12" md="10" lg="8" xl="6">
              <Card className="settingsWrap">
                {!loading.loadingData && (
                  <CardBody className="pt-4">
                    <Form noValidate className="form-horizontal">
                      <FormGroup row className="mb-4 align-items-center">
                        <Col sm="12" className="mb-1">
                          <h4
                            style={{
                              fontFamily: "'Playfair Display', serif",
                              fontWeight: 700,
                              color: "#1F1F1F",
                              marginBottom: "15px"
                            }}
                          >
                            Category of Creator Settings
                          </h4>
                          <Chips
                            style={{ width: "100%" }}
                            theme={chipsTheme}
                            chipTheme={chipTheme}
                            value={chips}
                            onChange={this._onChipSelect}
                            createChipKeys={[9, 13]} //  Key codes to add chips
                            placeholder={"Add category.."}
                          />
                        </Col>
                        {!chips.length ||
                        (this.state.errors &&
                          this.state.errors.chips &&
                          this.state.errors.chips.length) ? (
                          <div
                            className="validation-error"
                            style={{ marginLeft: "15px" }}
                          >
                            {this.state.errors.chips}
                          </div>
                        ) : null}
                      </FormGroup>

                      <FormGroup row className="mb-4 align-items-center">
                        <Col sm="12" className="mb-1">
                          <h4
                            style={{
                              fontFamily: "'Playfair Display', serif",
                              fontWeight: 700,
                              color: "#1F1F1F",
                              marginBottom: "15px"
                            }}
                          >
                            Dynamic tip text
                          </h4>
                          <Chips
                            style={{ width: "100%" }}
                            theme={chipsTheme}
                            chipTheme={chipTheme}
                            value={tipTexts}
                            onChange={arr =>
                              this._onChipSelect(arr, "tipTexts")
                            }
                            renderChip={value => (
                              <CustomChip 
                                  value={value} 
                                 
                              ></CustomChip>
                          )}
                            createChipKeys={[9, 13]} //  Key codes to add chips
                            placeholder={"Add tip text.."}
                          />
                        </Col>
                        {!tipTexts.length ||
                        (this.state.errors &&
                          this.state.errors.tipTexts &&
                          this.state.errors.tipTexts.length) ? (
                          <div
                            className="validation-error"
                            style={{ marginLeft: "15px" }}
                          >
                            {this.state.errors.tipTexts}
                          </div>
                        ) : null}
                      </FormGroup>

                      <FormGroup row className="mb-4 align-items-center">
                        <Col sm="12" className="mb-1">
                          <h4
                            style={{
                              fontFamily: "'Playfair Display', serif",
                              fontWeight: 700,
                              color: "#1F1F1F",
                              marginBottom: "20px"
                            }}
                          >
                            Revenue Share Settings
                          </h4>

                          <div className="d-flex justify-content-start align-items-center mb-3">
                            <Label htmlFor="" style={{ minWidth: "170px" }}>
                              Referral Benefits
                            </Label>

                            <InputGroup style={{ width: "200px" }}>
                              <Input
                                type="number"
                                id="referPercentage"
                                autoComplete="off"
                                name="referPercentage"
                                placeholder="Enter"
                                value={settings.referPercentage}
                                onChange={this._handleOnChange}
                              />
                              <InputGroupAddon addonType="append">
                                <InputGroupText>
                                  <i className="fa fa-percent"></i>
                                </InputGroupText>
                              </InputGroupAddon>
                              {this.state.errors && (
                                <div className="validation-error">
                                  {this.state.errors.referPercentage}
                                </div>
                              )}
                            </InputGroup>
                          </div>

                          <div className="d-flex justify-content-start align-items-center">
                            <Label htmlFor="" style={{ minWidth: "170px" }}>
                              Creator Share
                            </Label>
                            <InputGroup style={{ width: "200px" }}>
                              <Input
                                type="number"
                                id="influencerPercentage"
                                name="influencerPercentage"
                                placeholder="Enter"
                                value={settings.influencerPercentage}
                                onChange={this._handleOnChange}
                              />
                              <InputGroupAddon addonType="append">
                                <InputGroupText>
                                  <i className="fa fa-percent"></i>
                                </InputGroupText>
                              </InputGroupAddon>
                              {this.state.errors && (
                                <div className="validation-error">
                                  {this.state.errors.influencerPercentage}
                                </div>
                              )}
                            </InputGroup>
                          </div>
                        </Col>
                      </FormGroup>

                      <Button
                        onClick={e => this._handleOnSubmit(e)}
                        className="BtnPurple mx-auto d-block"
                        style={{ padding: "8px 25px", marginTop: "35px" }}
                        disabled={loading.updateLoading}
                      >
                        {loading.updateLoading ? (
                          <>
                            <i className="fa fa-spinner fa-spin mr5" />
                            &nbsp;
                          </>
                        ) : null}
                        Save
                      </Button>
                    </Form>
                  </CardBody>
                )}
                {loading.loadingData && (
                  <div>
                    <div className="loading-section list-loading">
                      <i className="fa fa-spinner fa-spin"></i> &nbsp; Loading
                      Settings..
                    </div>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Settings;
