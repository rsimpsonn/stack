import React, { Component } from "react";
import { Image, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { ImagePicker, Permissions } from "expo";
import { connect } from "react-redux";

const endpoint = "https://stormy-lowlands-99865.herokuapp.com";

import { profilePictureAdded } from "../../actions";

class ProfilePicture extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alreadyThere: this.props.user.profilePic ? true : false
    };

    this.onPress = this.onPress.bind(this);
    this.pickImage = this.pickImage.bind(this);
  }

  async onPress() {
    Permissions.askAsync(Permissions.CAMERA_ROLL);

    this.pickImage();
  }

  async pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      mediaTypes: "Images",
      compression: 0.5,
      allowsEditing: true
    });

    if (!result.cancelled) {
      this.setState({
        picked: true,
        result
      });

      var data = new FormData();
      data.append("profilePic", {
        uri: result.uri,
        type: "image/jpeg",
        name: "image.jpg"
      });
      data.append("userId", this.props.user.id);

      const response = await fetch(`${endpoint}/api/addprofilepic`, {
        method: "POST",
        headers: {
          "x-access-token": this.props.user.token,
          "Content-type": "multipart/form-data",
          Accept: "application/json"
        },
        body: data
      });

      const link = await response.json();

      this.props.profilePictureAdded(link.link);
    }
  }

  render() {
    console.log(this.props.user);
    return (
      <TouchableOpacity onPress={() => this.onPress()}>
        <Profile
          source={{
            uri: this.state.picked
              ? `data:image/gif;base64,${this.state.result.base64}`
              : this.state.alreadyThere ? this.props.user.profilePic : ""
          }}
        />
      </TouchableOpacity>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    profilePictureAdded: link => dispatch(profilePictureAdded(link))
  };
}

export default connect(null, mapDispatchToProps)(ProfilePicture);

const Profile = styled.Image`
  width: 50px;
  height: 50px;
  borderRadius: 25px;
  backgroundColor: #F2F2F2;
  marginTop: 50px;
`;
