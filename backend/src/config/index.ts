import app from "../app.ts";
import "../logging.ts";

app.listen(process.env.PORT, () => {
  console.log(`Server started at http://localhost:${process.env.PORT}}`);
});
