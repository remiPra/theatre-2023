import { createSlice } from '@reduxjs/toolkit';



const initialState = {

  items: [

    { id: 1, name: 'Item 1', quantity: 5 },

    { id: 2, name: 'Item 2', quantity: 3 },

    { id: 3, name: 'Item 3', quantity: 2 }

  ]

};



const itemsSlice = createSlice({

  name: 'items',

  initialState,

  reducers: {

    addItem: (state, action) => {

      const newItem = action.payload;

      state.items.push(newItem);

    },

    removeItem: (state, action) => {

      const itemId = action.payload;

      state.items = state.items.filter(item => item.id !== itemId);

    },

    updateQuantity: (state, action) => {

      const { itemId, newQuantity } = action.payload;

      const item = state.items.find(item => item.id === itemId);

      if (item) {

        item.quantity = newQuantity;

      }

    }

  }

});



export const { addItem, removeItem, updateQuantity } = itemsSlice.actions;

export default itemsSlice.reducer;