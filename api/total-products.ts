import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const apiKeyShopify = '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';
const apiSecret = '487ce62bbf1395f5a4b96ff9ab309896';
const shopifyDomain = 'noel-a-lhopital.myshopify.com';

const ordersUrl = `https://${shopifyDomain}/admin/api/2023-10/orders.json?status=any&financial_status=paid`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Effectuer la requête HTTP vers Shopify avec axios
    const response = await axios.get(ordersUrl, {
      auth: {
        username: apiKeyShopify,
        password: apiSecret,
      },
    });

    const data = response.data;
    let totalProducts = 0;

    // Calculer le nombre total de produits dans les commandes
    data.orders.forEach((order: any) => {
      order.line_items.forEach((item: any) => {
        totalProducts += item.quantity;
      });
    });

    // Renvoyer la réponse une seule fois
    return res.status(200).json({ totalProducts });
  } catch (error) {
    // Assurez-vous que vous ne répondez qu'une seule fois
    console.error('Erreur lors de la récupération des commandes:', error);
    
    // Si une erreur se produit, nous envoyons une réponse d'erreur
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}
