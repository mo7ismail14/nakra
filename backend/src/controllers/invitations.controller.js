import * as invitations from '../services/invitation.service.js';

export async function info(req, res) {
  res.json(await invitations.getInvitation(req.params.token));
}

export async function accept(req, res) {
  res.json(await invitations.acceptInvitation(req.params.token, req.body.password));
}
