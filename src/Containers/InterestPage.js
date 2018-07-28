import React, { Component } from "react";
import { View, TouchableOpacity, ScrollView, Text } from "react-native";
import styled from "styled-components/native";
import Image from "react-native-remote-svg";

import { connect } from "react-redux";
import Icon from "react-native-vector-icons/Feather";

import {
  joinInterest,
  joinSubInterest,
  subInterestChosen,
  groupChosen,
  joinGroup
} from "../../actions";

import EventList from "../Components/EventList";
import Bars from "../Components/Bars";

const ngrokRoute = "https://1baef6f5.ngrok.io";

class InterestPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      interest: {},
      subinterests: [],
      groups: []
    };

    this.handleJoin = this.handleJoin.bind(this);
    this.getSubInterests = this.getSubInterests.bind(this);
    this.getGroups = this.getGroups.bind(this);
    this.chooseSub = this.chooseSub.bind(this);
  }

  async componentDidMount() {
    const index = this.props.interests.findIndex(
      i => i.id === this.props.interest.interestId
    );
    const subinterests = await this.getSubInterests();
    const groups = await this.getGroups();

    this.setState({
      interest: this.props.interests[index],
      subinterests: subinterests,
      groups: groups
    });
  }

  chooseSub(childId) {
    this.props.subInterestChosen({ childId });
    this.props.navigation.navigate("SubInterestPage");
  }

  handleJoin() {
    console.log("pressed");
    this.props.joinInterest(
      this.props.user.token,
      this.props.user.id,
      this.state.interest.id
    );
  }

  async getSubInterests() {
    const response = await fetch(
      `${ngrokRoute}/api/getsubinterests?parent=${this.props.interest
        .interestId}`,
      {
        headers: {
          "x-access-token": this.props.user.token,
          Accept: "application/json",
          "Content-type": "application/json"
        }
      }
    );

    const data = await response.json();
    return data;
  }

  async getGroups() {
    const response = await fetch(
      `${ngrokRoute}/api/getgroups?interestId=${this.props.interest
        .interestId}`,
      {
        headers: {
          "x-access-token": this.props.user.token
        }
      }
    );

    const data = await response.json();
    return data;
  }

  joinSub(subId) {
    this.props.joinSubInterest(
      this.props.user.token,
      this.props.user.id,
      subId
    );
  }

  render() {
    return (
      <Container>
        <ScrollView contentContainerStyle={{ padding: 10 }}>
          <Row style={{ marginTop: 20 }}>
            <Box style={{ marginRight: 15 }}>
              <Image
                style={{ width: 15, height: 15 }}
                source={{
                  uri: this.state.interest.icon
                    ? this.state.interest.icon
                    : undefined
                }}
              />
            </Box>
            <Paragraph>
              {this.state.interest.name}
            </Paragraph>
          </Row>
          <List>
            INTERESTS
          </List>
          {this.state.subinterests.length > 0 &&
            <Bars
              joinSub={subId =>
                this.props.joinSubInterest(
                  this.props.user.token,
                  this.props.user.id,
                  subId
                )}
              user={this.props.user}
              entries={this.state.subinterests}
              chooseSub={this.chooseSub}
            />}
          <List>
            GROUPS
          </List>
          <RowView>
            {this.state.groups
              .map(group =>
                <TouchableOpacity
                  onPress={() => {
                    console.log(group.groupId);
                    this.props.groupChosen({ groupId: group.groupId });
                    this.props.navigation.navigate(
                      group.members.findIndex(
                        i => i.userId === this.props.user.id
                      ) === -1
                        ? "JoinGroup"
                        : "GroupMessaging"
                    );
                  }}
                >
                  <GroupArea style={{ width: 100 }}>
                    <IconView>
                      <Picture
                        source={{
                          uri: group.cover.substring(0, 1) === "/"
                            ? `${ngrokRoute}${group.cover}`
                            : group.cover
                        }}
                      />
                    </IconView>
                    <Label>{group.name}</Label>
                  </GroupArea>
                </TouchableOpacity>
              )
              .concat(
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate("MakeGroup")}
                >
                  <GroupArea>
                    <AddNew>
                      <Icon name="heart" size={25} color="#212121" />
                      <Label>Start a New Group</Label>
                    </AddNew>
                  </GroupArea>
                </TouchableOpacity>
              )}
          </RowView>
        </ScrollView>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    interest: state.interestNav,
    interests: state.interests.interests,
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    joinInterest: (token, userId, groupId) =>
      dispatch(joinInterest(token, userId, groupId)),
    joinSubInterest: (token, userId, subId) =>
      dispatch(joinSubInterest(token, userId, subId)),
    subInterestChosen: childId => dispatch(subInterestChosen(childId)),
    groupChosen: groupId => dispatch(groupChosen(groupId)),
    joinGroup: (token, userId, groupId) =>
      dispatch(joinGroup(token, userId, groupId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InterestPage);

const Box = styled.View`
  width: 30px;
  height: 30px;
  backgroundColor: #212121;
  display: flex;
  justifyContent: center;
  alignItems: center;
  borderRadius: 4px;
`;

const Circle = styled.View`
  width: 30px;
  height: 30px;
  borderRadius: 15px;
  backgroundColor: #F2F2F2;
`;

const Container = styled.View`
  backgroundColor: white;
  flex: 1;
`;

const Row = styled.View`
  display: flex;
  alignItems: center;
  flexDirection: row;
`;

const RowView = styled.View`
  display: flex;
  justifyContent: center;
  flexDirection: row;
  flexWrap: wrap;
`;

const Paragraph = styled.Text`
  fontFamily: Avenir-Heavy;
  color: #212121;
  fontSize: 16px;
`;

const List = styled.Text`
  fontFamily: Avenir-Heavy;
  color: #DCDCDC;
  fontSize: 12px;
  margin: 30px 0 20px;
  textAlign: center;
  letterSpacing: 2px;
`;

const IconView = styled.View`
  display: flex;
  alignItems: center;
  justifyContent: center;
  overflow: hidden;
  width: 100px;
  height: 100px;
  borderRadius: 8px;
`;

const Picture = styled.Image`
  width: 100px;
  height: 140px;
  display: flex;
  borderRadius: 8px;
  backgroundColor: #F2F2F2;
`;

const GroupArea = styled.View`
  display: flex;
  justifyContent: center;
  alignItems: center;
  margin: 0 10px;
`;

const Label = styled.Text`
  fontFamily: Avenir-Heavy;
  marginTop: 10px;
  fontSize: 14px;
  color: #212121;
  textAlign: center;
`;

const AddNew = styled.View`
  width: 100px;
  height: 100px;
  borderRadius: 8px;
  borderWidth: 2px;
  borderStyle: dashed;
  borderColor: #DCDCDC;
  padding: 10px;
  display: flex;
  justifyContent: center;
  alignItems: center;
`;
