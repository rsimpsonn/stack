import React, { Component } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { connect } from "react-redux";
import Icon from "react-native-vector-icons/Feather";

import { getVote, pickVote } from "../../actions";

const colorSeries = [
  ["#FF9292", "#C51010"],
  ["#CAFFE2", "#0BD566"],
  ["#FFE2AB", "#FEB72B"],
  ["#CDD7FF", "#5575FF"],
  ["#E8C9FF", "#B350FF"],
  ["#E8FFC7", "#A5E743"]
];

class Vote extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newFetch: false
    };

    this.hasVoted = this.hasVoted.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.newFetch && !nextProps.votes.isFetching) {
      const index = nextProps.votes.votes.findIndex(
        i => i._id === this.props.voteId
      );
      if (index !== -1) {
        this.setState({
          vote: nextProps.votes.votes[index],
          newFetch: false
        });
      }
    }
  }

  componentDidMount() {
    const index = this.props.votes.votes.findIndex(
      i => i._id === this.props.voteId
    );
    if (index !== -1) {
      this.setState({
        vote: this.props.votes.votes[index]
      });
    } else {
      this.setState({
        newFetch: true
      });
      this.props.getVote(this.props.user.token, this.props.voteId);
    }
  }

  hasVoted() {
    var voted = 0;
    this.state.vote.options.forEach((option, index) => {
      if (
        option.votedForBy.findIndex(i => i.userId === this.props.user.id) !== -1
      ) {
        voted = index;
      }
    });

    return voted;
  }

  render() {
    var hasVoted;
    if (this.state.vote) {
      hasVoted = this.hasVoted();
    }
    return (
      <Box>
        {this.state.vote &&
          <View>
            <Icon
              size={20}
              style={{ marginBottom: 10 }}
              name="award"
              color="#212121"
            />
            <Paragraph style={{ marginBottom: 5 }}>
              {this.state.vote.description}
            </Paragraph>
            {hasVoted &&
              <Header>
                You voted for {this.state.vote.options[hasVoted].option}
              </Header>}
            {!hasVoted &&
              this.state.vote.options.map((option, index) =>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ pickedIndex: index });
                    this.props.pickVote(
                      this.props.user.token,
                      this.props.voteId,
                      this.props.user.id,
                      index
                    );
                  }}
                >
                  <Bubble
                    style={{
                      backgroundColor: option.votedForBy.findIndex(
                        i => i.userId === this.props.user.id
                      ) !== -1 || this.state.pickedIndex === index
                        ? colorSeries[index][0]
                        : "#F2F2F2"
                    }}
                  >
                    <BubbleText
                      style={{
                        color: option.votedForBy.findIndex(
                          i => i.userId === this.props.user.id
                        ) !== -1 || this.state.pickedIndex === index
                          ? colorSeries[index][1]
                          : "#ADADAD"
                      }}
                    >
                      {option.option.toUpperCase()}
                    </BubbleText>
                  </Bubble>
                </TouchableOpacity>
              )}
          </View>}
      </Box>
    );
  }
}

function mapStateToProps(state) {
  return {
    votes: state.votes,
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getVote: (token, voteId) => dispatch(getVote(token, voteId)),
    pickVote: (token, voteId, userId, index) =>
      dispatch(pickVote(token, voteId, userId, index))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Vote);

const Bubble = styled.View`
  borderRadius: 4px;
  padding: 10px;
  marginTop: 5px;
  marginBottom: 5px;
  display: flex;
  justifyContent: center;
  alignItems: center;
`;

const BubbleText = styled.Text`
  fontFamily: Avenir-Heavy;
  fontSize: 12px;
  letterSpacing: 1px
`;

const Box = styled.View`
  borderRadius: 8px;
  backgroundColor: white;
  padding: 10px;
  margin: 10px;
  marginLeft: 0px;
`;

const Header = styled.Text`
  fontFamily: Avenir-Heavy;
  color: #DCDCDC;
  fontSize: 12px;
`;

const Paragraph = styled.Text`
  color: #212121;
  fontFamily: Avenir-Heavy;
  fontSize: 14px;
`;

const Circle = styled.View`
  width: 15px;
  height: 15px;
  borderRadius: 7.5px;
  borderColor: #DCDCDC;
  borderWidth: 1.5px;
  marginRight: 10px;
  display: flex;
  alignItems: center;
  justifyContent: center;
`;

const Row = styled.View`
  display: flex;
  flexDirection: row;
  alignItems: center;
`;
