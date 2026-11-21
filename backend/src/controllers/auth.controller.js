import * as auth from '../services/auth.service.js';

export async function login(req, res) {
  res.json(await auth.login(req.body.email, req.body.password));
}

export function me(req, res) {
  res.json({ user: auth.publicUser(req.user) });
}

export async function forgotPassword(req, res) {
  await auth.requestPasswordReset(req.body.email);
  res.json({ message: 'If this email exists, a reset link has been sent.' });
}

export async function resetInfo(req, res) {
  res.json(await auth.getResetInfo(req.params.token));
}

export async function resetPassword(req, res) {
  res.json(await auth.resetPassword(req.body.token, req.body.password));
}
