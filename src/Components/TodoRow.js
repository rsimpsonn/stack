import React, { Component } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { connect } from "react-redux";
import Icon from "react-native-vector-icons/Feather";

import { completeTodo } from "../../actions";

class TodoRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pressed: this.props.pressed,
      todo: this.props.todo
    };

    this.press = this.press.bind(this);
  }

  press() {
    const pressed = this.state.pressed;
    this.setState({ pressed: !pressed });
    this.props.completeTodo(
      this.props.user.token,
      this.props.todoId,
      this.props.user.id,
      this.props.index
    );
  }

  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          if (!this.props.pressed) {
            this.press();
          }
        }}
      >
        <Row>
          {this.state.pressed &&
            <Icon
              name={"check"}
              size={15}
              color={"#212121"}
              style={{
                marginRight: 10
              }}
            />}
          {!this.state.pressed &&
            <Icon
              name={"circle"}
              size={15}
              color={"#212121"}
              style={{ marginRight: 10 }}
            />}
          <Paragraph style={{ fontFamily: "Avenir-Medium" }}>
            {this.state.todo.todo}
          </Paragraph>
        </Row>
      </TouchableOpacity>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    completeTodo: (token, todoId, userId, index) =>
      dispatch(completeTodo(token, todoId, userId, index))
  };
}

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
  marginTop: 10px;
`;

export default connect(mapStateToProps, mapDispatchToProps)(TodoRow);
