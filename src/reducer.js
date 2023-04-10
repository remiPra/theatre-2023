import { configureStore } from "@reduxjs/toolkit";
import itemsReducer from './store';

const store = configureStore({
  reducer: {
    items: itemsReducer
  }
});

export default store;
