import React from 'react';
import { createStore } from 'redux';
import {
  Provider,
  connect,
  useSelector,
  useDispatch
} from 'react-redux';
import './App.css';

interface AppStateModel {
    count: number;
}
const countReducer = function(state: AppStateModel = defaultAppStateModel, action: any) {
  switch (action.type) {
    case "ADD" :
      return {...state,
        count: state.count + 1,
      };
    case "SUBTRACT" :
      return {...state,
        count: state.count - 1,
      };
    default:
      return state;
  }
}

const defaultAppStateModel: AppStateModel = {
  count: 0,
}

const mapStateToProps = function(state: AppStateModel) {
  return {
    count: state.count
  }
}

const mapDispatchToProps = function(dispatch : any) {
  return {
    add: () => dispatch({type: "ADD"}),
    subtract: () => dispatch({type: "SUBTRACT"})
  }
}

const Component = ({count, add, subtract} : any) => {
  return (<>
    <h1>Count = {count}</h1>
    <button onClick={add}>Add</button>
    <button onClick={subtract}>Subtract</button>
  </>)
}

const Container = connect(mapStateToProps, mapDispatchToProps)(Component);
const store = createStore(countReducer);
function App() {
  return (
      <Provider store={store}>
        <Container/>
      </Provider>
  );
}

export default App;
