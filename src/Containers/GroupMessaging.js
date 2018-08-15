import React, { Component } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  Animated,
  Keyboard,
  ActivityIndicator,
  Modal,
  Image
} from "react-native";
import styled from "styled-components/native";
import Icon from "react-native-vector-icons/Feather";
import InvertibleScrollView from "react-native-invertible-scroll-view";

import Messenger from "../Components/Messenger";
import Message from "../Components/Message";
import LeadersPanel from "./LeadersPanel";

import Emoji from "react-native-emoji";

import { connect } from "react-redux";
import { BlurView } from "expo";
import openSocket from "socket.io-client";

const endpoint = "https://stormy-lowlands-99865.herokuapp.com";

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
      leaders: false,
      attachment: "",
      enlargedImage: false,
      dataIndex: 1,
      newMessagesLoading: false,
      firstTime: true
    };

    this.socket = openSocket(endpoint);
    this.keyboardHeight = new Animated.Value(0);
    this.getGroup = this.getGroup.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.getTags = this.getTags.bind(this);
    this.setGroup = this.setGroup.bind(this);
    this.enlargeImage = this.enlargeImage.bind(this);
    this.loadNextData = this.loadNextData.bind(this);
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
    }).start();
  };

  keyboardWillHide = event => {
    Animated.timing(this.keyboardHeight, {
      duration: event.duration,
      toValue: 0
    }).start();
  };

  isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
    return (
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20
    );
  };

  async getGroup() {
    const response = await fetch(
      `${endpoint}/api/getgroupbyid?groupId=${this.props.groupNav.groupId}`,
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

  async loadNextData() {
    let results = await fetch(`${endpoint}/api/retrievemessages`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
        "x-access-token": this.props.user.token
      },
      body: JSON.stringify({
        groupId: this.state.group.groupId,
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

  inGroup() {
    var inOne = false;
    if (
      this.state.group.leaders.filter(i => i.userId === this.props.user.id)
        .length > 0
    ) {
      return true;
    }
    this.state.group.tags.forEach(tag => {
      if (!tag.private) {
        inOne = true;
      }
      tag.members.forEach(user => {
        if (this.props.user.id === user.userId) {
          inOne = true;
        }
      });
    });
    return inOne;
  }

  enlargeImage(attachment) {
    this.setState({
      attachment,
      enlargedImage: true
    });
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

    console.log(messages.length);
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
              <Row style={{ paddingRight: 10 }}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate("HomePage")}
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
                  {this.inGroup() &&
                    <View>
                      {this.state.groupPicked.length > 0
                        ? <View
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center"
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 14,
                                margin: 0,
                                marginRight: 5
                              }}
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
                                  ? this.state.group.tags[
                                      this.state.pickedIndex
                                    ].color
                                  : "#FD8514",
                                margin: 0,
                                marginRight: 10
                              }}
                            >
                              {this.state.groupPicked}
                            </Paragraph>
                          </View>
                        : <Paragraph
                            style={{
                              fontSize: 14,
                              fontFamily: "Avenir-Medium",
                              color: "#DCDCDC",
                              marginRight: 10
                            }}
                          >
                            Groups
                          </Paragraph>}
                    </View>}

                </TouchableOpacity>
              </Row>
            </BlurView>
            {this.state.showTags &&
              <ScrollView
                contentContainerStyle={{ paddingLeft: 5, paddingBottom: 2 }}
                horizontal
              >
                {tags}
              </ScrollView>}
          </View>}
        {this.state.loading &&
          <ActivityIndicator
            style={{ marginTop: 200 }}
            size="small"
            color="#000000"
          />}
        {this.state.group &&
          this.state.leaders &&
          <LeadersPanel group={this.state.group} update={this.setGroup} />}
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
          {this.state.group &&
            messages
              .map(message =>
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
                  attachments={message.attachments}
                  enlargeImage={this.enlargeImage}
                />
              )
              .reverse()}
          {!this.state.loading &&
            messages.length > 0 &&
            !this.state.noMoreMessages &&
            <ActivityIndicator
              style={{ margin: 20 }}
              size="small"
              color="#000000"
            />}
        </InvertibleScrollView>
        <Animated.View style={{ marginBottom: this.keyboardHeight }}>
          {this.state.group &&
            !this.state.leaders &&
            <Messenger
              groupTags={this.state.group.tags}
              handleMessage={this.handleMessage}
              groupPicked={
                this.state.groupPicked.length > 0
                  ? this.state.pickedIndex
                  : false
              }
              leader={
                this.state.group.leaders.filter(
                  i => i.userId === this.props.user.id
                ).length > 0
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
  paddingLeft: 5px;
  paddingBottom: 10px;
`;

const Paragraph = styled.Text`
  fontFamily: Avenir-Heavy;
  color: #212121;
  fontSize: 16px;
`;

const Column = styled.View`
  flexDirection: column;
  display: flex;
  justifyContent: center;
  alignItems: center;
  margin: 10px;
  `;

export default connect(mapStateToProps)(GroupMessaging);
