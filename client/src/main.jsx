import React from "react";
import ReactDOM from "react-dom/client";

import "./styles/globals.css";

import App from "./App";
import {JournalProvider} from "./context/JournalContext";

ReactDOM.createRoot(document.getElementById("root")).render(

    <React.StrictMode>

        <JournalProvider>
            <App />
        </JournalProvider>

    </React.StrictMode>

);

// App

// ↓

// JournalProvider

// ↓

// Dashboard