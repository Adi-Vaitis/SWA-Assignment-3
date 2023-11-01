import logo from './logo.svg';
import './App.css';
import { createStore } from 'redux';
import {
    Provider,
    connect,
    useSelector,
    useDispatch
} from 'react-redux';
const countReducer = function(state = defaultAppStateModel, action) {
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

const defaultAppStateModel = {
    count: 0,
}

const mapStateToProps = function(state) {
    return {
        count: state.count
    }
}

const mapDispatchToProps = function(dispatch) {
    return {
        add: () => dispatch({type: "ADD"}),
        subtract: () => dispatch({type: "SUBTRACT"})
    }
}

const Component = ({count, add, subtract}) => {
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
