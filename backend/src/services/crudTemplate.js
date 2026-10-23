// ============================================================
// services/crudTemplate.js
// When a user creates an API, we auto-build standard REST docs
// from the resource they typed (e.g. "products" → GET /products).
// ============================================================

export function toResourcePath(resource, apiName) {
  const raw = (resource || apiName || 'items').trim().toLowerCase();
  const cleaned = raw
    .replace(/\s+api$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!cleaned) return 'items';
  if (cleaned.endsWith('s')) return cleaned;
  return `${cleaned}s`;
}

function singular(plural) {
  if (plural.endsWith('ies')) return `${plural.slice(0, -3)}y`;
  if (plural.endsWith('ses')) return plural.slice(0, -2);
  if (plural.endsWith('s') && !plural.endsWith('ss')) return plural.slice(0, -1);
  return plural;
}

function title(text) {
  return text
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function sampleItem(one) {
  return {
    id: 1,
    name: `Sample ${one}`,
    createdAt: '2026-01-15T10:00:00Z',
  };
}

function itemSchema(one) {
  return {
    type: 'object',
    properties: {
      id: { type: 'integer', description: `${title(one)} id` },
      name: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  };
}

function writeBodySchema(one) {
  return {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', description: `Name of the ${one}` },
    },
  };
}

/**
 * Nested Prisma `create` payloads for 6 REST endpoints.
 */
export function crudEndpointCreates(resource) {
  const list = toResourcePath(resource);
  const one = singular(list);
  const label = title(list);
  const item = sampleItem(one);
  const schema = itemSchema(one);
  const body = writeBodySchema(one);
  const idParam = {
    name: 'id',
    location: 'PATH',
    type: 'integer',
    required: true,
    description: `${title(one)} id`,
    example: '1',
  };

  return [
    {
      method: 'GET',
      path: `/${list}`,
      summary: `List ${label.toLowerCase()}`,
      description: `Returns a paginated list of ${label.toLowerCase()}. Built from your resource name.`,
      parameters: {
        create: [
          { name: 'page', location: 'QUERY', type: 'integer', required: false, example: '1', description: 'Page number' },
          { name: 'limit', location: 'QUERY', type: 'integer', required: false, example: '20', description: 'Page size' },
        ],
      },
      schemas: {
        create: [
          {
            kind: 'RESPONSE',
            name: `${title(one)}List`,
            statusCode: 200,
            schema: { type: 'array', items: schema },
          },
        ],
      },
      examples: {
        create: [{ name: 'Default', statusCode: 200, request: { query: { page: 1 } }, response: [item] }],
      },
    },
    {
      method: 'POST',
      path: `/${list}`,
      summary: `Create a ${one}`,
      description: `Creates a new ${one}.`,
      schemas: {
        create: [
          { kind: 'REQUEST', name: `Create${title(one)}`, schema: body },
          { kind: 'RESPONSE', name: title(one), statusCode: 201, schema },
        ],
      },
      examples: {
        create: [
          {
            name: 'Create',
            statusCode: 201,
            request: { name: `New ${one}` },
            response: item,
          },
        ],
      },
    },
    {
      method: 'GET',
      path: `/${list}/:id`,
      summary: `Get one ${one}`,
      description: `Fetch a single ${one} by id.`,
      parameters: { create: [idParam] },
      schemas: {
        create: [
          { kind: 'RESPONSE', name: title(one), statusCode: 200, schema },
          {
            kind: 'RESPONSE',
            name: 'NotFound',
            statusCode: 404,
            schema: { type: 'object', properties: { error: { type: 'string' } } },
          },
        ],
      },
      examples: {
        create: [
          {
            name: 'Found',
            statusCode: 200,
            request: { path: { id: 1 } },
            response: item,
          },
        ],
      },
    },
    {
      method: 'PUT',
      path: `/${list}/:id`,
      summary: `Replace a ${one}`,
      description: `Full replace of a ${one}.`,
      parameters: { create: [idParam] },
      schemas: {
        create: [
          { kind: 'REQUEST', name: `Replace${title(one)}`, schema: body },
          { kind: 'RESPONSE', name: title(one), statusCode: 200, schema },
        ],
      },
      examples: {
        create: [
          {
            name: 'Replace',
            statusCode: 200,
            request: { path: { id: 1 }, body: { name: `Updated ${one}` } },
            response: { ...item, name: `Updated ${one}` },
          },
        ],
      },
    },
    {
      method: 'PATCH',
      path: `/${list}/:id`,
      summary: `Update a ${one}`,
      description: `Partial update of a ${one}.`,
      parameters: { create: [idParam] },
      schemas: {
        create: [
          {
            kind: 'REQUEST',
            name: `Patch${title(one)}`,
            schema: { type: 'object', properties: { name: { type: 'string' } } },
          },
          { kind: 'RESPONSE', name: title(one), statusCode: 200, schema },
        ],
      },
      examples: {
        create: [
          {
            name: 'Patch',
            statusCode: 200,
            request: { path: { id: 1 }, body: { name: `Patched ${one}` } },
            response: { ...item, name: `Patched ${one}` },
          },
        ],
      },
    },
    {
      method: 'DELETE',
      path: `/${list}/:id`,
      summary: `Delete a ${one}`,
      description: `Removes a ${one} by id.`,
      parameters: { create: [idParam] },
      schemas: {
        create: [
          {
            kind: 'RESPONSE',
            name: 'Deleted',
            statusCode: 204,
            schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
          },
        ],
      },
      examples: {
        create: [
          {
            name: 'Deleted',
            statusCode: 204,
            request: { path: { id: 1 } },
            response: { ok: true },
          },
        ],
      },
    },
  ];
}
