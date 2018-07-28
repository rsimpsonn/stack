import React, { Component } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import styled from "styled-components/native";

export default class EventGoing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pressed: false,
      join: this.props.join
    };
  }

  render() {
    const colors = ["#F2F2F2", "#ADADAD"];
    const pressedColors = this.props.join
      ? ["#D7FFC0", "#57D287"]
      : ["#FFB6B6", "#DB4D4D"];
    return (
      <TouchableOpacity onPress={() => this.props.press()}>
        <Bubble
          style={{
            backgroundColor: this.props.pressed ? pressedColors[0] : colors[0]
          }}
        >
          <BubbleText
            style={{ color: this.props.pressed ? pressedColors[1] : colors[1] }}
          >
            {this.props.data.toUpperCase()}
          </BubbleText>
        </Bubble>
      </TouchableOpacity>
    );
  }
}

const Bubble = styled.View`
  borderRadius: 4px;
  padding: 10px;
  marginTop: 5px;
  marginBottom: 5px;
  display: flex;
  justifyContent: center;
  alignItems: center;
`;

const BubbleText = styled.Text`
  fontFamily: Avenir-Heavy;
  fontSize: 12px;
  letterSpacing: 1px
`;
