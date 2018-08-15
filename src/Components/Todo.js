import React, { Component } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { connect } from "react-redux";
import Image from "react-native-remote-svg";
import Icon from "react-native-vector-icons/Feather";

import { getTodo } from "../../actions";

import TodoRow from "./TodoRow";

class Todo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newFetch: false,
      completedIndices: []
    };

    this.completeTodo = this.completeTodo.bind(this);
    this.userFinished = this.userFinished.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    console.log(
      nextProps.todos.todos[
        nextProps.todos.todos.findIndex(i => i._id === this.props.todoId)
      ]
    );
    if (this.state.newFetch && !nextProps.todos.isFetching) {
      this.setState({
        todo:
          nextProps.todos.todos[
            nextProps.todos.todos.findIndex(i => i._id === this.props.todoId)
          ],
        newFetch: false
      });
    }
  }

  componentDidMount() {
    const index = this.props.todos.todos.findIndex(
      i => i._id === this.props.todoId
    );
    if (index !== -1) {
      this.setState({
        todo: this.props.todos.todos[index]
      });
    } else {
      this.setState({
        newFetch: true
      });
      this.props.getTodo(this.props.user.token, this.props.todoId);
    }
  }

  completeTodo(index) {
    var copy = this.state.completedIndices;
    copy[copy.length] = index;
    this.setState({
      completedIndices: copy
    });
  }

  userFinished() {
    var finished = true;
    this.state.todo.todos.forEach(todo => {
      if (
        todo.completedBy.findIndex(i => i.userId === this.props.user.id) ===
          -1 &&
        (todo.completedBy.length === 0 && todo.individual === 1)
      ) {
        finished = false;
      }
    });

    return finished;
  }

  render() {
    var finished;
    if (this.state.todo) {
      finished = this.userFinished();
    }
    return (
      <Box>
        {this.state.todo &&
          <View>
            <Icon
              size={20}
              style={{ marginBottom: 10 }}
              name="watch"
              color="#212121"
            />
            <Paragraph>{this.state.todo.description}</Paragraph>
            {this.state.todo.todos.map((todo, index) =>
              <TodoRow
                todoId={this.props.todoId}
                index={index}
                todo={todo}
                key={index}
                pressed={
                  todo.completedBy.length > 0 &&
                  (todo.individual === 1 ||
                    todo.completedBy.findIndex(
                      i => i.userId === this.props.user.id
                    ) !== -1)
                }
              />
            )}
          </View>}
      </Box>
    );
  }
}

function mapStateToProps(state) {
  return {
    todos: state.todos,
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getTodo: (token, todoId) => dispatch(getTodo(token, todoId))
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
  borderColor: #212121;
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

export default connect(mapStateToProps, mapDispatchToProps)(Todo);
