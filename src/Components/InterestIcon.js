import React, { Component } from "react";
import { View, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import Image from "react-native-remote-svg";

const InterestIcon = props => {
  return (
    <TouchableOpacity onPress={() => props.press()}>
      <Box
        style={{
          backgroundColor: "#212121"
        }}
        isMember={props.interest.members.indexOf(props.id) !== -1}
      >
        <Image
          style={{ width: 30, height: 30 }}
          source={{ uri: props.interest.icon }}
        />
      </Box>
    </TouchableOpacity>
  );
};

const Box = styled.View`
  width: 60px;
  height: 60px;
  backgroundColor: ${props => (props.isMember ? `#212121` : `#F2F2F2`)};
  display: flex;
  justifyContent: center;
  alignItems: center;
  borderRadius: 8px;
  marginBottom: 10px;
  marginLeft: 10px;
`;

export default InterestIcon;
