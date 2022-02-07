import React, { useState, useContext, useReducer, useEffect } from 'react';

import axios from 'axios';
import reducer from '../reducer/AppReducer';
import tables from '../amountOfTables';
import freshCopyTableList from '../freshCopyTableList';

import {
  TABLE_AVAILABILITY_MSG,
  SET_DATE,
  UPDATE_LIST_OF_ALL_TABLES,
  CHANGE_WHICH_FORM_PART_IS_VISIBLE,
  CHANGE_ANIMATION_STATUS,
  SHOW_TABLE_OPTIONS_MODAL,
  CHANGE_TABLE_OPTIONS_MODAL_PART,
  MANUALLY_BOOK_A_TABLE,
  SEARCH_RESERVATIONS_MODAL,
  SEARCH_SINGLE_TABLE_RESERVATIONS_MODAL,
} from '../actions';

type InitialStateType = {
  tableAvailabilityMsg: {};
  showTableAvailabilityMsg: {};
  tableOptions: boolean;
  showSearchReservations: boolean;
  showSingleTableReservations: boolean;
  tableOptionsModalPart: number;
  listOfAllTables: [{}];
  currentDate: any;
  currentFormPartVisible: number;
  isAnimated: boolean;
  tableManuallyBooked: {};
  tableSizeWhenManualBooking: number;
  tablesStates: [{}];
};

const initialState = {
  tableAvailabilityMsg: { show: false, msg: '' },
  showTableAvailabilityMsg: { show: false, msg: '' },
  tableOptions: false,
  showSearchReservations: false,
  showSingleTableReservations: false,
  tableOptionsModalPart: 0,
  listOfAllTables: tables,
  currentDate: '',
  currentFormPartVisible: 0,
  isAnimated: true,
  tableManuallyBooked: {},
  tableSizeWhenManualBooking: 0,
  tablesStates: [
    { id: 1, occupied: false },
    { id: 2, occupied: false },
    { id: 3, occupied: false },
    { id: 4, occupied: false },
    { id: 5, occupied: false },
    { id: 6, occupied: false },
    { id: 7, occupied: false },
    { id: 8, occupied: false },
    { id: 10, occupied: false },
    { id: 11, occupied: false },
    { id: 12, occupied: false },
    { id: 13, occupied: false },
    { id: 14, occupied: false },
    { id: 15, occupied: false },
    { id: 20, occupied: false },
    { id: 30, occupied: false },
    { id: 31, occupied: false },
    { id: 32, occupied: false },
    { id: 33, occupied: false },
    { id: 34, occupied: false },
    { id: 40, occupied: false },
    { id: 41, occupied: false },
    { id: 42, occupied: false },
    { id: 43, occupied: false },
    { id: 44, occupied: false },
    { id: 50, occupied: false },
    { id: 51, occupied: false },
    { id: 52, occupied: false },
  ],
};
//@ts-ignore
const AppContext = React.createContext();

export const AppProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [dataFromDb, setDataFromDb] = useState<any>([]);

  // Async function to help fetch items from the DB and pass params used to query DB

  const axiosFetch = async () => {
    const getData = await axios.get('/api/reserveTable', {
      params: { dateChosen: state.currentDate },
    });
    setDataFromDb(getData);
  };

  useEffect(() => {}, [state.tableOptionsModalPart]);

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
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  };

  useEffect(() => {
    if (dataFromDb.data?.reservations?.tables) {
      updateListOfAllTables(dataFromDb.data.reservations.tables);
    } else {
      //@ts-ignore

      updateListOfAllTables(freshCopyTableList);
    }
  }, [dataFromDb]);

  useEffect(() => {
    if (state.tableManuallyBooked.id && state.tableSizeWhenManualBooking > 0) {
      const currentList = state.listOfAllTables.filter((item: any) => {
        return item.tables.filter((table: any) => {
          // Case when disabled table is clicked

          // if(table.id === state.tableManuallyBooked?.id && state.tableManuallyBooked?.availability === false  ) {#
          //   showTableAvailabilityMsg(false, 'If you would like to book this, please enable it for booking first')
          // }

          if (table.id === state.tableManuallyBooked?.id) {
            if (state.tableManuallyBooked?.reservedTimes.length > 0) {
              const currentTimeToAddIndex =
                state.tableManuallyBooked.reservedTimes.length - 1;

              const currentCustomerToAddIndex =
                state.tableManuallyBooked.customers.length - 1;
              //@ts-ignore

              table?.customers = [
                ...table.customers,
                {
                  tableNumber: state.tableManuallyBooked.id,
                  name: state.tableManuallyBooked.customers[
                    currentCustomerToAddIndex
                  ].name.toLowerCase(),
                  email:
                    state.tableManuallyBooked.customers[
                      currentCustomerToAddIndex
                    ].email,
                  time: state.tableManuallyBooked?.reservedTimes[
                    currentTimeToAddIndex
                  ],
                },
              ];
              //@ts-ignore

              table?.reservedTimes = [
                ...table.reservedTimes,
                state.tableManuallyBooked?.reservedTimes[currentTimeToAddIndex],
              ];
              return table;
            } else {
              const currentTimeToAddIndex =
                state.tableManuallyBooked.reservedTimes.length - 1;

              const currentCustomerToAddIndex =
                state.tableManuallyBooked.customers.length - 1;
              //@ts-ignore

              table?.customers = [
                {
                  tableNumber: state.tableManuallyBooked.id,
                  name: state.tableManuallyBooked.customers[
                    currentCustomerToAddIndex
                  ].name.toLowerCase(),
                  email:
                    state.tableManuallyBooked.customers[
                      currentCustomerToAddIndex
                    ].email,
                  time: state.tableManuallyBooked?.reservedTimes[
                    currentTimeToAddIndex
                  ],
                },
              ];
              //@ts-ignore

              table?.reservedTimes = [
                state.tableManuallyBooked?.reservedTimes[currentTimeToAddIndex],
              ];
              return table;
            }
          }
        });
      });
      updateListOfAllTables(currentList);
      sendData();
    }
  }, [state.tableManuallyBooked]);

  const setDate = (currentDate: any) => {
    dispatch({
      type: SET_DATE,
      payload: currentDate,
    });
  };

  const changeCurrentFormPartVisible = (formPartNumber: number) => {
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

  const updateListOfAllTables = (updatedListOfAllTables: [{}]) => {
    dispatch({
      type: UPDATE_LIST_OF_ALL_TABLES,
      payload: updatedListOfAllTables,
    });
  };

  const showTableAvailabilityMsg = (show: boolean, msg: string) => {
    dispatch({
      type: TABLE_AVAILABILITY_MSG,
      payload: { show, msg },
    });
  };

  const showTableOptionsModal = () => {
    dispatch({
      type: SHOW_TABLE_OPTIONS_MODAL,
    });
  };

  const showSearchReservationsModal = () => {
    dispatch({
      type: SEARCH_RESERVATIONS_MODAL,
    });
  };

  const showSingleTableReservationsModal = (e: any) => {
    dispatch({
      type: SEARCH_SINGLE_TABLE_RESERVATIONS_MODAL,
      payload: e,
    });
  };

  const changeTableOptionsModalPart = (currentPart: number) => {
    dispatch({
      type: CHANGE_TABLE_OPTIONS_MODAL_PART,
      payload: currentPart,
    });
  };

  const manuallyBookATable = (updatedTable: {}, tableSize: number) => {
    dispatch({
      type: MANUALLY_BOOK_A_TABLE,
      payload: { updatedTable, tableSize },
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
        showTableOptionsModal,
        showSearchReservationsModal,
        showSingleTableReservationsModal,
        changeTableOptionsModalPart,
        manuallyBookATable,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
