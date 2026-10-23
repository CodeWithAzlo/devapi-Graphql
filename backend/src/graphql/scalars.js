// ============================================================
// graphql/scalars.js
// Custom scalars so Date objects and JSON columns serialize cleanly.
// ============================================================

import { GraphQLScalarType, Kind } from 'graphql';

export const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO-8601 date string',
  serialize(value) {
    if (value instanceof Date) return value.toISOString();
    return value;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    return null;
  },
});

export const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON (request bodies, JSON Schema, etc.)',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      try {
        return JSON.parse(ast.value);
      } catch {
        return ast.value;
      }
    }
    if (ast.kind === Kind.INT || ast.kind === Kind.FLOAT || ast.kind === Kind.BOOLEAN) {
      return ast.value;
    }
    return null;
  },
});
