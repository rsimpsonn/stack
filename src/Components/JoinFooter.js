import React, { Component } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import styled from "styled-components/native";

import GroupIcon from "./GroupIcon";

const JoinFooter = props => {
  var joined = false;

  return (
    <Row>
      <GroupIcon source={props.group.cover} />
      <TouchableOpacity
        onPress={() => {
          joined = true;
          props.handleJoin(props.group.groupId);
        }}
        style={{ position: "absolute", right: 10, bottom: 5 }}
      >
        <Join style={{ backgroundColor: joined ? "#67DC89" : "#F2F2F2" }}>
          <JoinText>Join {props.group.name}</JoinText>
        </Join>
      </TouchableOpacity>
    </Row>
  );
};

const Row = styled.View`
  display: flex;
  justifyContent: center;
  borderTopWidth: 1px;
  borderTopColor: #F2F2F2;
  width: 100%;
  paddingTop: 10px;
  paddingLeft: 10px;
  position: absolute;
  bottom: 10;
  left: 10;
`;

const Join = styled.View`
  backgroundColor: #F2F2F2;
  borderRadius: 4px;
  padding: 10px;
`;

const JoinText = styled.Text`
  fontSize: 14px;
  fontFamily: Avenir-Heavy;
  color: #212121;
  letterSpacing: 0.5px;
`;

export default JoinFooter;
