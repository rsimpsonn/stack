import React, { Component } from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { connect } from "react-redux";
import Icon from "react-native-vector-icons/Feather";

import ProfilePicture from "../Components/ProfilePicture";
import InterestIcon from "../Components/InterestIcon";
import GroupIcon from "../Components/GroupIcon";

import {
  fetchInterests,
  interestChosen,
  getUserGroups,
  groupChosen,
  logout
} from "../../actions";

const ngrokRoute = "https://1baef6f5.ngrok.io";
class HomePage extends Component {
  componentDidMount() {
    this.props.getInterests(this.props.user.token, this.props.user.id);
    this.props.getUserGroups(this.props.user.token, this.props.user.id);
  }

  chooseInterest(interestId) {
    this.props.interestChosen({ interestId });
    this.props.navigation.navigate("InterestPage");
  }

  chooseGroup(groupId) {
    this.props.groupChosen({ groupId });
    this.props.navigation.navigate("GroupMessaging");
  }

  render() {
    const icons = this.props.interests.interests.map(interest =>
      <InterestIcon
        press={() => this.chooseInterest(interest.id)}
        interest={interest}
        key={interest.id}
        id={this.props.user.id}
        userId={this.props.user.id}
      />
    );
    console.log(this.props.groups);
    const groupIcons = this.props.groups.userGroups.map(group =>
      <GroupIcon
        press={() => this.chooseGroup(group.groupId)}
        key={group.groupId}
        source={
          group.cover.substring(0, 1) === "/"
            ? ngrokRoute + group.cover
            : group.cover
        }
        large
      />
    );
    return (
      <Container>
        <View>
          <ProfilePicture user={this.props.user} />
          <MainText>Your{"\n"}Stacks</MainText>
        </View>
        <RightView>
          {icons}
          {groupIcons}
        </RightView>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate("Planner")}
          style={{ marginTop: 20 }}
        >
          <Icon size={30} color="#212121" name="clock" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.props.logout();
            this.props.navigation.navigate("LoginPage");
          }}
        >
          <Icon size={30} color="#212121" name="lock" />
        </TouchableOpacity>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    interests: state.interests,
    user: state.user,
    groups: state.groups
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getInterests: (token, id) => dispatch(fetchInterests(token, id)),
    interestChosen: id => dispatch(interestChosen(id)),
    getUserGroups: (token, id) => dispatch(getUserGroups(token, id)),
    groupChosen: groupId => dispatch(groupChosen(groupId)),
    logout: () => dispatch(logout())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);

const Container = styled.View`
  display: flex;
  padding: 25px;
  backgroundColor: white;
  flex: 1;
  flexDirection: column;
`;

const MainText = styled.Text`
  fontFamily: Avenir-Medium;
  fontSize: 30px;
  color: #212121;
  marginTop: 24px;
`;

const Profile = styled.Image`
  width: 50px;
  height: 50px;
  borderRadius: 25px;
  backgroundColor: #F2F2F2;
  marginTop: 50px;
`;

const RightView = styled.View`
  display: flex;
  justifyContent: flex-end;
  alignItems: flex-end;
  paddingTop: 20px;
`;
