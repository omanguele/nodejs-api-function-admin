import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

// Remplacer par vos informations Shopify
const shopDomain = 'noel-a-lhopital.myshopify.com';  // Domaine de votre boutique
const accessToken = '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';  // Token d'accès (X-Shopify-Access-Token)

// URL de l'API Admin de Shopify pour GraphQL
const graphqlUrl = `https://${shopDomain}/admin/api/2024-10/graphql.json`;

// Définir la requête GraphQL pour récupérer les commandes et les produits
const query = (cursor: string | null) => `
  query {
    orders(first: 250, query: "financial_status:paid", after: ${cursor ? `"${cursor}"` : "null"}) {
      edges {
        node {
          id
          lineItems(first: 250) {
            edges {
              node {
                title
                quantity
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  let totalProducts = 0;
  let hasNextPage = true;
  let cursor = null;

  try {
    // Boucle pour récupérer toutes les pages
    while (hasNextPage) {
      const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,  // Utilisation du token d'accès
        },
        body: JSON.stringify({ query: query(cursor) })
      });

      const data = await response.json();

      if (response.ok) {
        // Parcourir les commandes et additionner le nombre de produits dans chaque ligne de commande
        data.data.orders.edges.forEach((order: any) => {
          order.node.lineItems.edges.forEach((item: any) => {
            if (item.node.title !== "Don") {  // Exclure le produit "Don"
              totalProducts += item.node.quantity;
            }
          });
        });

        // Mettre à jour la pagination
        hasNextPage = data.data.orders.pageInfo.hasNextPage;
        cursor = data.data.orders.pageInfo.endCursor;
      } else {
        res.status(response.status).json({ error: '', details: data });
        return;
      }
    }

    // Renvoyer le nombre total de produits commandés
    res.status(200).json({ totalProducts });

  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
