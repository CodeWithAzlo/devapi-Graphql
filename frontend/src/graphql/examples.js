export const EXAMPLE_QUERIES = [
  {
    id: 'nested',
    title: 'Nested docs in one request',
    hint: 'This is why GraphQL fits API catalogs — REST would hit many URLs.',
    variables: '{}',
    query: `query NestedDocs {
  workspace(slug: "acme-shop") {
    name
    slug
    owner { name email }
    apis {
      name
      baseUrl
      currentVersion { version }
      endpoints {
        method
        path
        parameters { name location required type }
      }
    }
  }
}`,
  },
  {
    id: 'pick-fields',
    title: 'Ask only for what you need',
    hint: 'Same API, fewer fields — the server skips the rest.',
    variables: '{}',
    query: `query NamesOnly {
  workspaces {
    total
    items { name slug }
  }
}`,
  },
  {
    id: 'variables',
    title: 'Variables + search',
    hint: 'Change "q" in Variables without rewriting the query.',
    variables: `{
  "q": "pay"
}`,
    query: `query SearchWorkspaces($q: String) {
  workspaces(search: $q, limit: 10) {
    total
    items {
      name
      slug
      description
      apis { name }
    }
  }
}`,
  },
  {
    id: 'filter',
    title: 'Filter endpoints by method',
    hint: 'Arguments on nested fields: endpoints(method: POST).',
    variables: '{}',
    query: `query OnlyPosts {
  workspace(slug: "acme-shop") {
    apis {
      name
      endpoints(method: POST, search: "order") {
        method
        path
        summary
        schemas { kind name json }
      }
    }
  }
}`,
  },
  {
    id: 'breaking',
    title: 'Breaking changes (v1 → v2)',
    hint: 'Looks up version ids, then filters by severity.',
    variables: '{}',
    query: `query ShopVersionsThenDiff {
  workspace(slug: "acme-shop") {
    apis {
      name
      versions { id version isCurrent }
    }
  }
}`,
  },
  {
    id: 'payments',
    title: 'Second workspace: Payments',
    hint: 'Dummy seed data — same query shape, different slug.',
    variables: '{}',
    query: `query PaymentsApi {
  workspace(slug: "payments") {
    name
    members { role user { name } }
    apis {
      name
      endpoints {
        method
        path
        examples { name request response }
      }
    }
  }
}`,
  },
  {
    id: 'login',
    title: 'Login (mutation) — get JWT',
    hint: 'No Bearer header needed for this one. Copy accessToken for later.',
    variables: `{
  "email": "test@gmail.com",
  "password": "Dev@123"
}`,
    query: `mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    accessToken
    refreshToken
    user { name email }
  }
}`,
  },
  {
    id: 'create-ws',
    title: 'Create a workspace (mutation)',
    hint: 'Needs Authorization: Bearer <accessToken>. You become OWNER.',
    variables: `{
  "name": "My Team",
  "description": "Created from the Explorer"
}`,
    query: `mutation AddWorkspace($name: String!, $description: String) {
  createWorkspace(name: $name, description: $description) {
    id
    name
    slug
    owner { name }
  }
}`,
  },
  {
    id: 'delete-ws',
    title: 'Delete a workspace (mutation)',
    hint: 'OWNER only. Cascades: members, APIs, versions, endpoints, schemas, examples.',
    variables: `{
  "id": "paste-workspace-id"
}`,
    query: `mutation RemoveWorkspace($id: ID!) {
  deleteWorkspace(id: $id)
}`,
  },
  {
    id: 'delete-api',
    title: 'Delete one API (mutation)',
    hint: 'OWNER/ADMIN. Removes that API and its versions/endpoints. Workspace stays.',
    variables: `{
  "id": "paste-api-id"
}`,
    query: `mutation RemoveApi($id: ID!) {
  deleteApi(id: $id)
}`,
  },
];
