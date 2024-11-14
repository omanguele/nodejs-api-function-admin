import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

// Remplacer par vos informations Shopify
const shopDomain = 'noel-a-lhopital.myshopify.com';  // Domaine de votre boutique
const accessToken = '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';  // Token d'accès (X-Shopify-Access-Token)

// URL de l'API Admin de Shopify pour GraphQL
const graphqlUrl = https://${shopDomain}/admin/api/2024-10/graphql.json;

// Définir la requête GraphQL pour récupérer les commandes et les produits
const query = 
  query {
    orders(first: 250, query: "financial_status:paid") {
      edges {
        node {
          id
          lineItems(first: 250) {
            edges {
              node {
                title
                quantity
                id
              }
            }
          }
        }
      }
    }
  }
;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    // Effectuer la requête GraphQL avec fetch
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,  // Utilisation du token d'accès
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();

    if (response.ok) {
      let totalProducts = 0;

      // Parcourir les commandes et additionner le nombre de produits dans chaque ligne de commande
      data.data.orders.edges.forEach((order: any) => {
        order.node.lineItems.edges.forEach((item: any) => {
          if ( item.node.id != 49184372293936 )
          totalProducts += item.node.quantity;
        });
      });

      // Renvoyer le nombre total de produits commandés
      res.status(200).json({ totalProducts });
    } else {
      // Gestion des erreurs si la requête échoue
      res.status(response.status).json({ error: 'Erreur lors de la récupération des données', details: data });
    }
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête GraphQL:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
