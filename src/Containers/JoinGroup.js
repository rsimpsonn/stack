import React, { Component } from "react";
import { View, TouchableOpacity, ScrollView, Text } from "react-native";
import styled from "styled-components/native";
import Image from "react-native-remote-svg";

import JoinFooter from "../Components/JoinFooter";

import { connect } from "react-redux";

import { joinGroup } from "../../actions";

const ngrokRoute = "https://1baef6f5.ngrok.io";

class JoinGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.getGroup = this.getGroup.bind(this);
    this.joinGroup = this.joinGroup.bind(this);
  }

  async componentDidMount() {
    this.setState({
      group: await this.getGroup()
    });
  }

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
    return data[0];
  }

  joinGroup(groupId) {
    console.log("pressed");
    this.props.joinGroup(this.props.user.token, this.props.user.id, groupId);
  }

  render() {
    console.log(this.state.group);
    return (
      <Container>
        <ScrollView>
          {this.state.group &&
            <Container>
              <Cover
                source={{
                  uri: this.state.group.cover.substring(0, 1) === "/"
                    ? ngrokRoute + this.state.group.cover
                    : this.state.group.cover
                }}
              />
              <MainText>{this.state.group.name}</MainText>
              <Paragraph>{this.state.group.description}</Paragraph>
            </Container>}
        </ScrollView>
        {this.state.group &&
          <JoinFooter group={this.state.group} handleJoin={this.joinGroup} />}
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

function mapDispatchToProps(dispatch) {
  return {
    joinGroup: (token, userId, groupId) =>
      dispatch(joinGroup(token, userId, groupId))
  };
}

const Container = styled.View`
  flex: 1;
  display: flex;
  backgroundColor: white;
  padding: 10px;
  alignItems: center;
`;

const Cover = styled.Image`
  marginTop: 100px
  width: 220px;
  height: 300px;
  borderRadius: 8px;
  shadowColor: #F2F2F2;
  shadowRadius: 10px;
  shadowOpacity: 1;
`;

const MainText = styled.Text`
  fontFamily: Avenir-Heavy;
  letterSpacing: 0.9px;
  fontSize: 30px;
  color: #212121;
  marginTop: 24px;
  marginBottom: 10px;
`;

const Paragraph = styled.Text`
  color: #DCDCDC;
  textAlign: center;
  letterSpacing: 0.5px;
  fontSize: 16px;
  fontFamily: Avenir-Heavy;
`;
export default connect(mapStateToProps, mapDispatchToProps)(JoinGroup);
