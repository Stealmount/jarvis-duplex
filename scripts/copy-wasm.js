const fs = require('fs');
const path = require('path');

const wasmSrc = path.join(__dirname, '../node_modules/onnxruntime-web/dist');
const wasmDest = path.join(__dirname, '../public/ort-wasm');

if (!fs.existsSync(wasmDest)) fs.mkdirSync(wasmDest, { recursive: true });

if (fs.existsSync(wasmSrc)) {
  const wasmFiles = fs.readdirSync(wasmSrc).filter(f => f.endsWith('.wasm') || f.endsWith('.mjs'));
  wasmFiles.forEach(file => {
    fs.copyFileSync(path.join(wasmSrc, file), path.join(wasmDest, file));
  });
  console.log(`✅ Copied ${wasmFiles.length} ONNX WASM files to /public/ort-wasm`);
} else {
  console.log('⚠  onnxruntime-web/dist not found — skipping ONNX WASM copy');
}

const vadSrc = path.join(__dirname, '../node_modules/@ricky0123/vad-web/dist');
const vadDest = path.join(__dirname, '../public/vad');

if (!fs.existsSync(vadDest)) fs.mkdirSync(vadDest, { recursive: true });

if (fs.existsSync(vadSrc)) {
  const vadFiles = fs.readdirSync(vadSrc).filter(f => f.endsWith('.wasm') || f.endsWith('.ort') || f.endsWith('.js') || f.endsWith('.onnx'));
  vadFiles.forEach(file => {
    fs.copyFileSync(path.join(vadSrc, file), path.join(vadDest, file));
  });
  console.log(`✅ Copied ${vadFiles.length} VAD files to /public/vad`);
} else {
  console.log('⚠  @ricky0123/vad-web/dist not found — skipping VAD file copy');
}

console.log('✅ WASM files copied to /public');
