import multer from 'multer';
import { nanoid } from 'nanoid';
import { badRequest } from '../utils/httpError.js';

const MAX_MB = 3;
const MIME_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

// Check the real file content, not just the mime type the browser claims.
function looksLikeImage(buffer) {
  if (!buffer || buffer.length < 12) return false;
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const isWebp = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  return isJpeg || isPng || isWebp;
}

// Files stay in memory here; services save them through src/storage only when the request is valid.
function imageUpload(field) {
  const single = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_MB * 1024 * 1024, files: 1, fields: 30 },
    fileFilter: (_req, file, cb) =>
      MIME_EXT[file.mimetype] ? cb(null, true) : cb(badRequest('Only JPG, PNG or WEBP images are allowed')),
  }).single(field);

  return (req, res, next) =>
    single(req, res, (err) => {
      if (err) return next(err);
      if (req.file) {
        if (!looksLikeImage(req.file.buffer)) return next(badRequest('The file is not a valid image'));
        req.file.filename = `${nanoid(16)}.${MIME_EXT[req.file.mimetype]}`;
      }
      next();
    });
}

export const UPLOAD_MAX_MB = MAX_MB;
export const uploadLogo = imageUpload('logo');
export const uploadItemImage = imageUpload('image');
