export const SET_HEATMAP = "SET_HEATMAP";
export const SET_WIDTH = "SET_WIDTH";
export const SET_HEIGHT = "SET_HEIGHT";
export const SET_DAYS_LABEL_TRANSFORM = "SET_DAYS_LABEL_TRANSFORM";
export const SET_MONTHS_LABEL_WRAPPER_TRANSFORM = "SET_MONTHS_LABEL_TRANSFORM";
export const SET_LEGEND_TRANSFORM = "SET_LEGEND_TRANSFORM";

export const reducer = (state, action) => {
  switch (action.type) {
    case SET_HEATMAP:
      return { ...state, heatmap: action.payload };
    case SET_WIDTH:
      return { ...state, width: action.payload };
    case SET_HEIGHT:
      return { ...state, height: action.payload };
    case SET_DAYS_LABEL_TRANSFORM:
      return { ...state, daysLabelWrapperTransform: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};
