import React, { Component } from "react";
import {
  View,
  TextInput,
  Text,
  ScrollView,
  ActivityIndicator
} from "react-native";
import styled from "styled-components/native";

export default class VoteFormatter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      description: "",
      options: ["", "", "", "", "", ""]
    };

    this.getEvents = this.getEvents.bind(this);
    this.pickColor = this.pickColor.bind(this);
    this.returnMessageData = this.returnMessageData.bind(this);
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
    console.log(this.state.message);
    if (this.state.loading && this.state.pickedDayEvents) {
      this.setState({
        loading: false
      });
    } else if (this.state.loading && !this.state.pickedDayEvents) {
      this.getEvents();
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
        <Header>Vote Options</Header>
        {this.state.options.map((o, index) => {
          if (index === 0 || this.state.options[index - 1].length > 0) {
            return (
              <Row style={{ marginBottom: 15 }}>
                <Label
                  style={{
                    color: this.state.options[index].length > 0
                      ? "#212121"
                      : "#DCDCDC"
                  }}
                >
                  {index + 1}
                </Label>
                <Input
                  onChangeText={text => {
                    var copy = this.state.options;
                    copy[index] = text;
                    this.setState({
                      options: copy
                    });
                    this.props.handleChange("voteOptions", copy);
                  }}
                  value={this.state.options[index]}
                />
              </Row>
            );
          }
        })}
      </ScrollView>
    );
  }
}

const DescriptionInput = styled.TextInput`
    backgroundColor: #F2F2F2;
    color: #212121;
    borderRadius: 4px;
    padding: 10px;
    fontFamily: Avenir-Medium;
    marginTop: 10px;
    marginBottom: 10px
  `;

const Row = styled.View`
    display: flex;
    alignItems: center;
    flexDirection: row;
  `;

const Label = styled.Text`
    color: #DCDCDC;
    fontFamily: Avenir-Medium;
    letterSpacing: 0.5;
    fontSize: 12px;
    marginRight: 5px;
  `;

const Header = styled.Text`
    color: #DCDCDC;
    fontFamily: Avenir-Medium;
    letterSpacing: 0.5;
    fontSize: 14px;
    marginBottom: 10px;
    marginTop: 10px;
  `;

const Input = styled.TextInput`
    marginLeft: 10px;
    fontSize: 14px;
    color: #212121;
    fontFamily: Avenir-Heavy;
    letterSpacing: 0.5px;
    width: 80%;
  `;
