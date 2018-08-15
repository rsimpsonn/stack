import React, { Component } from "react";
import {
  View,
  TextInput,
  Text,
  ScrollView,
  ActivityIndicator
} from "react-native";
import styled from "styled-components/native";
import moment from "moment";
import Press from "./Press";

import { connect } from "react-redux";

import { Calendar, CalendarList, Agenda } from "react-native-calendars";

const dayTimes = [
  ["All Day", "Morning", "Night"],
  ["Lunch", "After School"],
  ["Conference", "Lunch", "X Block"],
  ["Lunch", "After School"],
  ["Conference", "Lunch", "After School"],
  ["Lunch", "X Block"],
  ["All Day", "Morning", "Night"]
];

const endpoint = "https://stormy-lowlands-99865.herokuapp.com";

const options = ["One Time", "Weekly", "Monthly"];

const ranges = [
  { range: 0, color: "#71EA9F" },
  { range: 2, color: "#CEFFE1" },
  { range: 5, color: "#F2F2F2" },
  { range: 7, color: "#FFDFBB" },
  { range: 1000, color: "#FF8585" }
];

class EventFormatter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      description: "",
      date: moment(),
      day: moment().format(),
      time: "",
      option: "",
      loading: true,
      message: ""
    };

    this.getEvents = this.getEvents.bind(this);
    this.pickColor = this.pickColor.bind(this);
    this.returnMessageData = this.returnMessageData.bind(this);
  }

  async componentDidMount() {
    const weekScheduleRes = await fetch(`${endpoint}/thisweek`);
    const weekSchedule = await weekScheduleRes.json();

    this.setState({
      weekSchedule: weekSchedule
    });
  }

  async getEvents() {
    const rangeStart = moment(this.state.day).subtract(1, "days").format();
    const rangeEnd = moment(this.state.day).format();
    const response = await fetch(
      `${endpoint}/api/geteventsbydaterange?rangeStart=${rangeStart}&rangeEnd=${rangeEnd}`,
      {
        headers: {
          "x-access-token": this.props.user.token
        }
      }
    );
    const data = await response.json();
    console.log(data);
    this.setState({
      pickedDayEvents: data
    });
  }

  pickColor(time) {
    const length = this.state.pickedDayEvents.filter(i => i.time === time)
      .length;
    var color;
    var index = 0;

    console.log(time, length);

    while (!color) {
      if (length <= ranges[index].range) {
        color = ranges[index].color;
      }
      index++;
    }

    return color;
  }

  returnMessageData() {
    console.log({
      message: this.state.message,
      description: this.state.description,
      option: this.state.option,
      time: this.state.time,
      date: this.state.date,
      type: "event"
    });
    return {
      message: this.state.message,
      description: this.state.description,
      option: this.state.option,
      time: this.state.time,
      date: this.state.date,
      type: "event"
    };
  }

  render() {
    if (this.state.loading && this.state.pickedDayEvents) {
      this.setState({
        loading: false
      });
    } else if (this.state.loading && !this.state.pickedDayEvents) {
      this.getEvents();
    }

    var times;

    if (
      this.state.weekSchedule &&
      this.state.weekSchedule[
        this.state.date.startOf("isoweek").month() +
          1 +
          "-" +
          this.state.date.startOf("isoweek").date()
      ]
    ) {
      times =
        dayTimes[
          this.state.weekSchedule[
            this.state.date.startOf("isoweek").month() +
              1 +
              "-" +
              this.state.date.startOf("isoweek").date()
          ][moment(this.state.day).day() - 1]
        ];
    } else {
      times = dayTimes[moment(this.state.day).day()];
    }

    return (
      <ScrollView contentContainerStyle={{ padding: 10 }}>
        <DescriptionInput
          onChangeText={description => {
            this.setState({ description });
            this.props.handleChange("description", description);
          }}
          value={this.state.description}
          placeholder="Description"
        />
        <Calendar
          onDayPress={day => {
            this.setState({
              day: day.dateString,
              date: moment(day.dateString),
              pickedTime: "",
              loading: true,
              pickedDayEvents: false
            });
            this.returnMessageData();
            this.props.handleChange("date", moment(day.dateString));
          }}
          markedDates={{
            [this.state.day]: {
              selected: true,
              selectedDotColor: "orange"
            }
          }}
          theme={{
            todayTextColor: "#2A7FFF",
            dayTextColor: "#2d4150",
            textDisabledColor: "#d9e1e8",
            dotColor: "#00adf5",
            arrowColor: "#F2F2F2",
            textDayFontFamily: "Avenir-Medium",
            textMonthFontFamily: "Avenir-Light",
            textDayHeaderFontFamily: "Avenir-Light",
            textMonthFontWeight: "bold",
            textDayFontSize: 14,
            textMonthFontSize: 14,
            textDayHeaderFontSize: 12
          }}
        />
        {!this.state.loading &&
          this.state.weekSchedule &&
          <View>
            <Header>Times </Header>
            <Row>
              {times.map(time =>
                <Press
                  color={this.pickColor(time)}
                  data={time}
                  value={this.state.time === time}
                  pressedColor="#DCDCDC"
                  returnData={() => {
                    this.setState({ time });
                    this.returnMessageData();
                    this.props.handleChange("time", time);
                  }}
                />
              )}
            </Row>
            <Header>Options</Header>
            <Row>
              {options.map(option =>
                <Press
                  color="#F2F2F2"
                  data={option}
                  value={this.state.option === option}
                  pressedColor="#DCDCDC"
                  returnData={() => {
                    this.setState({ option });
                    this.returnMessageData();
                    this.props.handleChange("option", option);
                  }}
                />
              )}
            </Row>
          </View>}
        {this.state.loading &&
          <ActivityIndicator size="small" color="#000000" />}
      </ScrollView>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

const DescriptionInput = styled.TextInput`
  backgroundColor: #F2F2F2;
  color: #212121;
  borderRadius: 4px;
  padding: 10px;
  fontFamily: Avenir-Medium;
  marginTop: 10px;
  marginBottom: 10px;
`;

const Row = styled.View`
  display: flex;
  alignItems: center;
  flexDirection: row;
`;

const Header = styled.Text`
  color: #DCDCDC;
  fontFamily: Avenir-Medium;
  letterSpacing: 0.5;
  fontSize: 14px;
  marginBottom: 10px;
  marginTop: 10px;
`;

const Bubble = styled.TextInput`
  borderRadius: 4px;
  fontFamily: Avenir-Medium;
  fontSize: 14px;
  color: #212121;
  width: 80%;
  backgroundColor: white;
`;

export default connect(mapStateToProps)(EventFormatter);
