import React, { Component } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";

export default class Press extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: this.props.data,
      value: this.props.value,
      color: this.props.color,
      pressedColor: this.props.pressedColor
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value,
      data: nextProps.data
    });
  }

  render() {
    return (
      <TouchableOpacity onPress={() => this.props.returnData()}>
        <Bg
          style={{
            backgroundColor: this.props.value
              ? this.props.pressedColor
              : this.props.color
          }}
        >
          <ButtonText style={{ color: "#212121" }}>
            {this.props.data}
          </ButtonText>
        </Bg>
      </TouchableOpacity>
    );
  }
}

const Bg = styled.View`
  padding: 10px;
  borderRadius: 8px;
  display: flex;
  alignItems: center;
  justifyContent: center;
  marginRight: 10px;
`;

const ButtonText = styled.Text`
  fontFamily: Avenir-Medium;
  color: white;
`;
