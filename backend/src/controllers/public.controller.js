import * as restaurants from '../services/restaurant.service.js';

export async function menu(req, res) {
  res.set('Cache-Control', 'public, max-age=30');
  res.json({ menu: await restaurants.publicMenu(req.params.slug) });
}
