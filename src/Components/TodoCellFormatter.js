import React, { Component } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import Icon from "react-native-vector-icons/Feather";

export default class TodoCellFormatter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentTodo: this.props.currentTodo.todo,
      index: 0,
      i: this.props.i
    };

    this.statuses = ["#9C9AFF", "#88BC67"];

    this.toObject = this.toObject.bind(this);
  }

  toObject(n) {
    return {
      todo: this.state.currentTodo,
      individual: this.state.index + n,
      completedBy: []
    };
  }

  render() {
    return (
      <Row>
        <TouchableOpacity
          onPress={() => {
            this.setState({
              index: this.state.index + 1 === this.statuses.length
                ? 0
                : this.state.index + 1
            });
            this.props.update(this.state.i, this.toObject(1));
          }}
        >
          <StatusBox
            style={{ backgroundColor: this.statuses[this.state.index] }}
          >
            <Icon
              name={`${this.state.index === 0 ? "users" : "user"}`}
              size={18}
              color={"white"}
            />
          </StatusBox>
        </TouchableOpacity>
        <TextInput
          onChangeText={currentTodo => {
            this.setState({ currentTodo });
          }}
          style={{
            marginLeft: 10,
            fontSize: 12,
            color: "#212121",
            fontFamily: "Avenir-Heavy",
            letterSpacing: 0.5
          }}
          value={this.state.currentTodo}
          placeholder="New todo"
          autoCorrect={false}
          blurOnSubmit={false}
          onSubmitEditing={() => {
            this.props.update(this.state.i, this.toObject());
          }}
        />
      </Row>
    );
  }
}

const Row = styled.View`
  display: flex;
  flexDirection: row;
  alignItems: center;
  marginBottom: 10px;
`;
const StatusBox = styled.View`
  width: 30px;
  height: 30px;
  borderRadius: 4px;
  backgroundColor: #F2F2F2;
  display: flex;
  justifyContent: center;
  alignItems: center;
`;
