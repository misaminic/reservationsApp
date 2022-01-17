import {
  TABLE_AVAILABILITY_MSG,
  SET_DATE,
  UPDATE_LIST_OF_ALL_TABLES,
  CHANGE_WHICH_FORM_PART_IS_VISIBLE,
  CHANGE_ANIMATION_STATUS,
  SHOW_TABLE_OPTIONS_MODAL,
  CHANGE_TABLE_OPTIONS_MODAL_PART,
  MANUALLY_BOOK_A_TABLE,
} from '../actions';

const app_reducer = (state, action) => {
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
  if (action.type === CHANGE_TABLE_OPTIONS_MODAL_PART) {
    const currentPart = action.payload;
    return { ...state, tableOptionsModalPart: currentPart };
  }
  if (action.type === MANUALLY_BOOK_A_TABLE) {
    const { updatedTable: manuallyBookedTableUpdated, tableSize } =
      action.payload;
    console.log(manuallyBookedTableUpdated, tableSize, 'iz ReDUCERA');
    return {
      ...state,
      tableManuallyBooked: manuallyBookedTableUpdated,
      tableSizeWhenManualBooking: tableSize,
    };
  }

  throw new Error(`No Matching "${action.type}" - action type`);
};

export default app_reducer;
