const http = require('http');
const os = require('os');
const path = require('path');
const { promises: fs } = require('fs');
const { spawn } = require('child_process');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage();

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk.toString('utf8');
      if (raw.length > 1024 * 1024) {
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function runLibreOffice(inputPath, outputDir) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'libreoffice',
      [
        '--headless',
        '--convert-to',
        'pdf',
        '--outdir',
        outputDir,
        inputPath,
      ],
      { stdio: 'pipe' },
    );

    let stderr = '';
    child.stderr.on('data', chunk => {
      stderr += chunk.toString('utf8');
    });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || `LibreOffice failed with code ${code}`));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/healthz') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== 'POST' || req.url !== '/convert') {
    return sendJson(res, 404, { error: 'Not found' });
  }

  try {
    const body = await parseBody(req);
    const token = process.env.CONVERTER_SHARED_TOKEN || '';
    if (token && req.headers['x-converter-token'] !== token) {
      return sendJson(res, 401, { error: 'Unauthorized' });
    }

    const bucketName = String(body.bucketName || '').trim();
    const sourcePath = String(body.sourcePath || '').trim();
    const outputPath = String(body.outputPath || '').trim();
    if (!bucketName || !sourcePath || !outputPath) {
      return sendJson(res, 400, { error: 'bucketName, sourcePath, and outputPath are required' });
    }

    const bucket = storage.bucket(bucketName);
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ppt-convert-'));
    const inputPath = path.join(tempDir, path.basename(sourcePath));
    const outputDir = path.join(tempDir, 'output');
    await fs.mkdir(outputDir, { recursive: true });

    await bucket.file(sourcePath).download({ destination: inputPath });
    await runLibreOffice(inputPath, outputDir);

    const pdfFileName = `${path.parse(path.basename(sourcePath)).name}.pdf`;
    const pdfPath = path.join(outputDir, pdfFileName);
    await bucket.upload(pdfPath, {
      destination: outputPath,
      metadata: { contentType: 'application/pdf' },
    });

    return sendJson(res, 200, {
      ok: true,
      outputPath,
      pdfFileName,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: error?.message || 'Conversion failed',
    });
  }
});

server.listen(process.env.PORT || 8080);
