const initialState = {
  votes: [],
  isFetching: false,
  error: false
};

export default function voteReducer(state = initialState, action) {
  switch (action.type) {
    case "GETTING_VOTE":
      return {
        ...state,
        isFetching: true
      };
    case "GETTING_VOTE_SUCCESS":
      console.log(action.data);
      return {
        ...state,
        isFetching: false,
        votes: addVote(action.data, state.votes)
      };
    default:
      return state;
  }
}

function addVote(vote, votes) {
  const index = votes.findIndex(i => i._id === vote._id);
  if (index === -1) {
    return votes.concat(vote);
  } else {
    const copy = votes;
    votes[index] = vote;
    return copy;
  }
}
