import React, { Component } from "react";
import { View, TouchableOpacity, Text, Image, Modal } from "react-native";
import styled from "styled-components/native";
import Todo from "./Todo";
import Event from "./Event";
import Vote from "./Vote";
import Emoji from "react-native-emoji";
import { AppLoading, BlurView, Asset } from "expo";
import Icon from "react-native-vector-icons/Feather";

const endpoint = "https://stormy-lowlands-99865.herokuapp.com";

class Message extends Component {
  constructor(props) {
    super(props);

    this.state = {
      enlargedImage: false,
      attachment: "",
      isReady: false
    };

    this.cacheImages = this.cacheImages.bind(this);
    this.loadAssetsAsync = this.loadAssetsAsync.bind(this);
  }

  cacheImages() {
    if (this.props.attachments) {
      return this.props.attachments.map(attachment => {
        Image.prefetch(
          attachment.substring(0, 1) === "/"
            ? `${endpoint}${attachment}`
            : attachment
        );
      });
    }

    return [];
  }

  async loadAssetsAsync() {
    const imageAssets = this.cacheImages();

    await Promise.all([...imageAssets, ...fontAssets]);
  }

  render() {
    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this.loadAssetsAsync}
          onFinish={() => this.setState({ isReady: true })}
          onError={console.warn}
        />
      );
    }
    const date = new Date(this.props.createdAt);

    const parseMinutes = minutes => {
      if (minutes / 10 < 1) {
        return "0" + minutes;
      }
      return minutes;
    };

    var symbol;

    if (this.props.tag) {
      const index = this.props.groupTags.findIndex(
        i => i.name === this.props.tag
      );
      symbol = this.props.groupTags[index].symbol;
    }
    return (
      <View
        style={{
          display: "flex",
          width: "100%",
          alignItems: this.props.user ? "flex-end" : "flex-start"
        }}
      >
        <Modal
          visible={this.state.enlargedImage}
          animationType="fade"
          transparent={true}
        >
          <BlurView
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
            intensity={80}
            tint="dark"
          >
            <TouchableOpacity
              style={{ position: "absolute", top: 30, right: 10 }}
              onPress={() => {
                this.setState({ enlargedImage: false });
              }}
            >
              <Icon name="x-circle" color="white" size={20} />
            </TouchableOpacity>
            <View>
              <Image
                style={{ width: 300, height: 400, borderRadius: 8 }}
                source={{
                  uri: this.state.attachment.substring(0, 1) === "/"
                    ? `${endpoint}${this.state.attachment}`
                    : this.state.attachment
                }}
              />
            </View>
          </BlurView>
        </Modal>
        {!this.props.user &&
          <DateText
            style={{
              color: "#212121",
              fontFamily: "Avenir-Medium",
              opacity: 0.6,
              marginBottom: 5
            }}
          >
            {this.props.name}
          </DateText>}
        <Bubble user={this.props.user} background={this.props.background}>
          <MessageText user={this.props.user}>
            {this.props.message}
          </MessageText>
          {this.props.type === "todo" && <Todo todoId={this.props.typeId} />}
          {this.props.type === "event" && <Event eventId={this.props.typeId} />}
          {this.props.type === "vote" && <Vote voteId={this.props.typeId} />}
          <View>
            {this.props.attachments &&
              this.props.attachments.map(attachment =>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({ enlargedImage: true, attachment })}
                >
                  <Image
                    style={{
                      borderRadius: 4,
                      height: 100,
                      width: "auto",
                      margin: 5,
                      marginBottom: 0
                    }}
                    source={{
                      uri: attachment.substring(0, 1) === "/"
                        ? `${endpoint}${attachment}`
                        : attachment
                    }}
                  />
                </TouchableOpacity>
              )}
          </View>
          <DateText user={this.props.user}>
            {(date.getHours() % 12 === 0 ? 12 : date.getHours() % 12) +
              ":" +
              parseMinutes(date.getMinutes())}
          </DateText>
        </Bubble>
      </View>
    );
  }
}

const Bubble = styled.View`
  maxWidth: 300px;
  minWidth: 100px;
  shadowRadius: 10px;
  borderRadius: 10px;
  shadowOffset: 0 4px;
  marginBottom: 12px;
${props => `
  shadowOpacity: ${props.user ? 0 : 1};
  shadowColor: ${props.user ? props.background : "#F2F2F2"};
  borderTopLeftRadius: ${props.user ? 10 : 0}px;
  borderTopRightRadius: ${props.user ? 0 : 10}px;
  padding: 15px;
  backgroundColor: ${props.user ? props.background : "white"};
  `}
`;

const MessageText = styled.Text`
  fontFamily: Avenir-Heavy;
  letterSpacing: 0.5px;
  ${props => `
  color: ${props.user ? "white" : "#212121"};
  `}
`;

const DateText = styled.Text`
  opacity: 0.75;
  fontFamily: Avenir-Heavy;
  fontSize: 12px;
  marginTop: 8px;

  ${props => `
    color: ${props.user ? "white" : "#212121"};
    opacity: ${props.user ? 0.75 : 0.4};

    `}
`;

const Circle = styled.View`
  width: 7px;
  height: 7px;
  borderRadius: 3.5px;
`;

export default Message;
