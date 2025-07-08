// utils/localStorage.js
import localforage from 'localforage';

localforage.config({
    name: 'Charada',
    storeName: 'transacciones'
});

export default localforage;
