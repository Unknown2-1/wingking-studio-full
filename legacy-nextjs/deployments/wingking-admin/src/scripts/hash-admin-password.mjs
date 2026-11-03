import { randomBytes, scryptSync } from 'node:crypto';
// Hash locally: run ADMIN_NEW_PASSWORD='...' node scripts/hash-admin-password.mjs
// Avoid storing the password in a tracked project file or sending it in chat.
const password = process.env.ADMIN_NEW_PASSWORD;
if (!password || password.length < 14) {
  console.error('Set ADMIN_NEW_PASSWORD (minimum 14 characters) in the local terminal environment.');
  process.exit(1);
}
const salt = randomBytes(24);
const hash = scryptSync(password, salt, 64);
console.log(`${salt.toString('hex')}:${hash.toString('hex')}`);
