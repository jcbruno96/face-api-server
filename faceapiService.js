const path = require("path");

const tf = require("@tensorflow/tfjs-node");

const faceapi = require("@vladmandic/face-api/dist/face-api.node.js");
const modelPathRoot = "./models";

let optionsSSDMobileNet;
const threshold = 0.6;

// Recibe la imagen, le decodifica en un objeto de Tensorflow
async function image(file) {
  const decoded = tf.node.decodeImage(file);
  const casted = decoded.toFloat();
  const result = casted.expandDims(0);
  decoded.dispose();
  casted.dispose();
  return result;
}

// Recibe un objeto Tensorflow, detecta la cara y retorna el descriptor de 128 puntos
async function detect(tensor) {
  const result = await faceapi
    .detectSingleFace(tensor, optionsSSDMobileNet)
    .withFaceLandmarks()
    .withFaceDescriptor();

  return result?.descriptor || null;
}

// Se inicializa face-api,tensorflow y se localiza los modelos
async function main(file, file2) {
  // Se inicializa tensorflow
  await faceapi.tf.setBackend("tensorflow");
  await faceapi.tf.enableProdMode();
  await faceapi.tf.ENV.set("DEBUG", false);
  await faceapi.tf.ready();

  console.log(
    `Version: TensorFlow/JS ${faceapi.tf?.version_core} FaceAPI ${
      faceapi.version.faceapi
    } Backend: ${faceapi.tf?.getBackend()}`
  );

  const modelPath = path.join(__dirname, modelPathRoot);

  // Se cargan los modelos
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.5,
  });

  // Se transforma la primer imagen
  const tensor = await image(file);
  // Se detecta la cara y se obtiene el descriptor
  const result = await detect(tensor);

  // Se transforma la segunda imagen
  const tensor2 = await image(file2);
  // Se detecta la cara y se obtiene el descriptor
  const result2 = await detect(tensor2);

  // Si no existe alguno de los resultados, devuelve error
  if (!result || !result2)
    return [false, "Uno de los descriptores no es válido"];

  // Se realiza la distancia euclidea entre los 128 puntos
  // de cada descriptor de cada cara
  const distance = faceapi.euclideanDistance(result, result2);
  console.log("DISTANCE: ", distance);

  tensor.dispose();

  // Se evalua si la distancia euclidea es menor el umbral,
  // es decir, estamos hablando de la misma persona.
  const similarity = distance < threshold;
  return [
    similarity,
    similarity ? "Validación correcta" : "Error en la validación",
  ];
}

module.exports = {
  detect: main,
};

// computeFaceDescriptor
// -
