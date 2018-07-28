import React, { Component } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  Animated,
  Keyboard,
  ActivityIndicator
} from "react-native";
import styled from "styled-components/native";
import Image from "react-native-remote-svg";

import Messenger from "../Components/Messenger";
import Message from "../Components/Message";
import LeadersPanel from "./LeadersPanel";

import Emoji from "react-native-emoji";

import { connect } from "react-redux";
import { BlurView } from "expo";
import openSocket from "socket.io-client";

const ngrokRoute = "https://1baef6f5.ngrok.io";

class GroupMessaging extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      loading: true,
      showTags: false,
      groupPicked: "",
      groupTags: [],
      pickedIndex: false,
      leaders: false
    };

    this.socket = openSocket(ngrokRoute);
    this.keyboardHeight = new Animated.Value(0);
    this.getGroup = this.getGroup.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.getTags = this.getTags.bind(this);
    this.setGroup = this.setGroup.bind(this);
  }

  async componentDidMount() {
    this.setState({
      group: await this.getGroup()
    });

    const subInfo = {
      id: this.props.groupNav.groupId,
      user: this.props.user,
      sub: false
    };

    this.socket.emit("connection");
    this.socket.emit("subInfo", subInfo);
    this.socket.on("allMessages", messages =>
      this.setState({ messages, loading: false })
    );
    this.socket.on("newMessage", message => {
      if (message.groupId === this.props.groupNav.groupId) {
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

  async getGroup() {
    const response = await fetch(
      `${ngrokRoute}/api/getgroupbyid?groupId=${this.props.groupNav.groupId}`,
      {
        headers: {
          "x-access-token": this.props.user.token
        }
      }
    );

    const data = await response.json();
    console.log(data);
    return data[0];
  }

  async setGroup() {
    this.setState({
      group: await this.getGroup()
    });
  }

  handleMessage(message) {
    console.log(message);

    this.socket.emit("newMessage", message);
    this.setState({
      messages: this.state.messages.concat({
        message: message.message,
        type: "normal",
        createdAt: new Date(),
        user: this.props.user,
        key: "userCreated"
      })
    });
  }

  getTags() {
    var tags = [];
    tags = this.state.group.tags
      .filter(
        i =>
          i.public ||
          i.members.findIndex(i => i.userId === this.props.user.id) !== -1
      )
      .map((tag, index) =>
        <TouchableOpacity
          onPress={() => {
            if (this.state.groupPicked === tag.name) {
              this.setState({ groupPicked: "", showTags: false });
            } else {
              this.setState({
                groupPicked: tag.name,
                pickedIndex: index,
                showTags: false,
                leaders: false
              });
            }
          }}
          key={tag.name}
        >
          <Row>
            <Text style={{ fontSize: 14, marginRight: 5 }}>
              {tag.symbol}
            </Text>
            <Paragraph
              style={{
                fontFamily: "Avenir-Medium",
                marginRight: 10,
                fontSize: 14,
                color: tag.color
              }}
            >
              {tag.name}
            </Paragraph>
          </Row>
        </TouchableOpacity>
      );
    if (
      this.state.group.leaders.findIndex(
        i => i.userId === this.props.user.id
      ) !== -1
    ) {
      console.log("leaders");
      tags.push(
        <TouchableOpacity
          onPress={() => {
            if (this.state.groupPicked === "Leaders") {
              this.setState({
                groupPicked: "",
                showTags: false,
                leaders: false
              });
            } else {
              this.setState({
                groupPicked: "Leaders",
                leaders: true,
                showTags: false
              });
            }
          }}
          key={"Leaders"}
        >
          <Row>
            <Text style={{ fontSize: 14, marginRight: 5 }}>
              <Emoji name="crown" />
            </Text>
            <Paragraph
              style={{
                fontFamily: "Avenir-Medium",
                marginRight: 10,
                fontSize: 14,
                color: "#FD8514"
              }}
            >
              Leaders
            </Paragraph>
          </Row>
        </TouchableOpacity>
      );
    }
    return tags;
  }

  render() {
    var tags = [];

    if (this.state.showTags && this.state.group) {
      tags = this.getTags();
    }
    var messages;
    if (this.state.groupPicked === "") {
      messages = this.state.messages.filter(message => !message.tag);
    } else {
      messages = this.state.messages.filter(
        message => message.tag === this.state.groupPicked
      );
    }
    return (
      <Container
        style={{
          backgroundColor: "white",
          flex: 1,
          display: "flex",
          paddingTop: 10
        }}
      >
        {this.state.group &&
          <View>
            <BlurView style={{ marginTop: 20 }}>
              <Row>
                <Box
                  style={{
                    marginRight: 15,
                    backgroundColor: this.state.group.background
                  }}
                >
                  <Text style={{ fontSize: 15 }}>
                    {this.state.group.symbol}
                  </Text>
                </Box>
                <Paragraph>
                  {this.state.group.name}
                </Paragraph>
                <TouchableOpacity
                  style={{ position: "absolute", top: 5, right: 5 }}
                  onPress={() =>
                    this.setState({ showTags: !this.state.showTags })}
                >
                  {this.state.groupPicked.length > 0
                    ? <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center"
                        }}
                      >
                        <Text
                          style={{ fontSize: 14, margin: 0, marginRight: 5 }}
                        >
                          {!this.state.leaders
                            ? this.state.group.tags[this.state.pickedIndex]
                                .symbol
                            : "👑"}
                        </Text>
                        <Paragraph
                          style={{
                            fontFamily: "Avenir-Medium",
                            fontSize: 14,
                            color: !this.state.leaders
                              ? this.state.group.tags[this.state.pickedIndex]
                                  .color
                              : "#FD8514",
                            margin: 0
                          }}
                        >
                          {this.state.groupPicked}
                        </Paragraph>
                      </View>
                    : <Paragraph
                        style={{
                          fontSize: 14,
                          fontFamily: "Avenir-Medium",
                          color: "#DCDCDC"
                        }}
                      >
                        Groups
                      </Paragraph>}

                </TouchableOpacity>
              </Row>
            </BlurView>
            {this.state.showTags &&
              <ScrollView horizontal>
                {tags}
              </ScrollView>}
          </View>}
        <ScrollView
          ref={ref => (this.scrollView = ref)}
          onContentSizeChange={(contentWidth, contentHeight) => {
            if (!this.state.leaders) {
              this.scrollView.scrollToEnd({ animated: true });
            }
          }}
          contentContainerStyle={{ padding: 10 }}
        >
          {this.state.group &&
            this.state.leaders &&
            <LeadersPanel group={this.state.group} update={this.setGroup} />}
          {this.state.loading &&
            <ActivityIndicator
              style={{ marginTop: 200 }}
              size="small"
              color="#000000"
            />}
          {this.state.group &&
            messages.map(message =>
              <Message
                key={message._id}
                message={message.message}
                background={this.state.group.messages}
                user={message.user.id === this.props.user.id}
                createdAt={message.createdAt}
                name={message.user.name}
                type={message.type}
                typeId={message.typeId}
                tag={message.tag}
                groupTags={this.state.group.tags}
              />
            )}
        </ScrollView>
        <Animated.View style={{ marginBottom: this.keyboardHeight }}>
          {this.state.group &&
            !this.state.leaders &&
            <Messenger
              groupTags={this.state.group.tags}
              handleMessage={this.handleMessage}
              groupPicked={
                this.state.groupPicked.length > 0
                  ? this.state.group.tags.findIndex(
                      i => i.name === this.state.groupPicked
                    ) + 1
                  : false
              }
            />}
        </Animated.View>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    groupNav: state.groupNav,
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

export default connect(mapStateToProps)(GroupMessaging);
