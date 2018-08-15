import React, { Component } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import moment from "moment";
import Emoji from "react-native-emoji";
import Icon from "react-native-vector-icons/Feather";

import { connect } from "react-redux";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const dayTimes = [
  [
    { name: "Lunch", firstMark: 1130, secondMark: 1210 },
    { name: "After School", firstMark: 1500, secondMark: 1730 }
  ],
  [
    { name: "Conference", firstMark: "0920", secondMark: 1010 },
    { name: "Lunch", firstMark: 1130, secondMark: 1210 },
    { name: "X Block", firstMark: 1340, secondMark: 1500 }
  ],
  [
    { name: "Lunch", firstMark: 1135, secondMark: 1225 },
    { name: "After School", firstMark: 1500, secondMark: 1730 }
  ],
  [
    { name: "Conference", firstMark: "0920", secondMark: 1010 },
    { name: "Lunch", firstMark: 1130, secondMark: 1210 },
    { name: "After School", firstMark: 1500, secondMark: 1730 }
  ],
  [
    { name: "Lunch", firstMark: 1130, secondMark: 1210 },
    { name: "X Block", firstMark: 1340, secondMark: 1500 }
  ],
  [{ name: "Morning", firstMark: 1130, secondMark: 1210 }],
  [{ name: "Morning", firstMark: 1130, secondMark: 1210 }]
];

const slotToColor = {
  Lunch: {
    bg: "#C4D1FF",
    text: "#21388F"
  },
  "X Block": {
    bg: "#E1D2FF",
    text: "#8B64DE"
  },
  Conference: {
    bg: "#CCFFD4",
    text: "#4BAC5A"
  },
  "After School": {
    bg: "#F1D5FF",
    text: "#9636C6"
  }
};

const weekdays = ["Mon", "Tues", "Wed", "Thurs", "Fri"];
const endpoint = "https://stormy-lowlands-99865.herokuapp.com";

class Planner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      today: moment(),
      pickedDay: moment().day() === 6 || moment().day() === 7
        ? moment().day(8)
        : moment(),
      pickedIndex: moment().day() === 6 || moment().day() === 7
        ? moment().day(8) - 1
        : moment().day() - 1,
      events: [],
      weekSchedule: [0, 1, 2, 3, 4]
    };

    this.getOrdinalNum = this.getOrdinalNum.bind(this);
    this.getWeekDates = this.getWeekDates.bind(this);
    this.getEvents = this.getEvents.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.calculateMarginTop = this.calculateMarginTop.bind(this);
  }

  async componentDidMount() {
    this.setState({
      events: await this.getEvents()
    });

    const weekScheduleRes = await fetch(`${endpoint}/thisweek`);
    const weekSchedule = await weekScheduleRes.json();

    this.setState({
      weekSchedule: weekSchedule.thisWeek,
      otherWeeks: weekSchedule
    });
  }

  async getEvents() {
    const weekDates = this.getWeekDates();

    const response = await fetch(`${endpoint}/api/geteventsbygroupid`, {
      method: "POST",
      headers: {
        "x-access-token": this.props.user.token,
        Accept: "application/json",
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        groupIds: this.props.groups.userGroups.map(i => i.groupId),
        firstMark: weekDates[0].format(),
        secondMark: weekDates[4].format()
      })
    });

    const data = await response.json();
    return data;
  }

  getOrdinalNum(n) {
    return (
      n +
      (n > 0
        ? ["th", "st", "nd", "rd"][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10]
        : "")
    );
  }

  getWeekDates() {
    const dayInWeek = this.state.today.day();

    return Array(5)
      .fill()
      .map((i, index) =>
        moment().day(
          dayInWeek - index + (5 - dayInWeek) + (moment().day() === 6 ? 7 : 0)
        )
      );
  }

  formatDate(number) {
    var firstDigit = parseInt(number.toString().substring(0, 2)) % 12;
    if (firstDigit === 0) {
      firstDigit = 12;
    }
    return firstDigit + ":" + number.toString().substring(2, 4);
  }

  calculateMarginTop(index) {
    return (
      dayTimes[this.state.pickedDay.day()][index].firstMark -
      dayTimes[this.state.pickedDay.day() - 1][index - index === 0 ? 0 : 1]
        .secondMark
    );
  }

  render() {
    var days = this.getWeekDates().sort((a, b) => a.date() - b.date());
    var pickedDayEvents = this.state.events.filter(i => {
      if (i.paused) {
        return false;
      }
      switch (i.option) {
        case "One Time":
          if (this.state.pickedDay.diff(moment()) > 0) {
            return false;
          }
          return this.state.pickedDay.isSame(moment(i.date), "date");
          break;
        case "Weekly":
          var irregularities;
          var pickedDayCopy = moment(i.date);
          console.log(
            pickedDayCopy.startOf("isoweek").month() +
              1 +
              "-" +
              pickedDayCopy.startOf("isoweek").date()
          );
          if (
            this.state.otherWeeks &&
            this.state.otherWeeks[
              pickedDayCopy.startOf("isoweek").month() +
                1 +
                "-" +
                pickedDayCopy.startOf("isoweek").date()
            ]
          ) {
            irregularities = this.state.otherWeeks[
              pickedDayCopy.startOf("isoweek").month() +
                1 +
                "-" +
                pickedDayCopy.startOf("isoweek").date()
            ];
          } else {
            irregularities = [1, 2, 3, 4, 5];
          }
          const dayInWeek = irregularities[moment(i.date).day() - 1] - 1;
          if (dayInWeek === this.state.weekSchedule[this.state.pickedIndex]) {
            return true;
          }
          return false;
          break;
        case "Monthly":
          if (
            days[moment(i.date).day() - 1].diff(moment(i.date), "days") === 28
          ) {
            var irregularities;
            var pickedDayCopy = moment(i.date);
            console.log(
              pickedDayCopy.startOf("isoweek").month() +
                1 +
                "-" +
                pickedDayCopy.startOf("isoweek").date()
            );
            if (
              this.state.otherWeeks &&
              this.state.otherWeeks[
                pickedDayCopy.startOf("isoweek").month() +
                  1 +
                  "-" +
                  pickedDayCopy.startOf("isoweek").date()
              ]
            ) {
              irregularities = this.state.otherWeeks[
                pickedDayCopy.startOf("isoweek").month() +
                  1 +
                  "-" +
                  pickedDayCopy.startOf("isoweek").date()
              ];
            } else {
              irregularities = [1, 2, 3, 4, 5];
            }
            const dayInWeek = irregularities[moment(i.date).day() - 1] - 1;
            if (dayInWeek === this.state.weekSchedule[this.state.pickedIndex]) {
              return true;
            }
            return false;
          }
          break;
      }
    });
    return (
      <Container>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate("HomePage")}
          style={{
            position: "absolute",
            top: 35,
            left: 5,
            width: 50,
            height: 50
          }}
        >
          <Icon
            name="chevron-left"
            size={25}
            color="#212121"
            style={{ marginRight: 5 }}
          />
        </TouchableOpacity>
        <Column>
          <Paragraph>
            YOUR WEEK
          </Paragraph>
          <Paragraph
            style={{
              fontFamily: "Avenir-Heavy",
              fontSize: 14,
              marginBottom: 5,
              letterSpacing: 1,
              marginTop: 10
            }}
          >
            {months[this.state.pickedDay.month()]}
          </Paragraph>
          <Row>
            {days.map((i, index) =>
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Paragraph
                  style={{
                    fontFamily: "Avenir-Book",
                    fontSize: 12,
                    marginBottom: 0,
                    letterSpacing: 0.5
                  }}
                >
                  {weekdays[index]}
                </Paragraph>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({ pickedDay: i, pickedIndex: index })}
                >
                  <Circle
                    style={{
                      backgroundColor: this.state.pickedDay.date() === i.date()
                        ? "#212121"
                        : "#F2F2F2"
                    }}
                  >
                    <BigText
                      style={{
                        color: this.state.pickedDay.date() === i.date()
                          ? "white"
                          : "#212121"
                      }}
                    >
                      {i.date()}
                    </BigText>
                  </Circle>
                </TouchableOpacity>
                {this.state.today.date() === i.date() &&
                  <Circle
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "#F2F2F2",
                      marginTop: 5
                    }}
                  />}
              </View>
            )}
          </Row>
        </Column>
        <ScrollView
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
        >
          {dayTimes[
            this.state.weekSchedule[this.state.pickedDay.day() - 1]
          ].map((slot, index) =>
            <Row
              style={{
                marginTop: index - 1 === -1
                  ? 0
                  : (slot.firstMark -
                      dayTimes[
                        this.state.weekSchedule[this.state.pickedDay.day() - 1]
                      ][index - 1].secondMark) /
                      4
              }}
            >
              <Col>
                <LittleText
                  style={{
                    margin: 0,
                    marginBottom: slot.secondMark - slot.firstMark - 30
                  }}
                >
                  {this.formatDate(slot.firstMark)}
                </LittleText>
                <LittleText style={{ margin: 0 }}>
                  {this.formatDate(slot.secondMark)}
                </LittleText>
              </Col>
              {pickedDayEvents.filter(i => i.time === slot.name).length === 0 &&
                <Box
                  style={{
                    backgroundColor: "#F2F2F2",
                    height: 1 * (slot.secondMark - slot.firstMark)
                  }}
                >
                  <LittleText
                    style={{
                      color: "#212121"
                    }}
                  >
                    {slot.name}
                  </LittleText>
                </Box>}
              {pickedDayEvents.filter(i => i.time === slot.name).map(event =>
                <Box
                  style={{
                    backgroundColor: this.props.groups.userGroups.find(
                      i => i.groupId === event.groupId
                    ).background,
                    minHeight: 1 * (slot.secondMark - slot.firstMark),
                    width: `${80 /
                      pickedDayEvents.filter(i => i.time === slot.name)
                        .length}%`
                  }}
                >
                  <LittleText
                    style={{
                      color: this.props.groups.userGroups.find(
                        i => i.groupId === event.groupId
                      ).messages,
                      marginBottom: 5
                    }}
                  >
                    {slot.name}
                  </LittleText>
                  <EventText
                    style={{
                      color: "#212121"
                    }}
                  >
                    {
                      this.props.groups.userGroups.find(
                        i => i.groupId === event.groupId
                      ).symbol
                    }
                    {"   "}{event.description}
                  </EventText>
                </Box>
              )}
            </Row>
          )}
        </ScrollView>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    groups: state.groups
  };
}

const Paragraph = styled.Text`
  fontFamily: Avenir-Medium;
  color: #212121;
  fontSize: 16px;
  letterSpacing: 1.5px;
  margin: 20px;
`;

const BigText = styled.Text`
  fontFamily: Avenir-Light;
  color: white;
  fontSize: 30px;
`;

const Container = styled.View`
  flex: 1;
  backgroundColor: white;
`;

const Circle = styled.View`
  width: 50px;
  height: 50px;
  borderRadius: 25px;
  backgroundColor: #212121;
  display: flex;
  justifyContent: center;
  alignItems: center;
  margin: 10px;
`;

const Column = styled.View`
  display: flex;
  justifyContent: center;
  alignItems: center;
  margin: 20px;
  marginBottom: 0px;
`;

const Row = styled.View`
  display: flex;
  flexDirection: row;
  alignItems: flex-start;
`;

const Box = styled.View`
  padding: 20px;
  borderRadius: 4px;
  marginRight: 10px;
  width: 82%;
`;

const BoxText = styled.Text`
fontFamily: Avenir-Medium;
fontSize: 14px;
letterSpacing: 1px;
margin: 0px;
marginBottom: 10px;
`;

const Col = styled.View`
  display: flex;
  flexDirection: column;
  width: 10%;
  justifyContent: center;
  marginLeft: 10px;
  marginRight: 10px;
`;

const LittleText = styled.Text`
fontFamily: Avenir-Book;
fontSize: 12;
marginBottom: 0;
letterSpacing: 0.5;
`;

const EventText = styled.Text`
  fontSize: 14px;
  fontFamily: Avenir-Book;
`;
export default connect(mapStateToProps)(Planner);
