import React, { Component } from "react";
import "react-dates/initialize";
import { DateRangePicker } from "react-dates";
import "react-dates/lib/css/_datepicker.css";
import moment from "moment";

class CustomDateRangePicker extends Component {
  render() {
    return (
      <DateRangePicker
        startDate={this.props.dateRange.startDate} // momentPropTypes.momentObj or null,
        startDateId={this.props.dateRange.startDateId} // PropTypes.string.isRequired,
        endDate={this.props.dateRange.endDate} // momentPropTypes.momentObj or null,
        endDateId={this.props.dateRange.endDateId} // PropTypes.string.isRequired,
        onDatesChange={({ startDate, endDate }) => {
          this.props.onDatesChange(startDate, endDate);
        }} // PropTypes.func.isRequired,
        focusedInput={this.props.dateRange.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
        onFocusChange={focusedInput => this.props.onFocusChange(focusedInput)} // PropTypes.func.isRequired,
        isOutsideRange={day => moment().diff(day) <= 0}
      />
    );
  }
}

export default CustomDateRangePicker;
