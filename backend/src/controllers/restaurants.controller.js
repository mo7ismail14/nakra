import * as restaurants from '../services/restaurant.service.js';
import * as invitations from '../services/invitation.service.js';

export async function list(req, res) {
  res.json({ restaurants: await restaurants.list(req.user) });
}

export async function get(req, res) {
  res.json({ restaurant: await restaurants.getById(req.params.id) });
}

export async function create(req, res) {
  res.status(201).json({ restaurant: await restaurants.create(req.body, req.file, req.user.id) });
}

export async function update(req, res) {
  res.json({ restaurant: await restaurants.update(req.params.id, req.body, req.file) });
}

export async function remove(req, res) {
  await restaurants.remove(req.params.id);
  res.status(204).end();
}

export async function qrCodes(req, res) {
  res.json({ qrCodes: await restaurants.qrCodes(req.params.id) });
}

export async function sendInvitation(req, res) {
  res.json(await invitations.sendInvitation(req.params.id, req.body.email));
}

export async function revokeInvitation(req, res) {
  await invitations.revokeInvitation(req.params.id);
  res.status(204).end();
}

export async function removeOwner(req, res) {
  await invitations.removeOwner(req.params.id);
  res.status(204).end();
}
