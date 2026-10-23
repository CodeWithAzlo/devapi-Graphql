// ============================================================
// graphql/typeDefs.js
//
// This is the public contract. The React app (and the Explorer)
// can only ask for fields that exist here.
//
// Why GraphQL for API docs:
//   One round-trip can load workspace → APIs → versions →
//   endpoints → parameters. REST would need many URLs.
// ============================================================

export const typeDefs = `#graphql
  scalar DateTime
  scalar JSON

  enum Role { OWNER ADMIN MEMBER VIEWER }
  enum HttpMethod { GET POST PUT PATCH DELETE HEAD OPTIONS }
  enum VersionStatus { DRAFT PUBLISHED }
  enum ParameterLocation { PATH QUERY HEADER COOKIE }
  enum SchemaKind { REQUEST RESPONSE }
  enum ChangeSeverity { NON_BREAKING POTENTIALLY_BREAKING BREAKING }
  enum ChangeType {
    ENDPOINT_ADDED
    ENDPOINT_REMOVED
    METHOD_CHANGED
    PARAMETER_ADDED
    PARAMETER_REMOVED
    REQUIRED_CHANGED
    FIELD_ADDED
    FIELD_REMOVED
    TYPE_CHANGED
  }
  enum SortOrder { ASC DESC }

  type DatabaseHealth {
    connected: Boolean!
    users: Int!
    workspaces: Int!
    apis: Int!
    endpoints: Int!
  }

  type Health {
    status: String!
    message: String!
    phase: Int!
    timestamp: String!
    database: DatabaseHealth!
  }

  type ProjectInfo {
    name: String!
    phase: String!
    description: String!
  }

  type User {
    id: ID!
    email: String!
    name: String!
    createdAt: DateTime!
  }

  type WorkspaceMember {
    id: ID!
    role: Role!
    user: User!
    createdAt: DateTime!
  }

  type Workspace {
    id: ID!
    name: String!
    slug: String!
    description: String
    owner: User!
    members: [WorkspaceMember!]!
    apis: [Api!]!
    createdAt: DateTime!
  }

  type WorkspaceConnection {
    items: [Workspace!]!
    total: Int!
    limit: Int!
    offset: Int!
  }

  type Api {
    id: ID!
    name: String!
    description: String
    baseUrl: String
    workspace: Workspace!
    currentVersion: ApiVersion
    versions: [ApiVersion!]!
    """Endpoints on the current version. Pass method/search to filter."""
    endpoints(method: HttpMethod, search: String): [ApiEndpoint!]!
    createdAt: DateTime!
  }

  type ApiVersion {
    id: ID!
    version: String!
    status: VersionStatus!
    isCurrent: Boolean!
    notes: String
    publishedAt: DateTime
    endpoints(method: HttpMethod, search: String): [ApiEndpoint!]!
    changelog: [ApiChangelog!]!
  }

  type ApiEndpoint {
    id: ID!
    method: HttpMethod!
    path: String!
    summary: String
    description: String
    deprecated: Boolean!
    parameters: [ApiParameter!]!
    schemas: [ApiSchema!]!
    examples: [ApiExample!]!
  }

  type ApiParameter {
    id: ID!
    name: String!
    location: ParameterLocation!
    type: String!
    required: Boolean!
    description: String
    example: String
  }

  type ApiSchema {
    id: ID!
    kind: SchemaKind!
    name: String!
    contentType: String!
    statusCode: Int
    json: JSON!
  }

  type ApiExample {
    id: ID!
    name: String!
    statusCode: Int
    request: JSON
    response: JSON
  }

  type ApiChange {
    id: ID!
    changeType: ChangeType!
    severity: ChangeSeverity!
    summary: String!
    details: JSON
    createdAt: DateTime!
  }

  type ApiChangelog {
    id: ID!
    title: String!
    body: String!
    createdAt: DateTime!
  }

  type Query {
    health: Health!
    projectInfo: ProjectInfo!

    """Search + paginate workspaces. Try search: \\"shop\\" in the Explorer."""
    workspaces(
      search: String
      limit: Int = 20
      offset: Int = 0
      sort: SortOrder = ASC
    ): WorkspaceConnection!

    """Look up by id or slug (slug is easier to type: acme-shop)."""
    workspace(id: ID, slug: String): Workspace

    apis(workspaceId: ID, search: String): [Api!]!
    api(id: ID!): Api

    endpoint(id: ID!): ApiEndpoint

    apiVersions(apiId: ID!): [ApiVersion!]!

    apiChanges(
      fromVersionId: ID!
      toVersionId: ID!
      severity: ChangeSeverity
    ): [ApiChange!]!

    changelog(versionId: ID!): [ApiChangelog!]!

    """The logged-in user. Null if there is no valid access token."""
    currentUser: User
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  type Mutation {
    """Create an account. Returns JWT tokens."""
    register(name: String!, email: String!, password: String!): AuthPayload!

    """Log in. Returns JWT tokens. Put accessToken in Authorization: Bearer ..."""
    login(email: String!, password: String!): AuthPayload!

    """Get a new access token using the refresh token."""
    refreshToken(refreshToken: String!): AuthPayload!

    """Logged-in only. You become OWNER of the new workspace."""
    createWorkspace(name: String!, description: String): Workspace!

    """OWNER/ADMIN. Creates v1 plus GET/POST/PUT/PATCH/DELETE docs from resource."""
    createApi(
      workspaceId: ID!
      name: String!
      description: String
      baseUrl: String
      """Path resource, e.g. products → /products and /products/:id"""
      resource: String
    ): Api!

    """Fill an empty API with the same starter CRUD docs."""
    generateCrudEndpoints(apiId: ID!, resource: String): Api!

    """Add one extra endpoint to the current version."""
    createEndpoint(
      apiId: ID!
      method: HttpMethod!
      path: String!
      summary: String
      description: String
    ): ApiEndpoint!

    """OWNER only. Deletes the workspace and every API / endpoint under it."""
    deleteWorkspace(id: ID!): Boolean!

    """OWNER/ADMIN. Deletes one API and all of its versions and endpoints."""
    deleteApi(id: ID!): Boolean!
  }
`;
