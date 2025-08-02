import "@js-temporal/polyfill";

import { getLogger } from "@logtape/logtape";
import app from "../app.ts";
import "../logging.ts";
import { mongoConnect } from './mongoose.ts';

const logger = getLogger('backend');


const start = async() => {
    await mongoConnect();

    app.listen(8000, () => {
        logger.info("Server started at http://localhost:8000");
    });
}

start();