import React, { Component } from "react";
import { ScrollView, Text } from "react-native";
import styled from "styled-components/native";
import { connect } from "react-redux";

class EventList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      events: []
    };

    this.getEventbriteData = this.getEventbriteData.bind(this);
  }

  async componentDidMount() {
    this.setState({
      events: []
    });
  }

  async getEventbriteData() {
    const url = `https://www.eventbriteapi.com/v3/events/search?token=3R6Y3E32NWWZOKJD7KUR&q=hackathon&location.latitude=33.618816&location.longitude=-117.823267&location.within=60mi&sort_by=best&categories=tech`;
    const response = await fetch(url, {
      headers: {
        // prettier-ignore
        'Authorization': "Bearer 62LCTPNF7LLTEK6V3W" // eslint-disable-line
      }
    });
    const data = await response.json();
    return data.events;
  }

  render() {
    console.log(this.state.events[0] ? this.state.events[0] : undefined);
    return (
      <ScrollView horizontal>
        {this.state.events.map(event => {
          return (
            <EventIcon
              e={{
                name: event.name ? event.name.text : "",
                image: event.logo ? event.logo.url : ""
              }}
            />
          );
        })}
      </ScrollView>
    );
  }
}

function mapStateToProps(state) {
  return {
    interest: state.interestNav,
    user: state.user
  };
}

const EventIcon = props => {
  return (
    <Container>
      <Img source={{ uri: props.e.image }} />
      <Paragraph>{props.e.name}</Paragraph>
    </Container>
  );
};

const Container = styled.View`
  marginRight: 20px;
  marginTop: 20px;
  width: 200px;
`;

const Img = styled.Image`
  borderRadius: 8px;
  backgroundColor: #F2F2F2;
  width: 200px;
  height: 140px;
`;

const Paragraph = styled.Text`
  fontFamily: Avenir-Heavy;
  color: #212121;
  fontSize: 16px;
  marginTop: 10px;
`;

export default connect(mapStateToProps)(EventList);
