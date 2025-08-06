import "@js-temporal/polyfill";

import { getLogger } from "@logtape/logtape";
import app from "../app.ts";
import "../logging.ts";

const logger = getLogger('backend');

const start = async() => {
    app.listen(8000, '0.0.0.0', () => {
        logger.info("Server started at http://0.0.0.0:8000");
        // logger.info("Server started at http://localhost:8000");
    });
    
    /*
    Uncomment the localhost version and comment the above for local development
    But make sure to recomment on push. Dankie
    */
   
    // app.listen(8000, () => {
    //     logger.info("Server started at http://localhost:8000");
    // });
}

start();