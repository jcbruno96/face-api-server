const express = require("express");
const { response, request } = require("express");
const cors = require("cors");
//const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const faceApiService = require("./faceapiService");

const app = express();
const port = process.env.PORT || 3000;

// CORS
app.use(cors());

// Lectura y parseo del body
app.use(express.json());

app.use(fileUpload());
//app.use(bodyParser.json());

app.post("/upload", async (req = request, res) => {
  console.log("Body: ", req.body);
  console.log("Files: ", req.files);

  if (!req.files)
    return res.status(400).json({
      message: "Files required",
    });

  const { file, file2 } = req.files;

  if (!file || !file2)
    return res.status(400).json({
      message: "File required",
    });

  const [similarity, message] = await faceApiService.detect(
    file.data,
    file2.data
  );

  res.json({
    similarity,
    message,
  });
});

app.post("/test", async (req, res) => {
  console.log("Body: ", req.body);
  console.log("Files: ", req.files);

  res.json({
    message: "Test working",
  });
});

app.listen(port, () => {
  console.log("Server started on port" + port);
});
