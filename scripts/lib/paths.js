/**
 * Where things live. This repo holds only reusable tooling and skills; everything customer-specific
 * (hydrated Workato projects, the rendered .mcp.json) lives in the workspace root, the folder that
 * contains this repo:
 *
 *   <workspace root>/
 *     .mcp.json                     rendered by the guided setup (gitignored)
 *     Workspace Projects/           wk container: .wk/wk.toml + one folder per hydrated project
 *     workato-code-driven-dev/      this repo (plain clone or git submodule)
 *
 * Paths come from this file's location, never from the current directory, so scripts behave the same
 * wherever they are run from. Set WORKATO_WORKSPACE_ROOT to use a different workspace root.
 */
const path = require('path');

const PROJECTS_DIR_NAME = 'Workspace Projects';

function resolvePaths({ repoRoot = path.resolve(__dirname, '..', '..'), env = process.env } = {}) {
  const override = String(env.WORKATO_WORKSPACE_ROOT || '').trim();
  const workspaceRoot = override ? path.resolve(override) : path.dirname(repoRoot);
  const projectsDir = path.join(workspaceRoot, PROJECTS_DIR_NAME);
  return {
    repoRoot,
    workspaceRoot,
    projectsDir,
    wkToml: path.join(projectsDir, '.wk', 'wk.toml'),
    metadataFile: path.join(projectsDir, '.workato', 'project-metadata.json'),
  };
}

module.exports = { PROJECTS_DIR_NAME, resolvePaths };
