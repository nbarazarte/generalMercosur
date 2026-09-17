import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Por defecto usa LocalStorage
import plantillaReducer from './plantillaSlice';

// 1. Combinamos los reducers (esto prepara el store para futuros slices)
const rootReducer = combineReducers({
    plantilla: plantillaReducer,
});

// 2. Definimos la configuración de persistencia
const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    // whitelist: ['plantilla'] // Opcional: si solo quieres persistir este slice
};

// 3. Creamos el reducer persistente
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Configuramos el store con el middleware necesario para evitar errores de validación
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

// 5. Exportamos el persistor que usaremos en main.jsx
export const persistor = persistStore(store);