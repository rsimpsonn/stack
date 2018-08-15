import React, { Component } from "react";
import {
  View,
  TouchableOpacity,
  Button,
  Animated,
  Text,
  TextInput,
  ScrollView
} from "react-native";
import styled from "styled-components/native";
import Image from "react-native-remote-svg";
import { Haptic, ImagePicker, Permissions } from "expo";
import Emoji from "react-native-emoji";
import Swiper from "react-native-swiper";
import { connect } from "react-redux";
import Icon from "react-native-vector-icons/Feather";

import TodoFormatter from "./TodoFormatter";
import EventFormatter from "./EventFormatter";
import VoteFormatter from "./VoteFormatter";

const endpoint = "https://stormy-lowlands-99865.herokuapp.com";

class Messenger extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      formatterOpened: false,
      placeholder: "Message",
      tagsOpened: false,
      appear: false,
      typePicked: false,
      index: 0,
      images: []
    };

    this.formatterHeight = new Animated.Value(0);

    this.animateFormatter = this.animateFormatter.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.getImage = this.getImage.bind(this);
    this.getLinks = this.getLinks.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      pickedTag: nextProps.groupPicked
    });
  }

  animateFormatter() {
    this.setState({
      formatterOpened: !this.state.formatterOpened,
      placeholer: "Todo",
      appear: false
    });
    Animated.timing(this.formatterHeight, {
      duration: 500,
      toValue: this.state.formatterOpened ? 0 : 400
    }).start();
    setTimeout(() => this.setState({ appear: !this.state.appear }), 400);
  }

  async getImage() {
    Permissions.askAsync(Permissions.CAMERA_ROLL);

    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      mediaTypes: "Images",
      compression: 0.5
    });

    this.setState({
      images: this.state.images.concat({
        uri: result.uri,
        type: "image/jpeg",
        name: "image.jpg"
      })
    });
  }

  async handleMessage() {
    if (this.props.sub) {
      this.props.handleMessage(this.state.message);
      return;
    }
    var messageData = {};

    if (this.state.formatterOpened) {
      var typePicked = ["event", "todo", "vote"][this.state.index];
      switch (typePicked) {
        case "todo":
          messageData.message = this.state.message;
          messageData.description = this.state.description;
          messageData.todos = this.state.todos;
          messageData.type = "todo";
          break;
        case "event":
          messageData.message = this.state.message;
          messageData.description = this.state.description;
          messageData.option = this.state.option;
          messageData.time = this.state.time;
          messageData.date = this.state.date;
          messageData.type = "event";
          break;
        case "vote":
          messageData.message = this.state.message;
          messageData.description = this.state.description;
          messageData.options = this.state.voteOptions.filter(
            i => i.length > 0
          );
          messageData.type = "vote";
          break;
      }
    } else {
      messageData.type = "normal";
      messageData.message = this.state.message;
    }

    if (this.props.groupPicked !== false) {
      messageData.tag = this.props.groupTags[this.props.groupPicked].name;
    }

    const links = await this.getLinks();

    if (links) {
      messageData.attachments = links;
    } else {
      messageData.attachments = [];
    }

    this.props.handleMessage(messageData);
  }

  async getLinks() {
    if (this.state.images.length > 0) {
      var data = new FormData();
      this.state.images.forEach(image => data.append("attachment", image));
      console.log(data);
      const res = await fetch(`${endpoint}/api/messageattachments`, {
        method: "POST",
        headers: {
          "x-access-token": this.props.user.token,
          "Content-type": "multipart/form-data",
          Accept: "application/json"
        },
        body: data
      });
      const links = await res.json();

      return links;
    }
    return false;
  }

  render() {
    console.log(this.state.todos);
    return (
      <Row>
        <Bubble
          onChangeText={text => this.setState({ message: text })}
          value={this.state.message}
          placeholder={this.state.placeholder}
          multiline
        />
        <Animated.View
          style={{ height: this.formatterHeight, overflow: "hidden" }}
        >
          <Swiper
            showsPagination={false}
            index={this.state.index}
            onIndexChanged={index => this.setState({ index })}
            loop={false}
          >
            <EventFormatter
              handleChange={(key, value) => this.setState({ [key]: value })}
            />
            <TodoFormatter
              handleChange={(key, value) => this.setState({ [key]: value })}
            />
            <VoteFormatter
              handleChange={(key, value) => this.setState({ [key]: value })}
            />
          </Swiper>
        </Animated.View>
        <ScrollView horizontal>
          {this.state.images.map((image, i) =>
            <TouchableOpacity
              onPress={() => {
                const copy = this.state.images;
                copy.splice(i, 1);
                this.setState({
                  images: copy
                });
              }}
            >
              <Image
                style={{
                  borderRadius: 4,
                  height: 80,
                  width: 80,
                  margin: 5,
                  marginBottom: 0
                }}
                source={{
                  uri: image.uri
                }}
              />
            </TouchableOpacity>
          )}
        </ScrollView>
        <Layout style={{ justifyContent: "flex-start" }}>
          {this.props.leader &&
            <TouchableOpacity onPress={() => this.animateFormatter()}>
              <Image
                style={{ width: 30, height: 25 }}
                source={{
                  uri: this.state.formatterOpened
                    ? "https://cdn.rawgit.com/rsimpsonn/6c7f9335e558ce48403b150377e2d29e/raw/d26a9b8d4eab9096f6e5fefd557e309f8b5ae71c/opened-package.svg"
                    : "https://cdn.rawgit.com/rsimpsonn/7b2728fff2fd91bc5c3cb634d6ead4e7/raw/103a09cdeede97096fd2067680019ca1c1d54942/closed-package.svg"
                }}
              />
            </TouchableOpacity>}
          <TouchableOpacity
            style={{ marginLeft: 5 }}
            onPress={() => this.getImage()}
          >
            <Icon color="#212121" name="image" size={25} />
          </TouchableOpacity>
          <Column
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: "white",
              borderRadius: 30,
              padding: 5,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end"
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                display: "flex"
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  console.log("press");
                  this.handleMessage();
                  this.setState({
                    message: ""
                  });
                }}
              >
                <Image
                  style={{ width: 25, height: 25 }}
                  source={{
                    uri:
                      "https://cdn.rawgit.com/rsimpsonn/41675623998a1a7eb471f1f60eaba691/raw/f8d2f0f7506b6fbb2ca3fb1bffc823aba20a0779/send-icon.svg"
                  }}
                />
              </TouchableOpacity>
            </View>
          </Column>
        </Layout>
      </Row>
    );
  }
}

function mapStateToProps(state) {
  return {
    groupNav: state.groupNav,
    user: state.user
  };
}
const Bubble = styled.TextInput`
  borderRadius: 4px;
  fontFamily: Avenir-Medium;
  fontSize: 14px;
  color: #212121;
  width: 80%;
  backgroundColor: white;
`;

const Row = styled.View`
  display: flex;
  flexDirection: column;
  borderTopWidth: 1px;
  borderTopColor: #F2F2F2;
  padding: 10px;
`;

const Layout = styled.View`
display: flex;
alignItems: center;
flexDirection: row;
justifyContent: flex-end;
marginTop: 20px;
`;

const Column = styled.View`
  display: flex;
  flexDirection: column;
`;

export default connect(mapStateToProps)(Messenger);
