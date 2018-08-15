import React, { Component } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { connect } from "react-redux";
import Image from "react-native-remote-svg";
import Icon from "react-native-vector-icons/Feather";
import moment from "moment";

import EventGoing from "./EventGoing";

import { getEvent, removeFromEventList, addToEventList } from "../../actions";

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];
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

class Event extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newFetch: false
    };

    this.getOrdinalNum = this.getOrdinalNum.bind(this);
    this.handleStatusChange = this.handleStatusChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.newFetch && !nextProps.events.isFetching) {
      const index = nextProps.events.events.findIndex(
        i => i._id === this.props.eventId
      );
      if (index !== -1) {
        this.setState({
          event: nextProps.events.events[index],
          notGoing:
            nextProps.events.events[index].notGoing.findIndex(
              i => i.userId === this.props.user.id
            ) !== -1,
          going:
            nextProps.events.events[index].going.findIndex(
              i => i.userId === this.props.user.id
            ) !== -1,
          newFetch: false
        });
      }
    }
  }

  componentDidMount() {
    const index = this.props.events.events.findIndex(
      i => i._id === this.props.eventId
    );
    if (index !== -1) {
      this.setState({
        event: this.props.events.events[index],
        notGoing:
          this.props.events.events[index].notGoing.findIndex(
            i => i.userId === this.props.user.id
          ) !== -1,
        going:
          this.props.events.events[index].going.findIndex(
            i => i.userId === this.props.user.id
          ) !== -1
      });
    } else {
      this.setState({
        newFetch: true
      });
      this.props.getEvent(this.props.user.token, this.props.eventId);
    }
  }

  getOrdinalNum(n) {
    return (
      n +
      (n > 0
        ? ["th", "st", "nd", "rd"][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10]
        : "")
    );
  }

  handleStatusChange(going) {
    var currentStatus = this.state.event.going.findIndex(
      i => i.userId === this.props.user.id
    ) !== -1
      ? 1
      : -1;
    if (currentStatus !== 1) {
      currentStatus = this.state.event.notGoing.findIndex(
        i => i.userId === this.props.user.id
      ) !== -1
        ? 0
        : -1;
    }

    if ((going && this.state.going) || (!going && this.state.notGoing)) {
      this.props.removeFromEventList(
        this.props.user.token,
        this.props.eventId,
        this.props.user.id,
        going
      );
      this.setState({
        going: false,
        notGoing: false
      });
    } else if ((!going && this.state.going) || (going && this.state.notGoing)) {
      this.props.removeFromEventList(
        this.props.user.token,
        this.props.eventId,
        this.props.user.id,
        !going
      );

      this.props.addToEventList(
        this.props.user.token,
        this.props.eventId,
        this.props.user.id,
        this.props.user.name,
        going
      );

      this.setState({
        going: going,
        notGoing: !going
      });
    } else {
      this.props.addToEventList(
        this.props.user.token,
        this.props.eventId,
        this.props.user.id,
        this.props.user.name,
        going
      );
      this.setState({
        going: going ? going : false,
        notGoing: !going ? true : false
      });
    }
  }

  render() {
    console.log(this.props.events);
    var date;
    if (this.state.event) {
      date = moment(this.state.event.date);
      console.log(date.weekday());
    }
    return (
      <Box>
        {this.state.event &&
          <View>
            <Icon
              size={20}
              style={{ marginBottom: 10 }}
              name="calendar"
              color="#212121"
            />
            <Paragraph style={{ marginBottom: 5 }}>
              {this.state.event.description}
            </Paragraph>
            <Paragraph style={{ color: "#DCDCDC" }}>
              {weekdays[date.weekday()]}, {months[date.month()]}{" "}
              {this.getOrdinalNum(date.date())}
            </Paragraph>
            <Paragraph style={{ color: "#DCDCDC" }}>
              {this.state.event.time}
            </Paragraph>
            <EventGoing
              data={"I'm Going"}
              join
              pressed={this.state.going}
              press={() => this.handleStatusChange(true)}
            />
            <EventGoing
              data={"Can't Make It"}
              join={false}
              pressed={this.state.notGoing}
              press={() => this.handleStatusChange(false)}
            />
          </View>}
      </Box>
    );
  }
}

function mapStateToProps(state) {
  return {
    events: state.events,
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getEvent: (token, eventId) => dispatch(getEvent(token, eventId)),
    removeFromEventList: (token, eventId, userId, going) =>
      dispatch(removeFromEventList(token, eventId, userId, going)),
    addToEventList: (token, eventId, userId, name, going) =>
      dispatch(addToEventList(token, eventId, userId, name, going))
  };
}

const Box = styled.View`
  borderRadius: 8px;
  backgroundColor: white;
  padding: 10px;
  margin: 10px;
  marginLeft: 0px;
`;

const Header = styled.Text`
  fontFamily: Avenir-Heavy;
  color: #DCDCDC;
  fontSize: 12px;
`;

const Paragraph = styled.Text`
  color: #212121;
  fontFamily: Avenir-Heavy;
  fontSize: 14px;
`;

const Circle = styled.View`
  width: 15px;
  height: 15px;
  borderRadius: 7.5px;
  borderColor: #DCDCDC;
  borderWidth: 1.5px;
  marginRight: 10px;
  display: flex;
  alignItems: center;
  justifyContent: center;
`;

const Row = styled.View`
  display: flex;
  flexDirection: row;
  alignItems: center;
`;

export default connect(mapStateToProps, mapDispatchToProps)(Event);
