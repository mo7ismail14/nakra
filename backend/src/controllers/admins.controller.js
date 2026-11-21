import * as admins from '../services/admin.service.js';

export async function list(_req, res) {
  res.json({ admins: await admins.listAdmins() });
}

export async function create(req, res) {
  res.status(201).json(await admins.createAdmin(req.body.email, req.user.id));
}

export async function resendSetup(req, res) {
  res.json(await admins.resendSetupLink(req.params.id));
}

export async function remove(req, res) {
  await admins.deleteAdmin(req.params.id, req.user.id);
  res.status(204).end();
}
