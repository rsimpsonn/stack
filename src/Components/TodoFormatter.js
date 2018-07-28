import React, { Component } from "react";
import { View, Text, TextInput, Keyboard, ScrollView } from "react-native";
import styled from "styled-components/native";
import Emoji from "react-native-emoji";

import TodoCellFormatter from "./TodoCellFormatter";

export default class TodoFormatter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      description: "",
      todos: [],
      doneBy: new Date(),
      currentTodo: ""
    };

    this.refs = [];

    this.todos = this.todos.bind(this);
    this.update = this.update.bind(this);
  }

  update(index, todo) {
    var copy = this.state.todos;
    copy[index] = todo;
    this.setState({
      todos: copy
    });
  }

  todos() {
    this.props.returnTodos(this.state.todos);
  }

  render() {
    console.log(this.state.todos);
    return (
      <View>
        <Bubble
          onChangeText={text => this.setState({ message: text })}
          value={this.state.message}
          placeholder="Message"
        />
        <DescriptionInput
          onChangeText={description => {
            this.setState({ description });
          }}
          value={this.state.description}
          placeholder="Description"
        />
        <ScrollView
          ref={c => {
            this.scrollView = c;
          }}
          contentContainerStyle={{ height: 400, marginTop: 10 }}
        >
          {this.state.todos.map((todo, index) =>
            <TodoCellFormatter
              currentTodo={todo}
              key={index}
              i={index}
              update={this.update}
            />
          )}
          <Row>
            <Circle
              style={{
                backgroundColor: "#F2F2F2"
              }}
            />
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
              ref={c => {
                this.todoInput = c;
              }}
              blurOnSubmit={false}
              onSubmitEditing={() => {
                this.setState({
                  todos: this.state.todos.concat({
                    todo: this.state.currentTodo,
                    individual: 0,
                    completedBy: []
                  }),
                  currentTodo: ""
                });

                this.todoInput.focus();
              }}
            />
          </Row>
        </ScrollView>
      </View>
    );
  }
}

const DescriptionInput = styled.TextInput`
  backgroundColor: #F2F2F2;
  color: #212121;
  borderRadius: 4px;
  padding: 10px;
  fontFamily: Avenir-Medium;
  margin: 10px;
`;

const Row = styled.View`
  display: flex;
  flexDirection: row;
  alignItems: center;
  marginBottom: 10px;
`;

const Circle = styled.View`
  width: 30px;
  height: 30px;
  borderRadius: 4px;
  backgroundColor: white;
`;

const TodoInput = styled.TextInput`
  marginLeft: 10px;
  fontSize: 12px;
  color: #212121;
  fontFamily: Avenir-Heavy;
  letterSpacing: 0.5px;
`;

const TodoText = styled.Text`
fontSize: 12px;
color: #212121;
fontFamily: Avenir-Heavy;
letterSpacing: 0.5px;
marginLeft: 10px;
`;

const Bubble = styled.TextInput`
  borderRadius: 4px;
  fontFamily: Avenir-Medium;
  fontSize: 14px;
  color: #212121;
  width: 80%;
  backgroundColor: white;
`;
