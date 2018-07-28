const initialState = {
  events: [],
  isFetching: false,
  error: false
};

export default function eventReducer(state = initialState, action) {
  switch (action.type) {
    case "GETTING_EVENT":
      return {
        ...state,
        isFetching: true
      };
    case "GETTING_EVENT_SUCCESS":
      console.log(action.data);
      return {
        ...state,
        isFetching: false,
        events: addEvent(action.data, state.events)
      };
    default:
      return state;
  }
}

function addEvent(event, events) {
  const index = events.findIndex(i => i._id === event._id);
  if (index === -1) {
    return events.concat(event);
  } else {
    const copy = events;
    events[index] = event;
    return copy;
  }
}
