import React, { Component } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  Keyboard,
  Animated
} from "react-native";
import styled from "styled-components/native";
import Image from "react-native-remote-svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { connect } from "react-redux";
import openSocket from "socket.io-client";

import Emoji from "react-native-emoji";

import Messenger from "../Components/Messenger";
import Message from "../Components/Message";

const ngrokRoute = "https://1baef6f5.ngrok.io";

class SubInterestPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: []
    };

    this.socket = openSocket(ngrokRoute);

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
        this.setState({ messages: this.state.messages.concat(message) });
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

  componentWillUnmount() {
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
  }

  keyboardWillShow = event => {
    Animated.timing(this.keyboardHeight, {
      duration: event.duration / 1.2,
      toValue: event.endCoordinates.height
    }).start(() => this.scrollView.scrollToEnd({ animated: true }));
  };

  keyboardWillHide = event => {
    Animated.timing(this.keyboardHeight, {
      duration: event.duration,
      toValue: 0
    }).start();
  };

  async getSubInterests() {
    const response = await fetch(
      `${ngrokRoute}/api/getsubinterests?child=${this.props.subinterest
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
      messages: this.state.messages.concat({
        message,
        type: "normal",
        createdAt: new Date(),
        user: this.props.user,
        key: "userCreated"
      })
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
        <ScrollView
          ref={ref => (this.scrollView = ref)}
          onContentSizeChange={(contentWidth, contentHeight) => {
            this.scrollView.scrollToEnd({ animated: true });
          }}
          contentContainerStyle={{ padding: 10 }}
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
        </ScrollView>
        <Animated.View style={{ marginBottom: this.keyboardHeight }}>
          <Messenger handleMessage={this.handleMessage} />
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
  margin: 10px;
`;

const Paragraph = styled.Text`
  fontFamily: Avenir-Heavy;
  color: #212121;
  fontSize: 16px;
`;

export default connect(mapStateToProps)(SubInterestPage);
