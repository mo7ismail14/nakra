import QRCode from 'qrcode';
import { config } from '../config/index.js';

const QR_OPTIONS = { width: 512, margin: 2, errorCorrectionLevel: 'M' };

export const menuUrl = (restaurant) => `${config.publicMenuUrl}/${restaurant.slug}`;

/**
 * Four QR codes per restaurant (null when the info is missing):
 *  - menu: link to the public menu page
 *  - instapay: the restaurant InstaPay payment link
 *  - vodafoneCash: the Vodafone Cash wallet number (as text)
 *  - vodafoneCashInstapay: InstaPay link that pays into the Vodafone Cash wallet
 * Each one is { value, dataUrl } where dataUrl is a PNG ready for <img src>.
 */
export async function restaurantQrCodes(restaurant) {
  const p = restaurant.payments || {};
  const entries = {
    menu: menuUrl(restaurant),
    instapay: p.instapayLink,
    vodafoneCash: p.vodafoneCashNumber,
    vodafoneCashInstapay: p.vodafoneCashInstapayLink,
  };
  const result = {};
  for (const [key, value] of Object.entries(entries)) {
    result[key] = value ? { value, dataUrl: await QRCode.toDataURL(value, QR_OPTIONS) } : null;
  }
  return result;
}
