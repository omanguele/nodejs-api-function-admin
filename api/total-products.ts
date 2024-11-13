import { VercelRequest, VercelResponse } from '@vercel/node';
import Shopify from 'shopify-api-node';

// Remplacer par vos informations Shopify
const shopDomain = 'noel-a-lhopital.myshopify.com';  // Domaine de votre boutique
const apiKey = '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';  // Clé API privée de Shopify
const apiPassword = '487ce62bbf1395f5a4b96ff9ab309896';  // Mot de passe de l'API privée

// Configurer Shopify API client
const shopify = new Shopify({
  shopName: shopDomain,
  apiKey: apiKey,
  password: apiPassword
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {

    res.status(200).json({ shopify });
    // Récupérer les commandes avec l'API Shopify
    const orders = await shopify.order.list({
      status: 'any',
      financial_status: 'paid',
      limit: 250, // Nombre maximum d'ordres récupérés (peut être ajusté)
    });

    let totalProducts = 0;

    // Parcourir toutes les commandes et additionner le nombre de produits
    orders.forEach((order: any) => {
      order.line_items.forEach((item: any) => {
        totalProducts += item.quantity;
      });
    });

    // Renvoyer le nombre total de produits commandés
    
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
