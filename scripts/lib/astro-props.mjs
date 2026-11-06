import ts from 'typescript';

/** Return the frontmatter (code between the first two `---` fences) of an .astro file. */
function frontmatter(source) {
  const match = source.match(/^\s*---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : '';
}

const squash = (text) => text.replace(/\s+/g, ' ').trim();

/** Find the top-level `Props` declaration members (interface or type literal). */
function propsMembers(sf) {
  for (const node of sf.statements) {
    if (ts.isInterfaceDeclaration(node) && node.name.text === 'Props') return node.members;
    if (
      ts.isTypeAliasDeclaration(node) &&
      node.name.text === 'Props' &&
      ts.isTypeLiteralNode(node.type)
    ) {
      return node.type.members;
    }
  }
  return [];
}

function parse(source) {
  return ts.createSourceFile('frontmatter.ts', frontmatter(source), ts.ScriptTarget.Latest, true);
}

/**
 * Read `interface Props` from an .astro file's frontmatter.
 * @param {string} source
 * @returns {Record<string, { type: string; required: boolean }>}
 */
export function extractProps(source) {
  const sf = parse(source);
  /** @type {Record<string, { type: string; required: boolean }>} */
  const props = {};
  for (const member of propsMembers(sf)) {
    if (!ts.isPropertySignature(member) || !member.name) continue;
    props[member.name.getText(sf).replace(/^['"]|['"]$/g, '')] = {
      type: member.type ? squash(member.type.getText(sf)) : 'any',
      required: !member.questionToken,
    };
  }
  return props;
}

/**
 * Read JSDoc descriptions and destructuring defaults, to help authors fill the registry.
 * @param {string} source
 * @returns {Record<string, { description?: string; default?: string }>}
 */
export function extractPropDocs(source) {
  const sf = parse(source);
  /** @type {Record<string, { description?: string; default?: string }>} */
  const docs = {};
  for (const member of propsMembers(sf)) {
    if (!ts.isPropertySignature(member) || !member.name) continue;
    const name = member.name.getText(sf);
    const text = ts
      .getJSDocCommentsAndTags(member)
      .map((d) => d.comment)
      .find(Boolean);
    if (text) docs[name] = { description: squash(String(text)) };
  }
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isObjectBindingPattern(node.name) &&
      node.initializer?.getText(sf) === 'Astro.props'
    ) {
      for (const el of node.name.elements) {
        if (!el.initializer) continue;
        const name = (el.propertyName ?? el.name).getText(sf);
        const init = el.initializer;
        const value = ts.isStringLiteralLike(init) ? init.text : squash(init.getText(sf));
        docs[name] = { ...docs[name], default: value };
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return docs;
}
