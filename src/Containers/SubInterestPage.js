import React, { Component } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  Keyboard,
  Animated,
  ActivityIndicator
} from "react-native";
import styled from "styled-components/native";
import Image from "react-native-remote-svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { connect } from "react-redux";
import openSocket from "socket.io-client";

import Icon from "react-native-vector-icons/Feather";
import Emoji from "react-native-emoji";

import Messenger from "../Components/Messenger";
import Message from "../Components/Message";

import InvertibleScrollView from "react-native-invertible-scroll-view";

const endpoint = "https://stormy-lowlands-99865.herokuapp.com";

class SubInterestPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      dataIndex: 1,
      noMoreMessages: false
    };

    this.socket = openSocket(endpoint);

    this.keyboardHeight = new Animated.Value(0);

    this.getSubInterests = this.getSubInterests.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  async componentDidMount() {
    this.setState({
      subinterest: await this.getSubInterests()
    });
    const subInfo = {
      id: this.props.subinterest.childId,
      user: this.props.user,
      sub: true
    };
    this.socket.emit("connection");
    this.socket.emit("subInfo", subInfo);
    this.socket.on("allMessages", messages => this.setState({ messages }));
    this.socket.on("newMessage", message => {
      if (message.childId === this.props.subinterest.childId) {
        this.setState({ messages: [message].concat(this.state.messages) });
      }
    });
  }

  componentWillUnmount() {
    this.socket.emit("disconnect");
  }

  componentWillMount() {
    this.keyboardWillShowSub = Keyboard.addListener(
      "keyboardWillShow",
      this.keyboardWillShow
    );
    this.keyboardWillHideSub = Keyboard.addListener(
      "keyboardWillHide",
      this.keyboardWillHide
    );
  }

  isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
    return (
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20
    );
  };

  async loadNextData() {
    let results = await fetch(`${endpoint}/api/retrievemessages`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
        "x-access-token": this.props.user.token
      },
      body: JSON.stringify({
        subId: this.props.subinterest.childId,
        dataIndex: this.state.dataIndex
      })
    });

    let messages = await results.json();

    console.log(messages);

    this.setState({
      dataIndex: this.state.dataIndex + 1,
      messages: messages.concat(this.state.messages),
      newMessagesLoading: false,
      noMoreMessages: messages.length === 0,
      loading: false
    });
  }

  componentWillUnmount() {
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
  }

  keyboardWillShow = event => {
    Animated.timing(this.keyboardHeight, {
      duration: event.duration / 1.2,
      toValue: event.endCoordinates.height
    }).start();
  };

  keyboardWillHide = event => {
    Animated.timing(this.keyboardHeight, {
      duration: event.duration,
      toValue: 0
    }).start();
  };

  async getSubInterests() {
    const response = await fetch(
      `${endpoint}/api/getsubinterests?child=${this.props.subinterest
        .childId}`,
      {
        headers: {
          "x-access-token": this.props.user.token,
          Accept: "application/json",
          "Content-type": "application/json"
        }
      }
    );

    const data = await response.json();
    console.log(data);
    return data[0];
  }

  handleMessage(message) {
    console.log(message);
    const messageData = {
      message,
      type: "normal"
    };
    this.socket.emit("newMessage", messageData);
    this.setState({
      messages: [
        {
          message,
          type: "normal",
          createdAt: new Date(),
          user: this.props.user,
          key: "userCreated"
        }
      ].concat(this.state.messages)
    });
  }

  render() {
    if (this.state.subinterest) console.log(this.state.subinterest);
    return (
      <Container
        style={{
          backgroundColor: "white",
          flex: 1,
          display: "flex",
          paddingTop: 10
        }}
      >
        {this.state.subinterest &&
          <Row style={{ marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("InterestPage")}
            >
              <Icon
                name="chevron-left"
                size={25}
                color="#212121"
                style={{ marginRight: 5 }}
              />
            </TouchableOpacity>
            <Box
              style={{
                marginRight: 15,
                backgroundColor: this.state.subinterest.background
              }}
            >
              <Text style={{ fontSize: 15 }}>
                <Emoji name={this.state.subinterest.icon} />
              </Text>
            </Box>
            <Paragraph>
              {this.state.subinterest.name}
            </Paragraph>
          </Row>}
        <InvertibleScrollView
          inverted
          contentContainerStyle={{ padding: 10 }}
          onScroll={({ nativeEvent }) => {
            if (
              this.isCloseToTop(nativeEvent) &&
              !this.state.loading &&
              !this.state.newMessagesLoading
            ) {
              this.loadNextData();
              this.setState({
                newMessagesLoading: true
              });
            }
          }}
        >
          {this.state.messages.map(message =>
            <Message
              key={message._id}
              message={message.message}
              background={this.state.subinterest.messages}
              user={message.user.id === this.props.user.id}
              createdAt={message.createdAt}
              name={message.user.name}
            />
          )}
          {!this.state.loading &&
            this.state.messages.length > 10 &&
            !this.state.noMoreMessages &&
            <ActivityIndicator
              style={{ margin: 20 }}
              size="small"
              color="#000000"
            />}
        </InvertibleScrollView>
        <Animated.View style={{ marginBottom: this.keyboardHeight }}>
          <Messenger sub handleMessage={this.handleMessage} />
        </Animated.View>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    subinterest: state.subInterestNav,
    user: state.user
  };
}

const Container = styled.View`
  backgroundColor: white;
  flex: 1;
  display: flex;
  paddingTop: 10px;
`;

const Box = styled.View`
  width: 30px;
  height: 30px;
  display: flex;
  justifyContent: center;
  alignItems: center;
  borderRadius: 4px;
`;

const Row = styled.View`
  display: flex;
  alignItems: center;
  flexDirection: row;
  paddingLeft: 5px;
  paddingBottom: 10px;
`;

const Paragraph = styled.Text`
  fontFamily: Avenir-Heavy;
  color: #212121;
  fontSize: 16px;
`;

export default connect(mapStateToProps)(SubInterestPage);
