import React, { Component } from "react";
import {
  Label,
  FormGroup,
  Input,
  Progress,
  Popover,
  PopoverHeader,
  PopoverBody
} from "reactstrap";

class PollOption extends Component {
  state = {
    isPopOver: false,
    answerChoosenBy: []
  };

  componentDidMount() {
    const answerChoosenBy = this._getPollOptionDetails();
    this.setState({ answerChoosenBy });
  }

  _getPollOptionDetails = () => {
    const { feed, option } = this.props;
    if (
      feed.hasOwnProperty("_opinions") &&
      feed._opinions.length &&
      option.count > 0
    ) {
      let fans = [];
      fans = feed._opinions.filter(eachOpinion => {
        return eachOpinion.option === option._id;
      });
      return fans;
    }
    return [];
  };

  _getPercentageValue = (feed, option) => {
    if (
      feed.hasOwnProperty("_opinions") &&
      feed._opinions.length &&
      option.count > 0
    ) {
      return (option.count * 100) / feed._opinions.length;
    }
    return 0;
  };

  _togglePopOver = () => {
    let { isPopOver } = this.state;
    isPopOver = !isPopOver;

    this.setState({ isPopOver });
  };

  render() {
    const { feed, option, index } = this.props;
    const { isPopOver, answerChoosenBy } = this.state;
    return (
      <FormGroup
        check
        className="radio mb-1"
        id={"Popover" + option._id + index}
      >
        <Input
          className="form-check-input"
          disabled
          type="radio"
          name="radios"
          value=""
        />
        <Label check className="form-check-label">
          {option.text}
        </Label>
        <Progress value={this._getPercentageValue(feed, option)}>
          {this._getPercentageValue(feed, option)}%
        </Progress>
        <Popover
          placement="bottom"
          isOpen={isPopOver}
          target={"Popover" + option._id + index}
          toggle={this._togglePopOver}
          onClick={this._togglePopOver}
          trigger="legacy"
        >
          <PopoverHeader>Answer choosen by</PopoverHeader>
          <PopoverBody>
            {answerChoosenBy.length ? answerChoosenBy.map((fan, index) => 
           <Label key={index}>{fan._from.name.full}</Label>
           ): <Label>No one selected yet</Label>}
          </PopoverBody>
        </Popover>
      </FormGroup>
    );
  }
}

export default PollOption;
