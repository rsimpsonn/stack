import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image
} from "react-native";
import styled from "styled-components/native";

import { connect } from "react-redux";
import Icon from "react-native-vector-icons/Feather";
import TypeWriter from "react-native-typewriter";
import { ImagePicker, Permissions } from "expo";

import { getUserGroups, groupChosen } from "../../actions";

const icons = ["edit-3", "file-text", "paperclip", "image"];
const pages = [
  {
    name: "Group Name",
    label: "name",
    message: "Starting a new group?\nLet's start with a name."
  },
  {
    name: "Description",
    label: "description",
    message: "A brief 1-2 sentence description."
  },
  {
    message: "A color and a 1 character symbol."
  },
  {
    name: "Cover",
    label: "cover",
    message: "A cover photo."
  }
];

const messageColors = {
  FFBDE7: "#B22A80",
  FFA0A0: "#CE2E2E",
  FFD8A0: "#DD8D1C",
  FFF1CB: "#F4B509",
  E1FFCB: "#64C41E",
  CBFFD9: "#38B85B",
  D4FFF6: "#32CCAC",
  DADBFF: "#4145D3",
  C2D0FF: "#3A64F2",
  EBD4FF: "#8F3AD9"
};

const colorChoices = [
  "#FFBDE7",
  "#FFA0A0",
  "#FFD8A0",
  "#FFF1CB",
  "#E1FFCB",
  "#CBFFD9",
  "#D4FFF6",
  "#DADBFF",
  "#C2D0FF",
  "#EBD4FF"
];

const ngrokRoute = "https://1baef6f5.ngrok.io";

class MakeGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      index: 0,
      colorChoice: "#C2D0FF",
      pickedSymbol: ""
    };

    this.pickImage = this.pickImage.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

  async pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      mediaTypes: "Images",
      compression: 0.5
    });
    console.log(result);
    this.setState({
      coverImage: result
    });
  }

  submitForm() {
    var data = new FormData();
    data.append("groupCover", {
      uri: this.state.coverImage.uri,
      type: "image/jpeg",
      name: "image.jpg"
    });
    data.append("name", this.state.name);
    data.append("description", this.state.description);
    data.append("background", this.state.colorChoice);
    data.append("messages", messageColors[this.state.colorChoice.substring(1)]);
    data.append("userId", this.props.user.id);
    data.append("interest", this.props.interest.interestId);
    data.append("symbol", this.state.pickedSymbol);

    console.log(data);

    fetch(`${ngrokRoute}/api/makegroup`, {
      method: "POST",
      headers: {
        "x-access-token": this.props.user.token,
        "Content-type": "multipart/form-data",
        Accept: "application/json"
      },
      body: data
    }).then(res =>
      res.json().then(data => {
        console.log(data <= "THIS ONE");
        this.props.getUserGroups(this.props.user.token, this.props.user.id);
        this.props.navigation.navigate("HomePage");
      })
    );
  }

  render() {
    if (this.state.index === 3) {
      Permissions.askAsync(Permissions.CAMERA_ROLL);
    }
    return (
      <Container>
        <Icon name={icons[this.state.index]} color="#212121" size={30} />
        <View style={{ marginTop: 40 }}>
          <TypeWriter
            style={{
              fontFamily: "Avenir-Medium",
              fontSize: 20,
              color: "#212121"
            }}
            maxDelay={60}
            typing={1}
          >
            {pages[this.state.index].message}
          </TypeWriter>
        </View>
        {this.state.index !== 2 &&
          this.state.index !== 3 &&
          <Input
            multiline
            onChangeText={text =>
              this.setState({ [pages[this.state.index].label]: text })}
            value={this.state[pages[this.state.index].label]}
            placeholder={pages[this.state.index].name}
          />}
        {this.state.index === 2 &&
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
              marginBottom: 20
            }}
          >
            <Centered style={{ backgroundColor: this.state.colorChoice }}>
              <SymbolInput
                placeholder={
                  this.state.name ? this.state.name.substring(0, 1) : "A"
                }
                value={this.state.pickedSymbol}
                onChangeText={text => {
                  this.setState({ pickedSymbol: text });
                }}
              />
            </Centered>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center"
              }}
            >
              {colorChoices.map(choice =>
                <TouchableOpacity
                  onPress={() => this.setState({ colorChoice: choice })}
                  style={{ marginRight: 10, marginTop: 10 }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      backgroundColor: choice,
                      borderRadius: 8
                    }}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>}
        {this.state.index === 3 &&
          <TouchableOpacity onPress={() => this.pickImage()}>
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 20,
                marginBottom: 20
              }}
            >
              {this.state.coverImage &&
                <Image
                  source={{
                    uri: `data:image/gif;base64,${this.state.coverImage.base64}`
                  }}
                  style={{ width: 200, height: 240 }}
                />}
              <Text
                style={{
                  fontFamily: "Avenir-Light",
                  fontSize: 12,
                  marginTop: 10
                }}
              >
                Choose Cover
              </Text>
            </View>
          </TouchableOpacity>}
        {this.state.coverImage &&
          <TouchableOpacity onPress={() => this.submitForm()}>
            <Text
              style={{
                fontFamily: "Avenir-Light",
                fontSize: 12,
                marginTop: 30
              }}
            >
              Done
            </Text>
          </TouchableOpacity>}
        <Row>
          {this.state.index > 0 &&
            <TouchableOpacity
              onPress={() => this.setState({ index: this.state.index - 1 })}
            >
              <Icon name="chevrons-left" size={30} color="#212121" />
            </TouchableOpacity>}
          {this.state.index < pages.length - 1 &&
            <TouchableOpacity
              onPress={() => this.setState({ index: this.state.index + 1 })}
            >
              <Icon name="chevrons-right" size={30} color="#212121" />
            </TouchableOpacity>}
        </Row>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    interest: state.interestNav
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getUserGroups: (token, id) => dispatch(getUserGroups(token, id)),
    groupChosen: groupId => dispatch(groupChosen(groupId))
  };
}

const Input = styled.TextInput`
  fontFamily: Avenir-Light;
  color: #212121;
  fontSize: 30px;
  borderBottomWidth: 2px;
  borderColor: #DCDCDC;
  margin: 50px 0;
`;

const Paragraph = styled.Text`
  fontFamily: Avenir-Book;
  fontSize: 14px;
  color: #212121;
`;

const Container = styled.View`
  display: flex;
  flex: 1;
  backgroundColor: white;
  paddingTop: 50px;
  paddingRight: 20px;
  paddingLeft: 20px;
`;

const Row = styled.View`
  display: flex;
  flexDirection: row;
  alignItems: center;
  marginTop: 50px;
`;

const SymbolInput = styled.TextInput`
  height: 100px;
  fontSize: 40px;
  color: white;
  display: flex;
  alignItems: center;
  justifyContent: center;
  fontFamily: Avenir-Black;
`;

const Centered = styled.View`
  display: flex;
  justifyContent: center;
  alignItems: center;
  borderRadius: 8px;
  width: 100px;
    margin: 20px;
`;

export default connect(mapStateToProps, mapDispatchToProps)(MakeGroup);
