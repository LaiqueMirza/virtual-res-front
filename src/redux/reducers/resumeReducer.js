// Initial state
const initialState = {
  resumeViewsId: null,
};

// Action types
export const SET_RESUME_VIEWS_ID = 'SET_RESUME_VIEWS_ID';

// Action creators
export const setResumeViewsId = (id) => ({
  type: SET_RESUME_VIEWS_ID,
  payload: id,
});

// Reducer
const resumeReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_RESUME_VIEWS_ID:
      return {
        ...state,
        resumeViewsId: action.payload,
      };
    default:
      return state;
  }
};

export default resumeReducer;