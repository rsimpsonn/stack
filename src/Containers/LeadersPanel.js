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
import { ProgressCircle, PieChart } from "react-native-svg-charts";
import Icon from "react-native-vector-icons/Feather";
import moment from "moment";
import Swiper from "react-native-swiper";
import { BlurView } from "expo";

import { connect } from "react-redux";

import { getUserGroups, getEvent } from "../../actions";

const endpoint = "https://stormy-lowlands-99865.herokuapp.com";

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

const colorSeries = [
  "#FF9292",
  "#CAFFE2",
  "#FFE2AB",
  "#CDD7FF",
  "#E8C9FF",
  "#E8FFC7"
];

const weekdays = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays"];

class LeadersPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      memberCount: 2,
      todos: [],
      events: [],
      votes: [],
      addNewOpened: false,
      colorChoice: "#212121",
      tagOpened: false,
      leadersOpen: false,
      membersCopy: [],
      userInfo: []
    };

    this.getTodos = this.getTodos.bind(this);
    this.getEvents = this.getEvents.bind(this);
    this.getVotes = this.getVotes.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateTag = this.updateTag.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
    this.updateMembers = this.updateMembers.bind(this);
    this.returnMembers = this.returnMembers.bind(this);
    this.returnLeaders = this.returnLeaders.bind(this);
    this.formatData = this.formatData.bind(this);
    this.pauseEvent = this.pauseEvent.bind(this);
    this.getNextDate = this.getNextDate.bind(this);
  }

  async componentDidMount() {
    this.getUserInfo();
    this.setState({
      todos: await this.getTodos(),
      events: await this.getEvents(),
      votes: await this.getVotes()
    });

    const weekScheduleRes = await fetch(`${endpoint}/thisweek`);
    const weekSchedule = await weekScheduleRes.json();

    this.setState({
      weekSchedule: weekSchedule
    });
  }

  async getTodos() {
    const response = await fetch(
      `${endpoint}/api/todosbygroupid?groupId=${this.props.group.groupId}`,
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
    const response = await fetch(`${endpoint}/api/geteventsbygroupid`, {
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

  async getVotes() {
    const response = await fetch(
      `${endpoint}/api/votesbygroupid?groupId=${this.props.group.groupId}`,
      {
        headers: {
          "x-access-token": this.props.user.token
        }
      }
    );

    const data = await response.json();

    return data;
  }

  async getUserInfo() {
    const ids = this.props.group.members.map(i => i.userId);
    const response = await fetch(`${endpoint}/api/getusersbyuserids`, {
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

  formatUsers(completedBy) {
    if (!completedBy) {
      return;
    }
    var nameList = [];
    completedBy.forEach(completed => {
      this.state.userInfo.forEach(user => {
        if (user._id === completed.userId) {
          nameList.push(user.firstName);
        }
      });
    });

    return nameList.join(", ");
  }

  handleSubmit() {
    this.setState({
      addNewOpened: false
    });
    fetch(`${endpoint}/api/addgrouptag`, {
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

  formatData(options) {
    var totalVotes = 0;

    options.forEach(option => {
      totalVotes += option.votedForBy.length;
    });

    var data = options.map((option, index) => ({
      value: option.votedForBy.length,
      svg: {
        fill: colorSeries[index]
      },
      key: `pie-${index}`
    }));

    return data;
  }

  updateTag(index, privacyValue) {
    fetch(`${endpoint}/api/updatetag`, {
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

  getNextDate(date, option, time) {
    var nextDate;
    var mondayStamp;
    const dateCopy = moment(date);
    switch (option) {
      case "One Time":
        nextDate = moment(date).format("dddd, MMMM Do");
        break;
      case "Monthly":
        var dayInWeek;
        mondayStamp =
          dateCopy.startOf("isoweek").month() +
          1 +
          "-" +
          dateCopy.startOf("isoweek").date();
        if (this.state.weekSchedule && this.state.weekSchedule[mondayStamp]) {
          dayInWeek = this.state.weekSchedule[mondayStamp][
            moment(date).day() - 1
          ];
          nextDate = weekdays[dayInWeek - 1];
        } else {
          nextDate = weekdays[moment(date).day() - 1];
        }
        break;
      case "Weekly":
        var dayInWeek;
        mondayStamp =
          dateCopy.startOf("isoweek").month() +
          1 +
          "-" +
          dateCopy.startOf("isoweek").date();
        if (this.state.weekSchedule && this.state.weekSchedule[mondayStamp]) {
          dayInWeek = this.state.weekSchedule[mondayStamp][
            moment(date).day() - 1
          ];
          nextDate = weekdays[dayInWeek - 1];
        } else {
          nextDate = weekdays[moment(date).day() - 1];
        }
        break;
        break;
    }

    return nextDate;
  }

  returnMembers() {
    if (this.state.membersCopy !== this.state.pickedTag.members) {
      fetch(`${endpoint}/api/updatetagmembers`, {
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

  sumVotes(options) {
    var total = 0;
    options.forEach(option => {
      total += option.votedForBy.length;
    });

    return `${total} vote${total === 1 ? "" : "s"}`;
  }

  returnLeaders() {
    if (this.state.membersCopy !== this.props.group.leaders) {
      fetch(`${endpoint}/api/updategroupleaders`, {
        method: "POST",
        headers: {
          "x-access-token": this.props.user.token,
          Accept: "application/json",
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          groupId: this.props.group.groupId,
          leaders: this.state.membersCopy
        })
      }).then(() => this.props.update());
    }
  }

  pauseEvent(event) {
    fetch(`${endpoint}/api/togglepauseevent`, {
      method: "POST",
      headers: {
        "x-access-token": this.props.user.token,
        Accept: "application/json",
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        eventId: event._id,
        paused: !event.paused
      })
    }).then(() => this.props.getEvent(this.props.user.token, event._id));
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
      <ScrollView contentContainerStyle={{ padding: 10 }}>
        <Modal
          visible={this.state.leadersOpen}
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
                  this.returnLeaders();
                  this.setState({ leadersOpen: false });
                }}
              >
                <Icon name="x-circle" color="#DCDCDC" size={20} />
              </TouchableOpacity>
              <Column>
                <LittleText>
                  👑 Leaders
                </LittleText>
                {!this.state.userInfo &&
                  <ActivityIndicator
                    style={{ marginTop: 20 }}
                    size="small"
                    color="#000000"
                  />}
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    paddingTop: 20
                  }}
                >
                  {this.state.userInfo &&
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
                          style={{ margin: 5 }}
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
                          style={{ margin: 5 }}
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
              </Column>
            </Column>
          </BlurView>
        </Modal>
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
                      flexWrap: "wrap",
                      justifyContent: "center",
                      paddingTop: 20
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
                            style={{ margin: 5 }}
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
                            style={{ margin: 5 }}
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
              <TouchableOpacity
                style={{ width: 80, height: 80 }}
                onPress={() => {
                  if (!this.state.userInfo) {
                    this.getUserInfo();
                  }
                  this.setState({
                    leadersOpen: true,
                    membersCopy: this.props.group.leaders
                  });
                }}
              >
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
        {this.state.events.length > 0 &&
          <Paragraph style={{ color: "#DCDCDC" }}>Events</Paragraph>}
        {this.state.events.length > 0 &&
          <View>
            <Swiper
              loop={false}
              key={this.state.events.length}
              style={{ height: 150 }}
              activeDotColor="#212121"
            >
              {this.state.events
                .filter(
                  i =>
                    i.option !== "One Time" ||
                    moment(i.date).diff(moment()) >= 0
                )
                .map((event, index) =>
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
                      {this.getNextDate(event.date, event.option)}
                      {"   "}·{"   "}
                      {event.time}{"   "}·{"   "}
                      {event.option}
                    </LittleText>
                    <TouchableOpacity
                      onPress={() => {
                        this.pauseEvent(event);
                        var events = this.state.events.filter(
                          i =>
                            i.option !== "One Time" ||
                            moment(i.date).diff(moment()) >= 0
                        );
                        events[index].paused = !events[index].paused;
                        this.setState({
                          events
                        });
                      }}
                    >
                      <Icon
                        name={`${event.paused
                          ? "play-circle"
                          : "pause-circle"}`}
                        color="#212121"
                        style={{ marginTop: 10 }}
                        size={25}
                      />
                    </TouchableOpacity>
                  </View>
                )}
            </Swiper>
          </View>}
        {this.state.todos.length > 0 &&
          <Paragraph style={{ color: "#DCDCDC" }}>Todos</Paragraph>}
        {this.state.todos.length > 0 &&
          <View>
            <Swiper
              activeDotColor="#212121"
              key={this.state.todos.length}
              style={{ height: 250 }}
            >
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
                  <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {todo.todos.map(t =>
                      <View>
                        <LittleText
                          style={{
                            textAlign: "center",
                            fontFamily: "Avenir-Medium"
                          }}
                        >
                          {t.todo}
                        </LittleText>
                        <LittleText
                          style={{
                            textAlign: "center",
                            marginBottom: 10
                          }}
                        >
                          ✅{" "}
                          {this.formatUsers(t.completedBy)}
                        </LittleText>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </Swiper>
          </View>}
        {this.state.votes.length > 0 &&
          <Paragraph style={{ color: "#DCDCDC" }}>Votes</Paragraph>}
        {this.state.votes.length > 0 &&
          <View style={{ paddingBottom: 10 }}>
            <Swiper
              activeDotColor="#212121"
              key={this.state.votes.length}
              style={{ height: 250 }}
            >
              {this.state.votes.map((vote, index) =>
                <View>
                  <Paragraph style={{ textAlign: "center", marginBottom: 20 }}>
                    {vote.description}
                  </Paragraph>
                  <PieChart
                    outerRadius={0}
                    innerRadius={10}
                    style={{ height: 100 }}
                    data={this.formatData(vote.options)}
                  />
                  <Row
                    style={{
                      flexWrap: "wrap",
                      justifyContent: "center",
                      marginTop: 20
                    }}
                  >
                    {vote.options.map((option, index) =>
                      <Row style={{ marginLeft: 10 }}>
                        <ColorBox
                          style={{ backgroundColor: colorSeries[index] }}
                        />
                        <LittleText>{option.option}</LittleText>
                      </Row>
                    )}
                  </Row>
                  <LittleText
                    style={{
                      fontFamily: "Avenir-Medium",
                      textAlign: "center",
                      marginTop: 10
                    }}
                  >
                    {this.sumVotes(vote.options)}
                  </LittleText>
                </View>
              )}
            </Swiper>
          </View>}
      </ScrollView>
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
    getUserGroups: (token, id) => dispatch(getUserGroups(token, id)),
    getEvent: (token, eventId) => dispatch(getEvent(token, eventId))
  };
}
//
// <Row>
//   <Column>
//     <Circle>
//       <BigText>{event.going.length}</BigText>
//     </Circle>
//     <LittleText>Going</LittleText>
//   </Column>
//   <Column>
//     <Circle>
//       <BigText>{event.notGoing.length}</BigText>
//     </Circle>
//     <LittleText>Not Going</LittleText>
//   </Column>
//   <Column>
//     <Circle>
//       <BigText>
//         {this.props.group.members.length -
//           event.going.length -
//           event.notGoing.length}
//       </BigText>
//     </Circle>
//     <LittleText>Unreplied</LittleText>
//   </Column>
// </Row>

const Column = styled.View`
  flexDirection: column;
  display: flex;
  justifyContent: center;
  alignItems: center;
  margin: 10px;
  `;

const ColorBox = styled.View`
  borderRadius: 4px;
  width: 20px;
  height: 20px;
  marginRight: 5px;
`;

const Paragraph = styled.Text`
  color: #212121;
  fontFamily: Avenir-Heavy;
  fontSize: 14px;
  margin: 12px 0;
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
