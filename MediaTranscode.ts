import { Platform } from 'react-native';

// Best-effort media normalization helpers. If ffmpeg-kit is not installed,
// these functions gracefully no-op and return inputs.

const nowStamp = () => Date.now();

const getExt = (uri: string) => {
  try {
    const clean = uri.split('?')[0].split('#')[0];
    const idx = clean.lastIndexOf('.');
    if (idx >= 0) return clean.substring(idx + 1).toLowerCase();
  } catch {}
  return '';
};

const stripQuery = (uri: string) => {
  try { return uri.split('?')[0].split('#')[0]; } catch { return uri; }
};

function resolveSiblingPath(ext: string, fromFileUri: string): { path: string; uri: string } {
  const base = stripQuery(fromFileUri).replace(/^file:\/\//, '');
  const dirIdx = base.lastIndexOf('/');
  const dir = dirIdx >= 0 ? base.substring(0, dirIdx) : base;
  const path = `${dir}/drift_${nowStamp()}.${ext}`;
  const uri = `file://${path}`;
  return { path, uri };
}

export async function normalizeVideoToMp4(inputUri: string): Promise<string> {
  try {
    const scheme = String(inputUri).split(':')[0];
    const ext = getExt(inputUri);
    if (ext === 'mp4') return inputUri;
    if (scheme !== 'file') return inputUri; // only handle local file paths
    const ff = (() => { try { return require('ffmpeg-kit-react-native'); } catch { return null; } })();
    if (!ff || !ff.FFmpegKit) return inputUri;
    const inPath = inputUri.replace(/^file:\/\//, '');
    const { path: outPath, uri: outUri } = resolveSiblingPath('mp4', inputUri);
    const cmd = `-y -i ${JSON.stringify(inPath)} -c:v libx264 -preset veryfast -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k ${JSON.stringify(outPath)}`;
    const session = await ff.FFmpegKit.execute(cmd);
    const returnCode = await session.getReturnCode?.();
    if (returnCode && typeof returnCode.isValueSuccess === 'function' && !returnCode.isValueSuccess(returnCode.getValue?.())) {
      // Failed – keep original
      return inputUri;
    }
    return outUri;
  } catch {
    return inputUri;
  }
}

export async function normalizeAudioToM4a(inputUri: string): Promise<string> {
  try {
    const scheme = String(inputUri).split(':')[0];
    const ext = getExt(inputUri);
    if (ext === 'm4a' || ext === 'mp4' || ext === 'aac') return inputUri;
    if (scheme !== 'file') return inputUri; // only handle local files
    const ff = (() => { try { return require('ffmpeg-kit-react-native'); } catch { return null; } })();
    if (!ff || !ff.FFmpegKit) return inputUri;
    const inPath = inputUri.replace(/^file:\/\//, '');
    const { path: outPath, uri: outUri } = resolveSiblingPath('m4a', inputUri);
    const cmd = `-y -i ${JSON.stringify(inPath)} -vn -c:a aac -b:a 128k ${JSON.stringify(outPath)}`;
    const session = await ff.FFmpegKit.execute(cmd);
    const returnCode = await session.getReturnCode?.();
    if (returnCode && typeof returnCode.isValueSuccess === 'function' && !returnCode.isValueSuccess(returnCode.getValue?.())) {
      return inputUri;
    }
    return outUri;
  } catch {
    return inputUri;
  }
}
