const initialState = {
  todos: [],
  isFetching: false,
  error: false
};

export default function todoReducer(state = initialState, action) {
  switch (action.type) {
    case "GETTING_TODO":
      return {
        ...state,
        isFetching: true
      };
    case "GETTING_TODO_SUCCESS":
      return {
        ...state,
        isFetching: false,
        todos: addTodo(action.data, state.todos)
      };
    default:
      return state;
  }
}

function addTodo(todo, todos) {
  const index = todos.findIndex(i => i._id === todo._id);
  if (index === -1) {
    return todos.concat(todo);
  } else {
    const copy = todos;
    todos[index] = todo;
    return copy;
  }
}
