const initialState = {
  enabled: false, // Watermark is disabled by default
};

const WatermarkReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ENABLE_WATERMARK':
      return {...state, enabled: true};
    case 'DISABLE_WATERMARK':
      return {...state, enabled: false};
    default:
      return state;
  }
};

export default WatermarkReducer;
