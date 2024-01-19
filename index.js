import app from "./app.js";
import "dotenv/config.js"

const port = process.env.PORT

app.listen(port, () => {
  console.log("Server is listining on Port : " , port);
});