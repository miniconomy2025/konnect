import "@js-temporal/polyfill";

import app from "../app.ts";
import "../logging.ts";


const start = async() => {
    app.listen(8000, () => {
        console.log("Server started at http://localhost:8000");
    });
}

start();