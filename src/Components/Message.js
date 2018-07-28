import React, { Component } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import styled from "styled-components/native";
import Todo from "./Todo";
import Event from "./Event";
import Emoji from "react-native-emoji";

const Message = props => {
  const date = new Date(props.createdAt);

  const parseMinutes = minutes => {
    if (minutes / 10 < 1) {
      return "0" + minutes;
    }
    return minutes;
  };

  var symbol;

  if (props.tag) {
    const index = props.groupTags.findIndex(i => i.name === props.tag);
    symbol = props.groupTags[index].symbol;
  }
  return (
    <View
      style={{
        display: "flex",
        width: "100%",
        alignItems: props.user ? "flex-end" : "flex-start"
      }}
    >
      {!props.user &&
        <DateText
          style={{
            color: "#212121",
            fontFamily: "Avenir-Medium",
            opacity: 0.6,
            marginBottom: 5
          }}
        >
          {props.name}
        </DateText>}
      <Bubble user={props.user} background={props.background}>
        <MessageText user={props.user}>{props.message}</MessageText>
        {props.type === "todo" && <Todo todoId={props.typeId} />}
        {props.type === "event" && <Event eventId={props.typeId} />}
        <DateText user={props.user}>
          {date.getHours() % 12 + ":" + parseMinutes(date.getMinutes())}
        </DateText>
      </Bubble>
    </View>
  );
};

// {symbol &&
//   <Text
//     style={{
//       position: "absolute",
//       bottom: 15,
//       right: 20,
//       fontSize: 14
//     }}
//   >
//     <Emoji name={symbol} />
//   </Text>}

const Bubble = styled.View`
  maxWidth: 300px;
  minWidth: 100px;
  shadowRadius: 10px;
  borderRadius: 10px;
  shadowOffset: 0 4px;
  marginBottom: 10px;
${props => `
  shadowOpacity: ${props.user ? 0.75 : 1};
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
