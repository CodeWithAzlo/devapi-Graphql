import { GraphQLError } from 'graphql';
import { db } from '../db/index.js';

export async function listWorkspaces({ search, limit = 20, offset = 0, sort = 'ASC' }) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    db.workspace.findMany({
      where,
      orderBy: { name: sort === 'DESC' ? 'desc' : 'asc' },
      take: Math.min(limit, 50),
      skip: offset,
    }),
    db.workspace.count({ where }),
  ]);

  return { items, total, limit, offset };
}

export async function getWorkspace({ id, slug }) {
  if (!id && !slug) {
    throw new GraphQLError('Provide workspace id or slug', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  return db.workspace.findFirst({
    where: id ? { id } : { slug },
  });
}

function slugify(name) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return base || 'workspace';
}

export async function createWorkspace({ name, description }, owner) {
  if (!name || !name.trim()) {
    throw new GraphQLError('Workspace name is required', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  let slug = slugify(name);
  let n = 1;
  while (await db.workspace.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${slugify(name)}-${n}`;
  }

  return db.workspace.create({
    data: {
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      ownerId: owner.id,
      members: {
        create: { userId: owner.id, role: 'OWNER' },
      },
    },
  });
}

export async function deleteWorkspace(id) {
  const existing = await db.workspace.findUnique({ where: { id } });
  if (!existing) {
    throw new GraphQLError('Workspace not found', { extensions: { code: 'NOT_FOUND' } });
  }
  // Cascade: members, APIs, versions, endpoints, parameters, schemas, examples, changes, changelogs.
  await db.workspace.delete({ where: { id } });
  return true;
}
