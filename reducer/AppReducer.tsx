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

const app_reducer = (state: any, action: any) => {
  if (action.type === SET_DATE) {
    return { ...state, currentDate: action.payload };
  }
  if (action.type === UPDATE_LIST_OF_ALL_TABLES) {
    return { ...state, listOfAllTables: action.payload };
  }
  if (action.type === TABLE_AVAILABILITY_MSG) {
    const { show, msg } = action.payload;
    return { ...state, tableAvailabilityMsg: { show, msg } };
  }
  if (action.type === CHANGE_WHICH_FORM_PART_IS_VISIBLE) {
    return { ...state, currentFormPartVisible: action.payload };
  }
  if (action.type === CHANGE_ANIMATION_STATUS) {
    return { ...state, isAnimated: true };
  }
  if (action.type === SHOW_TABLE_OPTIONS_MODAL) {
    return { ...state, tableOptions: !state.tableOptions };
  }
  if (action.type === SEARCH_RESERVATIONS_MODAL) {
    return { ...state, showSearchReservations: !state.showSearchReservations };
  }

  if (action.type === SEARCH_SINGLE_TABLE_RESERVATIONS_MODAL) {
    if (action.payload?.type === 'click') {
      return {
        ...state,
        showSingleTableReservations: false,
        tableOptionsModalPart: 0,
        tableOptions: false,
      };
    } else if (state.tableOptionsModalPart === 3) {
      return {
        ...state,
        showSingleTableReservations: true,
      };
    } else {
      return {
        ...state,
        showSingleTableReservations: false,
        tableOptionsModalPart: 0,
      };
    }
  }
  if (action.type === CHANGE_TABLE_OPTIONS_MODAL_PART) {
    const currentPart = action.payload;
    return { ...state, tableOptionsModalPart: currentPart };
  }
  if (action.type === MANUALLY_BOOK_A_TABLE) {
    const { updatedTable: manuallyBookedTableUpdated, tableSize } =
      action.payload;
    return {
      ...state,
      tableManuallyBooked: manuallyBookedTableUpdated,
      tableSizeWhenManualBooking: tableSize,
    };
  }

  throw new Error(`No Matching "${action.type}" - action type`);
};

export default app_reducer;
