import localforage from 'localforage';

// Configuración única para toda la app
localforage.config({
    name: 'CharadaApp',       // Nombre general de la app
    storeName: 'charada_db',  // Nombre único para IndexedDB
    driver: [
        localforage.INDEXEDDB,
        localforage.WEBSQL,
        localforage.LOCALSTORAGE
    ]
});

export default localforage;