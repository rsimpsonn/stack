import React, { Component } from "react";
import {
  View,
  TouchableOpacity,
  Button,
  Animated,
  Text,
  TextInput
} from "react-native";
import styled from "styled-components/native";
import Image from "react-native-remote-svg";
import { Haptic } from "expo";
import Emoji from "react-native-emoji";
import Swiper from "react-native-swiper";
import { connect } from "react-redux";

import TodoFormatter from "./TodoFormatter";
import EventFormatter from "./EventFormatter";

const closedPackage = require("./assets/closedpackage.svg");
const openedPackage = require("./assets/openedpackage.svg");

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
      index: false
    };

    this.formatterHeight = new Animated.Value(0);

    this.animateFormatter = this.animateFormatter.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.groupPicked) {
      this.setState({
        pickedTag: nextProps.groupPicked
      });
    }
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

  handleMessage() {
    console.log(this.eventFormatter.state);
    // var messageData = {
    //   message: this.state.message
    // };
    //
    // switch (this.state.typePicked) {
    //   case "todo":
    //     messageData.description = this.todoFormatter.state.description;
    //     messageData.todos = this.todoFormatter.state.todos;
    //     messageData.type = "todo";
    //     break;
    //   case "event":
    //     messageData.description = this.state.description;
    //     messageData.option = this.state.option;
    //     messageData.time = this.state.time;
    //     messageData.date = this.state.date;
    //     messageData.type = "event";
    //     break;
    //   default:
    //     messageData.type = "normal";
    // }
    //
    // if (this.state.pickedTag) {
    //   messageData.tag = this.props.groupTags[this.state.pickedTag - 1].name;
    // }
    //
    // console.log(messageData);
    // this.props.handleMessage(messageData);
  }

  render() {
    return (
      <Row>
        {!this.state.formatterOpened &&
          <Bubble
            onChangeText={text => this.setState({ message: text })}
            value={this.state.message}
            placeholder={this.state.placeholder}
            multiline
          />}
        <Animated.View
          style={{ height: this.formatterHeight, overflow: "hidden" }}
        >
          <Swiper showsPagination={false}>
            <EventFormatter
              progressStarted={() => {
                if (this.state.typePicked !== "event") {
                  this.setState({ typePicked: "event" });
                }
              }}
              returnMessageData={messageData =>
                this.setState({ eventData: messageData })}
              ref={c => (this.eventFormatter = c)}
            />
            <TodoFormatter
              progressStarted={() => {
                if (this.state.typePicked !== "todo") {
                  this.setState({ typePicked: "todo" });
                }
              }}
            />
          </Swiper>
        </Animated.View>
        <Layout style={{ justifyContent: "flex-start" }}>
          <TouchableOpacity onPress={() => this.animateFormatter()}>
            <Image
              style={{ width: 30, height: 25 }}
              source={
                this.state.formatterOpened ? openedPackage : closedPackage
              }
            />
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
            {this.state.tagsOpened &&
              this.props.groupTags.map((tag, index) =>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({
                      tagsOpened: false,
                      pickedTag: index + 1
                    })}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      display: "flex"
                    }}
                  >
                    <Text style={{ fontSize: 20, marginBottom: 20 }}>
                      <Emoji name={tag.symbol} />
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                display: "flex"
              }}
            >
              {this.state.pickedTag &&
                <Text style={{ fontSize: 20, marginRight: 10 }}>
                  <Emoji
                    name={this.props.groupTags[this.state.pickedTag - 1].symbol}
                  />
                </Text>}
              <TouchableOpacity
                onPress={() => {
                  console.log("press");
                  this.handleMessage();
                  this.setState({
                    message: ""
                  });
                }}
                onLongPress={() => {
                  Haptic.impact(Haptic.ImpactStyles.Medium);
                  this.setState({ tagsOpened: true });
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
