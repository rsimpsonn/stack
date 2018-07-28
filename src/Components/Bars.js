import React, { Component } from "react";
import {
  View,
  ScrollView,
  Text,
  Animated,
  TouchableOpacity
} from "react-native";
import styled from "styled-components/native";
import PropTypes from "prop-types";

import Emoji from "react-native-emoji";

const Bars = props => {
  var maximum = 1;
  props.entries.forEach(entry => {
    if (entry.members.length > maximum) {
      maximum = entry.members.length;
    }
  });

  return (
    <ScrollView
      horizontal
      contentContainerStyle={{
        display: "flex",
        alignItems: "flex-end",
        paddingTop: 0,
        flexGrow: 1,
        justifyContent: props.entries.length > 5 ? "flex-start" : "center"
      }}
      center={props.entries.length > 5 ? false : true}
    >
      {props.entries.map(entry =>
        <Bar
          user={props.user}
          maximum={maximum}
          key={entry.childId}
          entry={entry}
          joinSub={props.joinSub}
          chooseSub={props.chooseSub}
        />
      )}
    </ScrollView>
  );
};

const Bar = props => {
  var member =
    props.entry.members.findIndex(i => i.userId === props.user.id) !== -1;

  var calc = 250 * (props.entry.members.length / props.maximum);
  if (calc === 0) calc = 100;
  var height = new Animated.Value(calc);

  const hexToRgb = hex => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  };

  var color1;
  var color2;
  if (!member) {
    color1 = hexToRgb("#F2F2F2");
    color2 = hexToRgb(props.entry.background);
  } else {
    color1 = hexToRgb(props.entry.background);
    color2 = hexToRgb("#F2F2F2");
  }

  const color = new Animated.Value(0);
  const interpolateColor = color.interpolate({
    inputRange: [0, 150],
    outputRange: [
      `rgb(${color1.r},${color1.g},${color1.b})`,
      `rgb(${color2.r},${color2.g},${color2.b})`
    ]
  });

  const handleJoin = () => {
    if (member) {
      props.chooseSub(props.entry.childId);
    } else {
      props.joinSub(props.entry.childId);
      animate();
    }
  };

  const animate = () => {
    var addition = member ? -1 : 1;
    Animated.parallel([
      Animated.timing(height, {
        toValue:
          250 * ((props.entry.members.length + addition) / props.maximum),
        duration: 1000
      }),
      Animated.timing(color, {
        toValue: member ? 0 : 150,
        duration: 1000
      })
    ]).start();
    member = !member;
  };

  return (
    <Column>
      <TouchableOpacity onPress={() => handleJoin()}>
        <Animated.View
          style={{
            height: height,
            backgroundColor: interpolateColor,
            width: 50,
            borderRadius: 8,
            padding: 10,
            alignItems: "flex-start"
          }}
        />
        <Text style={{ fontSize: 25, position: "absolute", top: 10, left: 10 }}>
          <Emoji name={props.entry.icon} />
        </Text>
      </TouchableOpacity>
      <Paragraph>{props.entry.name}</Paragraph>
    </Column>
  );
};

const Line = styled.View`
  width: 50px;
  borderRadius: 8px;
  padding: 10px;
  alignItems: flex-start;
`;

const Paragraph = styled.Text`
  fontFamily: Avenir-Heavy;
  marginTop: 10px;
  fontSize: 12px;
  color: #212121;
  textAlign: center;
`;

const Column = styled.View`
  display: flex;
  justifyContent: center;
  alignItems: center;
  marginRight: 20px;
  padding: 0;
`;

export default Bars;
