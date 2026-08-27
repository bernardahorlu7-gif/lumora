const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Local filesystem adapter. Files are namespaced by an entity folder
 * (e.g. project id) so uploads stay organized on disk.
 */
const localAdapter = {
  driver: 'local',

  async save({ buffer, originalName, folder = 'misc' }) {
    const dir = path.join(UPLOAD_ROOT, folder);
    ensureDir(dir);
    const ext = path.extname(originalName) || '';
    const key = `${folder}/${uuidv4()}${ext}`;
    fs.writeFileSync(path.join(UPLOAD_ROOT, key), buffer);
    return { storageKey: key, driver: 'local' };
  },

  async read(storageKey) {
    return fs.readFileSync(path.join(UPLOAD_ROOT, storageKey));
  },

  async delete(storageKey) {
    const full = path.join(UPLOAD_ROOT, storageKey);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  },

  absolutePath(storageKey) {
    return path.join(UPLOAD_ROOT, storageKey);
  },
};

/**
 * S3 adapter STUB. Not wired up — fill in with @aws-sdk/client-s3 calls and
 * flip STORAGE_DRIVER=s3 in .env once S3_* credentials are available.
 * The method signatures match localAdapter so no route code needs to change.
 */
const s3Adapter = {
  driver: 's3',
  async save() {
    throw new Error(
      'S3 storage is not configured yet. Fill in src/services/storage.js s3Adapter using ' +
      'S3_BUCKET / S3_REGION / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY from .env, ' +
      'then set STORAGE_DRIVER=s3.'
    );
  },
  async read() { throw new Error('S3 storage is not configured yet.'); },
  async delete() { throw new Error('S3 storage is not configured yet.'); },
};

function getStorage() {
  const driver = process.env.STORAGE_DRIVER || 'local';
  return driver === 's3' ? s3Adapter : localAdapter;
}

module.exports = { getStorage, UPLOAD_ROOT };
