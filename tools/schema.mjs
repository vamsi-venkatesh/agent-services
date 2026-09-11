// A small JSON Schema checker. It supports the subset of draft 2020-12 used by
// the two schemas in schema/: $ref to local $defs, type, const, enum, required,
// properties, additionalProperties (boolean), items, minItems, minLength,
// minimum, pattern. Anything else in a schema is ignored rather than guessed at,
// so a keyword added to a schema without support here silently passes; keep the
// two in step.

const typeOf = (value) => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isInteger(value)) return 'integer';
  return typeof value;
};

const matchesType = (value, expected) => {
  const actual = typeOf(value);
  if (expected === 'number') return actual === 'number' || actual === 'integer';
  if (expected === 'integer') return actual === 'integer';
  return actual === expected;
};

function resolve(ref, root) {
  if (!ref.startsWith('#/')) throw new Error(`Unsupported $ref ${ref}`);
  let node = root;
  for (const segment of ref.slice(2).split('/')) {
    node = node[segment.replace(/~1/g, '/').replace(/~0/g, '~')];
    if (node === undefined) throw new Error(`Unresolvable $ref ${ref}`);
  }
  return node;
}

function check(value, schema, root, path, errors) {
  if (schema === true || schema === undefined) return;
  if (schema === false) {
    errors.push(`${path}: no value is allowed here`);
    return;
  }
  if (schema.$ref) {
    check(value, resolve(schema.$ref, root), root, path, errors);
    return;
  }
  if ('const' in schema && JSON.stringify(value) !== JSON.stringify(schema.const)) {
    errors.push(`${path}: expected ${JSON.stringify(schema.const)}`);
  }
  if (schema.enum && !schema.enum.some((option) => JSON.stringify(option) === JSON.stringify(value))) {
    errors.push(`${path}: ${JSON.stringify(value)} is not one of ${schema.enum.map((o) => JSON.stringify(o)).join(', ')}`);
  }
  if (schema.type) {
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!allowed.some((expected) => matchesType(value, expected))) {
      errors.push(`${path}: expected ${allowed.join(' or ')}, found ${typeOf(value)}`);
      return;
    }
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${path}: shorter than ${schema.minLength} characters`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${path}: ${JSON.stringify(value)} does not match ${schema.pattern}`);
    }
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${path}: below the minimum of ${schema.minimum}`);
    }
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${path}: fewer than ${schema.minItems} items`);
    }
    if (schema.items) {
      value.forEach((item, index) => check(item, schema.items, root, `${path}[${index}]`, errors));
    }
    return;
  }
  if (value !== null && typeof value === 'object') {
    for (const key of schema.required ?? []) {
      if (!(key in value)) errors.push(`${path}: missing required property ${key}`);
    }
    for (const [key, subschema] of Object.entries(schema.properties ?? {})) {
      if (key in value) check(value[key], subschema, root, `${path}.${key}`, errors);
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in (schema.properties ?? {}))) errors.push(`${path}: unexpected property ${key}`);
      }
    }
  }
}

/** Returns an array of human-readable errors. An empty array means valid. */
export function validate(value, schema, path = '$') {
  const errors = [];
  check(value, schema, schema, path, errors);
  return errors;
}
