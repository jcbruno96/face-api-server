const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const faceApiService = require("./faceapiService");

const app = express();
const port = process.env.PORT || 3000;

// CORS
app.use(cors());

app.use(fileUpload());

app.post("/upload", async (req, res) => {
  const { file, file2 } = req.files;

  const similarity = await faceApiService.detect(file.data, file2.data);

  res.json({
    "Misma persona": similarity,
  });
});

app.listen(port, () => {
  console.log("Server started on port" + port);
});
