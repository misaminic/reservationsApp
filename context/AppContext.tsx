import React, {
  useState,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';

import axios from 'axios';
import reducer from '../reducer/AppReducer';
import tables from '../amountOfTables';

import {
  TABLE_AVAILABILITY_MSG,
  SET_DATE,
  UPDATE_LIST_OF_ALL_TABLES,
  CHANGE_WHICH_FORM_PART_IS_VISIBLE,
  CHANGE_ANIMATION_STATUS,
} from '../actions';

const initialState = {
  tableAvailabilityMsg: { show: false, msg: '' },
  showTableAvailabilityMsg: { show: false, msg: '' },
  tableOptions: true,
  listOfAllTables: tables,
  currentDate: '',
  currentFormPartVisible: 0,
  isAnimated: true,
};

const AppContext = React.createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [dataFromDb, setDataFromDb] = useState([]);

  useEffect(() => {
    console.log(state.currentFormPartVisible, state.isAnimated);
    // console.log(dataFromDb, 'DA vidimo radi li FETCH');
  }, [state]);

  // Async function to help fetch items from the DB and pass params used to query DB

  const axiosFetch = async () => {
    const bla = await axios.get('/api/reserveTable', {
      params: { dateChosen: state.currentDate },
    });
    setDataFromDb(bla);
    // console.log('ODradio FETCH OPET');
  };

  useEffect(() => {
    axiosFetch();
  }, [state.currentDate]);

  const sendData = () => {
    const { listOfAllTables, currentDate } = state;
    if (currentDate) {
      fetch('/api/reserveTable', {
        method: 'POST',
        body: JSON.stringify({
          state: {
            date: currentDate,
            tables: listOfAllTables,
            kurac: 'jede',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    console.log(listOfAllTables, currentDate, 'usao u SEND DATA');
    // setTimeout(() => {
    //   dispatch({ type: FEEDBACK_SUBMITING_FINISHED });
    // }, 3000);
  };

  const submitReservationToDB = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const date = new Date();
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = `${date.getFullYear()}`;

    const hour = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const postedTime = `${day}/${month}/${year}, ${hour}:${minutes}h`;

    const timeStamp = _.now();
    setTimeout(() => {
      dispatch({
        type: SUBMIT_RESERVATION_TO_DB,
        payload: { postedTime, timeStamp },
      });
    }, 2000);
  };

  const setDate = (currentDate) => {
    dispatch({
      type: SET_DATE,
      payload: currentDate,
    });
  };

  const changeCurrentFormPartVisible = (formPartNumber) => {
    dispatch({
      type: CHANGE_WHICH_FORM_PART_IS_VISIBLE,
      payload: formPartNumber,
    });
  };

  const changeAnimationStatus = () => {
    dispatch({
      type: CHANGE_ANIMATION_STATUS,
    });
  };

  const updateListOfAllTables = (updatedListOfAllTables) => {
    // console.log(updatedListOfAllTables, 'iz update list');
    dispatch({
      type: UPDATE_LIST_OF_ALL_TABLES,
      payload: updatedListOfAllTables,
    });
  };

  const showTableAvailabilityMsg = (show, msg) => {
    dispatch({
      type: TABLE_AVAILABILITY_MSG,
      payload: { show, msg },
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        setDate,
        dataFromDb,
        sendData,
        axiosFetch,
        changeAnimationStatus,
        updateListOfAllTables,
        changeCurrentFormPartVisible,
        showTableAvailabilityMsg,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
