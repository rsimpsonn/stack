import React, { Component } from "react";
import { View, TextInput, Text, TouchableOpacity, Alert } from "react-native";
import styled from "styled-components/native";

import { connect } from "react-redux";

import { getSignUp } from "../../actions";

class SignUpPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      lastName: "",
      firstName: ""
    };
  }

  render() {
    console.log(this.props.user);
    return (
      <Container>
        <Subtitle>FIRST NAME</Subtitle>
        <Info
          onChangeText={firstName => this.setState({ firstName })}
          placeholder="First Name"
          value={this.state.firstName}
        />
        <Subtitle>LAST NAME</Subtitle>
        <Info
          onChangeText={lastName => this.setState({ lastName })}
          placeholder="Last Name"
          value={this.state.lastName}
        />
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
        <Subtitle>CONFIRM PASSWORD</Subtitle>
        <Info
          onChangeText={confirm => this.setState({ confirm })}
          placeholder="Confirm Password"
          type="password"
          value={this.state.confirm}
          autoCapitalize="none"
          secureTextEntry
        />
        <TouchableOpacity
          onPress={() => {
            if (this.state.password === this.state.confirm) {
              this.props.getSignUp(
                this.state.firstName,
                this.state.lastName,
                this.state.email,
                this.state.password,
                () => this.props.navigation.navigate("LoginPage")
              );
            } else {
              Alert.alert("Your passwords don't match");
            }
          }}
        >
          <Submit>
            <Subtitle style={{ color: "white" }}>SIGN UP</Subtitle>
          </Submit>
        </TouchableOpacity>
      </Container>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getSignUp: (firstName, lastName, email, password, callback) =>
      dispatch(getSignUp(firstName, lastName, email, password, callback))
  };
}

export default connect(null, mapDispatchToProps)(SignUpPage);

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
