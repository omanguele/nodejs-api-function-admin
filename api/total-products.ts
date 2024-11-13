import { VercelRequest, VercelResponse } from '@vercel/node';
import Shopify from 'shopify-api-node';

// Informations de connexion Shopify
const apiKeyShopify = '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'; // Votre clé API privée
const apiSecret = '487ce62bbf1395f5a4b96ff9ab309896'; // Votre mot de passe API privé
const shopifyDomain = 'noel-a-lhopital.myshopify.com'; // Domaine de votre boutique

// Créer une instance de Shopify avec vos informations de connexion
const shopify = new Shopify({
  shopName: shopifyDomain,
  apiKey: apiKeyShopify,
  password: apiSecret,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Récupérer toutes les commandes avec un statut 'paid' (payé)
    const orders = await shopify.order.list({
      financial_status: 'paid',
      status: 'any', // Toutes les commandes, peu importe leur statut
    });

    let totalProducts = 0;

    // Parcourir toutes les commandes et additionner les quantités des produits
    orders.forEach((order: any) => {
      order.line_items.forEach((item: any) => {
        totalProducts += item.quantity;
      });
    });

    // Retourner le nombre total de produits commandés
    res.status(200).json({ totalProducts });
  } catch (error) {
    // Gérer les erreurs et les exceptions
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
