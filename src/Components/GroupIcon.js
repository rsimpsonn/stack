import React, { Component } from "react";
import { View, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import Image from "react-native-remote-svg";

const GroupIcon = props => {
  const size = props.large ? 60 : 50;
  const margin = props.large ? 10 : 0;
  return (
    <TouchableOpacity onPress={() => props.press()}>
      <IconView
        style={{
          width: size,
          height: size,
          marginBottom: margin,
          marginLeft: margin
        }}
      >
        <Icon source={{ uri: props.source }} />
      </IconView>
    </TouchableOpacity>
  );
};

const IconView = styled.View`
  display: flex;
  alignItems: center;
  justifyContent: center;
  overflow: hidden;
  width: 50px;
  height: 50px;
  borderRadius: 8px;
`;

const Icon = styled.Image`
  width: 60px;
  height: 85px;
`;

export default GroupIcon;
