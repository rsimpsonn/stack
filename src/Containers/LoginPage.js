import React, { Component } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";

import { connect } from "react-redux";

import { login } from "../../actions";

class LoginPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: ""
    };

    this.login = this.login.bind(this);
  }

  componentDidMount() {
    console.log(this.props.user.token);
    if (this.props.user.token) {
      this.props.navigation.navigate("HomePage");
    }
  }

  async login(callback) {
    if (this.state.email && this.state.password) {
      let loginInfo = await fetch("http://fa801706.ngrok.io/login", {
        method: "POST",
        body: JSON.stringify({
          email: this.state.email,
          password: this.state.password
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      });

      let loginInfoJSON = await loginInfo.json();

      // TODO Redux

      this.props.navigation.navigate("HomePage");
    }
  }

  render() {
    console.log(this.props.user);
    return (
      <Container>
        <Subtitle>EMAIL</Subtitle>
        <Info
          onChangeText={email => this.setState({ email })}
          placeholder="Email"
          value={this.state.email}
          autoCapitalize="none"
        />
        <Subtitle>PASSWORD</Subtitle>
        <Info
          onChangeText={password => this.setState({ password })}
          placeholder="Password"
          type="password"
          value={this.state.password}
          autoCapitalize="none"
          secureTextEntry
        />
        <TouchableOpacity
          onPress={() =>
            this.props.getLogin(this.state.email, this.state.password, () =>
              this.props.navigation.navigate("HomePage")
            )}
        >
          <Submit>
            <Subtitle style={{ color: "white" }}>LOGIN</Subtitle>
          </Submit>
        </TouchableOpacity>
      </Container>
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
    getLogin: (email, password, callback) =>
      dispatch(login(email, password, callback))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);

const Container = styled.View`
    display: flex;
    justifyContent: center;
    alignItems: center;
    flex: 1;
    backgroundColor: white;
  `;

const Subtitle = styled.Text`
  color: #DCDCDC;
  fontFamily: Avenir-Heavy;
  letterSpacing: 5px;
  fontSize: 11px;
  textAlign: center;
`;

const Info = styled.TextInput`
  fontFamily: Avenir-Book;
  padding: 20px;
  width: 400px;
  textAlign: center;
`;

const Submit = styled.View`
  marginTop: 20px;
  backgroundColor: #212121;
  borderRadius: 8px;
  padding: 10px;
  display: flex;
  justifyContent: center;
  alignItems: center;
  width: 200px;
`;
