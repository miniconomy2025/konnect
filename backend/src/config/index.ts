import app from "../app.ts";
import "../logging.ts";
import { mongoConnect } from './mongoose.ts'


const start = async() => {
    await mongoConnect();

    app.listen(8000, () => {
        console.log("Server started at http://localhost:8000");
    });
}

start();