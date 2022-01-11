import {
  TABLE_AVAILABILITY_MSG,
  SET_DATE,
  UPDATE_LIST_OF_ALL_TABLES,
  CHANGE_WHICH_FORM_PART_IS_VISIBLE,
  CHANGE_ANIMATION_STATUS,
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

  throw new Error(`No Matching "${action.type}" - action type`);
};

export default app_reducer;
