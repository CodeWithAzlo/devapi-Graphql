// ============================================================
// graphql/operations.js
// Queries the dashboard pages send through Apollo Client.
// The Explorer lets you type *any* query; these are the ones
// the screens themselves use.
// ============================================================

import { gql } from '@apollo/client';

export const DASHBOARD_QUERY = gql`
  query Dashboard {
    health {
      status
      message
      database {
        connected
        users
        workspaces
        apis
        endpoints
      }
    }
    workspaces(limit: 10) {
      total
      items {
        id
        name
        slug
        description
        owner {
          id
          name
        }
        apis {
          id
          name
        }
      }
    }
  }
`;

export const WORKSPACES_QUERY = gql`
  query Workspaces($search: String) {
    workspaces(search: $search, limit: 20) {
      total
      items {
        id
        name
        slug
        description
        owner {
          id
          name
          email
        }
        apis {
          id
          name
        }
      }
    }
  }
`;

export const WORKSPACE_QUERY = gql`
  query Workspace($id: ID!) {
    workspace(id: $id) {
      id
      name
      slug
      description
      owner {
        id
        name
        email
      }
      members {
        role
        user {
          id
          name
          email
        }
      }
      apis {
        id
        name
        description
        baseUrl
        currentVersion {
          version
          status
        }
        endpoints {
          method
          path
        }
      }
    }
  }
`;

export const API_DOCS_QUERY = gql`
  query ApiDocs($id: ID!, $method: HttpMethod, $search: String) {
    api(id: $id) {
      id
      name
      description
      baseUrl
      workspace {
        id
        name
        owner {
          id
        }
        members {
          role
          user {
            id
          }
        }
      }
      currentVersion {
        id
        version
        notes
      }
      versions {
        id
        version
        isCurrent
        status
      }
      endpoints(method: $method, search: $search) {
        id
        method
        path
        summary
        description
        deprecated
        parameters {
          name
          location
          type
          required
          description
          example
        }
        schemas {
          kind
          name
          statusCode
          json
        }
        examples {
          name
          statusCode
          request
          response
        }
      }
    }
  }
`;

export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($name: String!, $description: String) {
    createWorkspace(name: $name, description: $description) {
      id
      name
      slug
      description
    }
  }
`;

export const CREATE_API = gql`
  mutation CreateApi(
    $workspaceId: ID!
    $name: String!
    $description: String
    $baseUrl: String
    $resource: String
  ) {
    createApi(
      workspaceId: $workspaceId
      name: $name
      description: $description
      baseUrl: $baseUrl
      resource: $resource
    ) {
      id
      name
    }
  }
`;

export const GENERATE_CRUD = gql`
  mutation GenerateCrud($apiId: ID!, $resource: String) {
    generateCrudEndpoints(apiId: $apiId, resource: $resource) {
      id
      name
    }
  }
`;

export const CREATE_ENDPOINT = gql`
  mutation CreateEndpoint(
    $apiId: ID!
    $method: HttpMethod!
    $path: String!
    $summary: String
  ) {
    createEndpoint(apiId: $apiId, method: $method, path: $path, summary: $summary) {
      id
      method
      path
    }
  }
`;

export const DELETE_WORKSPACE = gql`
  mutation DeleteWorkspace($id: ID!) {
    deleteWorkspace(id: $id)
  }
`;

export const DELETE_API = gql`
  mutation DeleteApi($id: ID!) {
    deleteApi(id: $id)
  }
`;
