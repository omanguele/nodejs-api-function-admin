import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

// Remplacez par vos informations Shopify
const apiKey = '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';  // Clé API privée de Shopify
const apiPassword = '487ce62bbf1395f5a4b96ff9ab309896';  // Mot de passe de l'API privée
const shopDomain = 'noel-a-lhopital.myshopify.com';  // Domaine de votre boutique

// URL pour récupérer les commandes
const ordersUrl = `https://${apiKey}:${apiPassword}@${shopDomain}/admin/api/2023-10/orders.json?status=any&financial_status=paid`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const response = await fetch(ordersUrl);

    // Vérifier le statut de la réponse
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const data = await response.json();

    // Afficher la réponse pour déboguer
    console.log('Réponse de l\'API Shopify:', data);

    if (!data.orders) {
      throw new Error('Aucune commande trouvée');
    }

    let totalProducts = 0;

    // Parcourir toutes les commandes et additionner le nombre de produits
    data.orders.forEach((order: any) => {
      order.line_items.forEach((item: any) => {
        totalProducts += item.quantity;
      });
    });

    // Renvoyer le nombre total de produits commandés
    res.status(200).json({ totalProducts });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

