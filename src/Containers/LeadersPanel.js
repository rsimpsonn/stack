import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator
} from "react-native";
import styled from "styled-components/native";
import { ProgressCircle } from "react-native-svg-charts";
import Icon from "react-native-vector-icons/Feather";
import moment from "moment";
import Swiper from "react-native-swiper";
import { BlurView } from "expo";

import { connect } from "react-redux";

import { getUserGroups } from "../../actions";

const ngrokRoute = "https://1baef6f5.ngrok.io";

const colors = [
  "#B22A80",
  "#CE2E2E",
  "#DD8D1C",
  "#F4B509",
  "#64C41E",
  "#38B85B",
  "#32CCAC",
  "#4145D3",
  "#3A64F2",
  "#8F3AD9",
  "#212121"
];

class LeadersPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      memberCount: 2,
      todos: [],
      events: [],
      addNewOpened: false,
      colorChoice: "#212121",
      tagOpened: false
    };

    this.getTodos = this.getTodos.bind(this);
    this.getEvents = this.getEvents.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateTag = this.updateTag.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
    this.updateMembers = this.updateMembers.bind(this);
    this.returnMembers = this.returnMembers.bind(this);
  }

  async componentDidMount() {
    this.setState({
      todos: await this.getTodos(),
      events: await this.getEvents()
    });
  }

  async getTodos() {
    console.log(this.props.group);
    const response = await fetch(
      `${ngrokRoute}/api/todosbygroupid?groupId=${this.props.group.groupId}`,
      {
        headers: {
          "x-access-token": this.props.user.token
        }
      }
    );

    const data = await response.json();
    return data;
  }

  async getEvents() {
    const response = await fetch(`${ngrokRoute}/api/geteventsbygroupid`, {
      method: "POST",
      headers: {
        "x-access-token": this.props.user.token,
        "Content-type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        groupIds: [this.props.group.groupId]
      })
    });

    const data = await response.json();
    return data;
  }

  async getUserInfo() {
    const ids = this.props.group.members.map(i => i.userId);
    const response = await fetch(`${ngrokRoute}/api/getusersbyuserids`, {
      method: "POST",
      headers: {
        "x-access-token": this.props.user.token,
        "Content-type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        userIds: ids
      })
    });
    const data = await response.json();
    this.setState({
      userInfo: data
    });
  }

  handleSubmit() {
    this.setState({
      addNewOpened: false
    });
    fetch(`${ngrokRoute}/api/addgrouptag`, {
      method: "POST",
      headers: {
        "x-access-token": this.props.user.token,
        Accept: "application/json",
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        groupId: this.props.group.groupId,
        tagColor: this.state.colorChoice,
        tagSymbol: this.state.symbol,
        tagName: this.state.name,
        userId: this.props.user.id
      })
    }).then(() => this.props.update());
  }

  updateTag(index, privacyValue) {
    fetch(`${ngrokRoute}/api/updatetag`, {
      method: "POST",
      headers: {
        "x-access-token": this.props.user.token,
        Accept: "application/json",
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        groupId: this.props.group.groupId,
        tagIndex: index,
        public: !this.state.privacyValue
      })
    }).then(() => this.props.update());
    this.setState({
      privacyValue: !this.state.privacyValue
    });
  }

  updateMembers(userId, inGroup) {
    if (inGroup) {
      this.setState({
        membersCopy: this.state.membersCopy.concat({ userId: userId })
      });
    } else {
      this.setState({
        membersCopy: this.state.membersCopy.filter(i => i.userId !== userId)
      });
    }
  }

  returnMembers() {
    console.log(this.state.membersCopy);
    if (this.state.membersCopy !== this.state.pickedTag.members) {
      fetch(`${ngrokRoute}/api/updatetagmembers`, {
        method: "POST",
        headers: {
          "x-access-token": this.props.user.token,
          Accept: "application/json",
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          groupId: this.props.group.groupId,
          tagIndex: this.state.pickedTagIndex,
          members: this.state.membersCopy
        })
      }).then(() => this.props.update());
    }
  }

  render() {
    var alphabetized;
    if (this.state.userInfo) {
      alphabetized = this.state.userInfo.sort(function(a, b) {
        var textA = a.lastName.toUpperCase();
        var textB = b.lastName.toUpperCase();

        return textA.localeCompare(textB);
      });
    }
    return (
      <View style={{ display: "flex" }}>
        <Modal
          visible={this.state.tagOpened}
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
            <Column
              style={{
                backgroundColor: "white",
                padding: 20,
                borderRadius: 8,
                width: "60%"
              }}
            >
              <TouchableOpacity
                style={{ position: "absolute", top: 10, right: 10 }}
                onPress={() => {
                  this.returnMembers();
                  this.setState({ tagOpened: false });
                }}
              >
                <Icon name="x-circle" color="#DCDCDC" size={20} />
              </TouchableOpacity>
              {this.state.pickedTag &&
                <Column>
                  <LittleText>
                    {this.state.pickedTag.symbol} {this.state.pickedTag.name}
                  </LittleText>
                  <View
                    style={{
                      marginTop: 20,
                      marginBottom: 20
                    }}
                  >
                    <Row>
                      <Icon
                        name="unlock"
                        color="#DCDCDC"
                        size={15}
                        style={{ marginRight: 10 }}
                      />
                      <Switch
                        value={!this.state.privacyValue}
                        onValueChange={() =>
                          this.updateTag(
                            this.state.pickedTagIndex,
                            !this.state.pickedTag.public
                          )}
                        onTintColor="#212121"
                      />
                      <Icon
                        name="lock"
                        color="#DCDCDC"
                        size={15}
                        style={{ marginLeft: 10 }}
                      />
                    </Row>
                  </View>
                  {!this.state.userInfo &&
                    !this.state.privacyValue &&
                    <ActivityIndicator
                      style={{ marginTop: 20 }}
                      size="small"
                      color="#000000"
                    />}
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap"
                    }}
                  >
                    {this.state.userInfo &&
                      !this.state.privacyValue &&
                      alphabetized
                        .filter(
                          user =>
                            this.state.membersCopy.findIndex(
                              i => i.userId === user._id
                            ) !== -1
                        )
                        .map(user =>
                          <TouchableOpacity
                            onPress={() => this.updateMembers(user._id, false)}
                            style={{ margin: 10 }}
                          >
                            <View
                              style={{
                                backgroundColor: "#212121",
                                padding: 10,
                                borderRadius: 8
                              }}
                            >
                              <Text
                                style={{
                                  color: "#F2F2F2",
                                  fontFamily: "Avenir-Heavy",
                                  fontSize: 12
                                }}
                              >
                                {user.firstName} {user.lastName}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        )}
                    {this.state.userInfo &&
                      !this.state.privacyValue &&
                      alphabetized
                        .filter(
                          user =>
                            this.state.membersCopy.findIndex(
                              i => i.userId === user._id
                            ) === -1
                        )
                        .map(user =>
                          <TouchableOpacity
                            onPress={() => this.updateMembers(user._id, true)}
                            style={{ margin: 10 }}
                          >
                            <View
                              style={{
                                backgroundColor: "#F2F2F2",
                                padding: 10,
                                borderRadius: 8
                              }}
                            >
                              <Text
                                style={{
                                  color: "#212121",
                                  fontFamily: "Avenir-Heavy",
                                  fontSize: 12
                                }}
                              >
                                {user.firstName} {user.lastName}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        )}
                  </View>
                </Column>}
            </Column>
          </BlurView>
        </Modal>
        <Modal
          visible={this.state.addNewOpened}
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
            <Column
              style={{
                backgroundColor: "white",
                padding: 20,
                borderRadius: 8,
                width: "60%"
              }}
            >
              <TouchableOpacity
                style={{ position: "absolute", top: 10, right: 10 }}
                onPress={() => this.setState({ addNewOpened: false })}
              >
                <Icon name="x-circle" color="#DCDCDC" size={20} />
              </TouchableOpacity>
              <LittleText>New Group</LittleText>
              <Paragraph style={{ color: "#DCDCDC" }}>Symbol & Name</Paragraph>
              <Row>
                <TextInput
                  style={{ fontSize: 25, margin: 0, marginRight: 10 }}
                  placeholder="❤️"
                  onChangeText={symbol => this.setState({ symbol })}
                />
                <TextInput
                  placeholder="Name"
                  style={{
                    fontSize: 24,
                    fontFamily: "Avenir-Medium",
                    display: "flex",
                    justifyContent: "center",
                    color: this.state.colorChoice
                  }}
                  onChangeText={name => this.setState({ name })}
                  value={this.state.name}
                />
              </Row>
              <ScrollView
                horizontal
                contentContainerStyle={{ marginTop: 10, marginBottom: 10 }}
              >
                {colors.map(color =>
                  <TouchableOpacity
                    onPress={() => this.setState({ colorChoice: color })}
                  >
                    <View
                      style={{
                        backgroundColor: color,
                        borderRadius: 4,
                        height: 25,
                        width: 25,
                        margin: 5
                      }}
                    />
                  </TouchableOpacity>
                )}
              </ScrollView>
              <TouchableOpacity
                onPress={() => this.handleSubmit()}
                style={{ marginTop: 10 }}
              >
                <LittleText>Done</LittleText>
              </TouchableOpacity>
            </Column>
          </BlurView>
        </Modal>
        <Paragraph style={{ color: "#DCDCDC" }}>Groups</Paragraph>
        <ScrollView
          horizontal
          contentContainerStyle={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {this.props.group.tags
            .map((tag, index) =>
              <TouchableOpacity
                onPress={() => {
                  if (!this.state.userInfo) {
                    this.getUserInfo();
                  }
                  this.setState({
                    tagOpened: true,
                    pickedTag: tag,
                    pickedTagIndex: index,
                    privacyValue: tag.public,
                    membersCopy: tag.members
                  });
                }}
                style={{ width: 80, height: 80 }}
              >
                <Column>
                  <Text style={{ fontSize: 42, marginBottom: 5 }}>
                    {tag.symbol}
                  </Text>
                  <LittleText style={{ margin: 0, color: tag.color }}>
                    {tag.name}
                  </LittleText>
                </Column>
              </TouchableOpacity>
            )
            .concat(
              <TouchableOpacity style={{ width: 80, height: 80 }}>
                <Column>
                  <Text style={{ fontSize: 42, marginBottom: 5 }}>
                    👑
                  </Text>
                  <LittleText style={{ margin: 0, color: "#FD8514" }}>
                    Leaders
                  </LittleText>
                </Column>
              </TouchableOpacity>
            )
            .concat(
              <TouchableOpacity
                onPress={() => this.setState({ addNewOpened: true })}
                style={{ marginLeft: 5, marginRight: 5 }}
              >
                <Column>
                  <AddNew style={{ marginBottom: 5 }}>
                    <Icon name="plus" size={20} color="#212121" />
                  </AddNew>
                </Column>
              </TouchableOpacity>
            )}
        </ScrollView>
        <Paragraph style={{ color: "#DCDCDC" }}>Events</Paragraph>
        <View>
          <Swiper key={this.state.events.length} style={{ height: 250 }}>
            {this.state.events.map((event, index) =>
              <View
                style={{
                  marginBottom: 20,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
                key={index}
              >
                <Paragraph>{event.description}</Paragraph>
                <LittleText>
                  {moment(event.date).format("dddd, MMMM Do")}, {event.time}
                </LittleText>
                <Row>
                  <Column>
                    <Circle>
                      <BigText>{event.going.length}</BigText>
                    </Circle>
                    <LittleText>Going</LittleText>
                  </Column>
                  <Column>
                    <Circle>
                      <BigText>{event.notGoing.length}</BigText>
                    </Circle>
                    <LittleText>Not Going</LittleText>
                  </Column>
                  <Column>
                    <Circle>
                      <BigText>
                        {this.props.group.members.length -
                          event.going.length -
                          event.notGoing.length}
                      </BigText>
                    </Circle>
                    <LittleText>Unreplied</LittleText>
                  </Column>
                </Row>
              </View>
            )}
          </Swiper>
        </View>
        <Paragraph style={{ color: "#DCDCDC" }}>Todos</Paragraph>
        <View>
          <Swiper key={this.state.todos.length} style={{ height: 250 }}>
            {this.state.todos.map((todo, index) =>
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 20
                }}
                key={index}
              >
                <Paragraph>{todo.description}</Paragraph>
                <View
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexWrap: "wrap",
                    flexDirection: "row"
                  }}
                >
                  {todo.todos.map(t =>
                    <View
                      style={{
                        margin: 10,
                        width: 100,
                        height: 100
                      }}
                    >
                      <ProgressCircle
                        style={{ height: 60 }}
                        progress={t.completedBy.length / this.state.memberCount}
                        progressColor="#212121"
                      />
                      <LittleText
                        style={{
                          marginTop: 10,
                          textAlign: "center",
                          width: 80,
                          marginLeft: 10
                        }}
                      >
                        {t.todo}
                      </LittleText>
                    </View>
                  )}
                </View>
              </View>
            )}
          </Swiper>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getUserGroups: (token, id) => dispatch(getUserGroups(token, id))
  };
}

const Column = styled.View`
  flexDirection: column;
  display: flex;
  justifyContent: center;
  alignItems: center;
  margin: 10px;
  `;

const Paragraph = styled.Text`
  color: #212121;
  fontFamily: Avenir-Heavy;
  fontSize: 14px;
  margin: 10px 0;
`;

const LittleText = styled.Text`
fontFamily: Avenir-Book;
fontSize: 12;
marginBottom: 0;
letterSpacing: 0.5;
`;

const Header = styled.Text`
fontFamily: Avenir-Heavy;
fontSize: 14px;
letterSpacing: 1px;
`;

const BigText = styled.Text`
  fontFamily: Avenir-Light;
  color: white;
  fontSize: 30px;
`;

const Circle = styled.View`
  width: 50px;
  height: 50px;
  borderRadius: 25px;
  backgroundColor: #212121;
  display: flex;
  justifyContent: center;
  alignItems: center;
  margin: 10px;
`;

const Row = styled.View`
  display: flex;
  flexDirection: row;
  alignItems: center;
`;

const AddNew = styled.View`
  width: 40px;
  height: 40px;
  borderRadius: 30px;
  borderWidth: 2px;
  borderStyle: dashed;
  borderColor: #DCDCDC;
  display: flex;
  justifyContent: center;
  alignItems: center;
`;

export default connect(mapStateToProps, mapDispatchToProps)(LeadersPanel);
