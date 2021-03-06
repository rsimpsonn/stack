import {
  FETCHING_INTERESTS,
  FETCHING_INTERESTS_FAILURE,
  FETCHING_INTERESTS_SUCCESS
} from "./constants";

const endpoint = "https://stormy-lowlands-99865.herokuapp.com";

export function fetchInterests(token) {
  return dispatch => {
    dispatch(getInterests());
    fetch(`${endpoint}/api/getinterests`, {
      headers: {
        "x-access-token": token,
        Accept: "application/json",
        "Content-type": "application/json"
      }
    }).then(res => {
      res
        .json()
        .then(data => {
          dispatch(getInterestsSuccess(data));
        })
        .catch(err => console.log(err));
    });
  };
}

export function joinInterest(token, userId, groupId) {
  return dispatch => {
    dispatch(joining());
    fetch(`${endpoint}/api/joininterest`, {
      method: "POST",
      headers: {
        "x-access-token": token,
        Accept: "application/json",
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        userId,
        groupId
      })
    }).then(res => {
      fetchInterests(token);
    });
  };
}

export function joinGroup(token, userId, groupId) {
  return dispatch => {
    fetch(`${endpoint}/api/joingroup`, {
      method: "POST",
      headers: {
        "x-access-token": token,
        Accept: "application/json",
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        userId,
        groupId
      })
    }).then(data => {
      getUserGroups(token, userId);
    });
  };
}

export function getUserGroups(token, userId) {
  return dispatch => {
    dispatch(getting());
    fetch(`${endpoint}/api/getusergroups?userId=${userId}`, {
      headers: {
        "x-access-token": token
      }
    }).then(res => {
      res
        .json()
        .then(data => {
          console.log(data);
          dispatch(getGroupsSuccess(data));
        })
        .catch(err => console.log(err));
    });
  };
}

export function joinSubInterest(token, userId, subId) {
  console.log("joining");
  return dispatch => {
    fetch(`${endpoint}/api/joinsubinterest`, {
      method: "POST",
      headers: {
        "x-access-token": token,
        Accept: "application/json",
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        userId,
        subId
      })
    }).then(res => {
      fetchInterests(token);
    });
  };
}

export function getTodo(token, todoId) {
  return dispatch => {
    dispatch(gettingTodos());
    fetch(`${endpoint}/api/todobyid?todoId=${todoId}`, {
      headers: {
        "x-access-token": token
      }
    }).then(res => {
      res.json().then(data => {
        dispatch(getTodoSuccess(data));
      });
    });
  };
}

export function getEvent(token, eventId) {
  return dispatch => {
    dispatch(gettingEvent());
    fetch(`${endpoint}/api/eventbyid?eventId=${eventId}`, {
      headers: {
        "x-access-token": token
      }
    }).then(res => {
      res.json().then(data => {
        dispatch(getEventSuccess(data));
      });
    });
  };
}

export function getVote(token, voteId) {
  return dispatch => {
    dispatch(gettingEvent());
    fetch(`${endpoint}/api/votebyid?voteId=${voteId}`, {
      headers: {
        "x-access-token": token
      }
    }).then(res => {
      res.json().then(data => {
        dispatch(getVoteSuccess(data));
      });
    });
  };
}

export function removeFromEventList(token, eventId, userId, going) {
  return dispatch => {
    fetch(`${endpoint}/api/removefromeventlist`, {
      headers: {
        "x-access-token": token,
        Accept: "application/json",
        "Content-type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        eventId,
        userId,
        going
      })
    }).then(res => {
      dispatch(getEvent(token, eventId));
    });
  };
}

export function addToEventList(token, eventId, userId, name, going) {
  return dispatch => {
    fetch(`${endpoint}/api/addtoeventlist`, {
      headers: {
        "x-access-token": token,
        Accept: "application/json",
        "Content-type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        eventId,
        userId,
        name,
        going
      })
    }).then(res => {
      dispatch(getEvent(token, eventId));
    });
  };
}

export function completeTodo(token, todoId, userId, index) {
  return dispatch => {
    fetch(`${endpoint}/api/completetodo`, {
      headers: {
        "x-access-token": token,
        Accept: "application/json",
        "Content-type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        todoId,
        userId,
        index
      })
    }).then(res => {
      dispatch(getTodo(token, todoId));
    });
  };
}

export function pickVote(token, voteId, userId, index) {
  return dispatch => {
    fetch(`${endpoint}/api/pickvote`, {
      headers: {
        "x-access-token": token,
        Accept: "application/json",
        "Content-type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        voteId,
        userId,
        index
      })
    }).then(res => {
      dispatch(getVote(token, voteId));
    });
  };
}

export function getSignUp(firstName, lastName, email, password, callback) {
  return dispatch => {
    fetch(`${endpoint}/api/signup`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password
      })
    }).then(res => {
      res.json().then(data => {
        callback();
      });
    });
  };
}

export function login(email, password, callback, errCallback) {
  return dispatch => {
    dispatch(getLogin());
    fetch(`${endpoint}/api/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    }).then(res => {
      res.json().then(data => {
        console.log(data);
        if (data.success) {
          dispatch(loginSuccess(data));
          callback();
        } else {
          errCallback();
        }
      });
    });
  };
}

export function profilePictureAdded(link) {
  return dispatch => {
    dispatch({
      type: "PROFILE_PICTURE_ADDED",
      link
    });
  };
}

export function logout() {
  return dispatch => {
    dispatch({
      type: "LOGGED_OUT"
    });
  };
}

function loginSuccess(data) {
  return {
    type: "LOGIN_SUCCESS",
    data
  };
}

export function interestChosen(interestId) {
  return {
    type: "INTEREST_CHOSEN",
    interestId
  };
}

export function subInterestChosen(childId) {
  return {
    type: "SUBINTEREST_CHOSEN",
    childId
  };
}

export function groupChosen(groupId) {
  return {
    type: "GROUP_CHOSEN",
    groupId
  };
}

function getInterests() {
  return {
    type: FETCHING_INTERESTS
  };
}

function joining() {
  return {
    type: "JOINING_INTEREST"
  };
}

function getting() {
  return {
    type: "FETCHING_GROUPS"
  };
}

function getLogin() {
  return {
    type: "LOGGING_IN"
  };
}

function getInterestsSuccess(data, id) {
  data.forEach((interest, index) => {
    if (interest.members.indexOf(id) !== -1) {
      data[index].isMember === true;
    } else {
      data[index].isMember === false;
    }
  });
  return {
    type: FETCHING_INTERESTS_SUCCESS,
    data
  };
}

function getTodoSuccess(data) {
  return {
    type: "GETTING_TODO_SUCCESS",
    data
  };
}

function getEventSuccess(data) {
  return {
    type: "GETTING_EVENT_SUCCESS",
    data
  };
}

function getVoteSuccess(data) {
  return {
    type: "GETTING_VOTE_SUCCESS",
    data
  };
}

function gettingTodos() {
  return {
    type: "GETTING_TODO"
  };
}

function getGroupsSuccess(data) {
  return {
    type: "FETCHING_GROUPS_SUCCESS",
    data
  };
}

function gettingEvent() {
  return {
    type: "GETTING_EVENT"
  };
}

function getInterestsFailure() {
  return {
    type: FETCHING_INTERESTS_FAILURE
  };
}
