// Netlify Serverless Function for Universal HUSNEX Comments System
// Fully CORS-enabled for cross-device synchronization between mobile and desktop

let inMemoryComments = [];

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(inMemoryComments)
      };
    }

    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      if (!data.name || !data.text) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name and text required' }) };
      }
      const item = {
        id: data.id || ('c_' + Date.now().toString(36)),
        type: 'comment',
        date: data.date || new Date().toISOString(),
        name: data.name,
        role: data.role || 'Collaborator',
        rating: data.rating || 5,
        text: data.text,
        pending: data.pending !== undefined ? data.pending : true
      };
      inMemoryComments.unshift(item);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, item })
      };
    }

    if (event.httpMethod === 'PATCH') {
      const data = JSON.parse(event.body || '{}');
      const targetId = event.queryStringParameters?.id || data.id;
      const target = inMemoryComments.find(c => c.id === targetId);
      if (target) {
        if (data.pending !== undefined) target.pending = data.pending;
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, item: target })
      };
    }

    if (event.httpMethod === 'DELETE') {
      const targetId = event.queryStringParameters?.id;
      inMemoryComments = inMemoryComments.filter(c => c.id !== targetId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
