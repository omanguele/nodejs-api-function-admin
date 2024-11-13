import express, { Request, Response } from 'express';
import fetch from 'node-fetch';

// Remplacez par vos informations Shopify
const apiKey = 'f88f60c4f0c78043da45fb5141b18148';  // Clé API privée de Shopify
const apiPassword = '487ce62bbf1395f5a4b96ff9ab309896';  // Mot de passe de l'API privée
const shopDomain = 'noel-a-lhopital.myshopify.com';  // Domaine de votre boutique

// Créez l'application Express
const app = express();
const port = 3000; // Le port sur lequel votre serveur écoutera

// URL pour récupérer les commandes
const ordersUrl = `https://${apiKey}:${apiPassword}@${shopDomain}/admin/api/2023-10/orders.json?status=any&financial_status=paid`;

// Endpoint pour récupérer le nombre total de produits commandés
app.get('/api/total-products-ordered', async (req: Request, res: Response) => {
  try {
    const response = await fetch(ordersUrl);
    const data = await response.json();

    let totalProducts = 0;

    // Parcourir toutes les commandes et additionner le nombre de produits
    data.orders.forEach((order: any) => {
      order.line_items.forEach((item: any) => {
        totalProducts += item.quantity;
      });
    });

    // Renvoyer le nombre total de produits commandés
    res.json({ totalProducts });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
