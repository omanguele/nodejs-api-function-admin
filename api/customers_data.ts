import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

// Remplacer par vos informations Shopify
const shopDomain = 'noel-a-lhopital.myshopify.com';  // Domaine de votre boutique
const accessToken = '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';  // Token d'accès (X-Shopify-Access-Token)

// URL de l'API Admin de Shopify pour GraphQL
const graphqlUrl = `https://${shopDomain}/admin/api/2024-10/graphql.json`;

// Requête GraphQL pour récupérer les informations des deux dernières commandes payées
const query = `
  query {
    orders(first: 2, query: "financial_status:paid", sortKey: CREATED_AT) {
      edges {
        node {
          id
          customer {
            firstName
            lastName
          }
        }
      }
    }
  }
`;

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
      // Récupérer les deux dernières commandes
      const customers = data.data.orders.edges.map((order: any) => {
        const customer = order.node.customer;
        return {
          firstName: customer ? customer.firstName : 'Inconnu',
          lastName: customer ? customer.lastName : 'Inconnu',
        };
      });

      // Renvoyer les prénoms des clients
      res.status(200).json({ customers });
    } else {
      // Gestion des erreurs si la requête échoue
      res.status(response.status).json({ error: 'Erreur lors de la récupération des données', details: data });
    }
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête GraphQL:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
