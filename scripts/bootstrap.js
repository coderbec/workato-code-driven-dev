#!/usr/bin/env node
/**
 * Prepare the workspace root (the folder that contains this repo) for the guided setup.
 * Safe to re-run: it only adds what is missing and never overwrites an existing file or link.
 *
 *   node workato-code-driven-dev/scripts/bootstrap.js
 *
 * Creates, in the workspace root:
 *   Workspace Projects/   the wk container where Workato projects are hydrated
 *   .gitignore            lines that keep Workspace Projects/ and .mcp.json out of git
 *   CLAUDE.md             a short scaffold (only if there is none)
 *   .claude/skills        link to this repo's skills so /workato-setup works from the workspace root
 */
const fs = require('fs');
const path = require('path');
const { resolvePaths } = require('./lib/paths');

const TEMPLATES = path.join(__dirname, '..', 'templates', 'workspace');

function ensureDir(dir, log, label) {
  if (fs.existsSync(dir)) return log(`exists   ${label}`);
  fs.mkdirSync(dir, { recursive: true });
  log(`created  ${label}`);
}

function ensureGitignore(workspaceRoot, log) {
  const file = path.join(workspaceRoot, '.gitignore');
  const wanted = fs.readFileSync(path.join(TEMPLATES, 'gitignore.template'), 'utf-8')
    .split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const have = fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : '';
  const present = new Set(have.split(/\r?\n/).map((l) => l.trim()));
  const missing = wanted.filter((l) => !present.has(l));
  if (!missing.length) return log('exists   .gitignore (already has the workspace entries)');
  const prefix = have && !have.endsWith('\n') ? '\n' : '';
  fs.writeFileSync(file, `${have}${prefix}${have ? '\n' : ''}# Added by workato-code-driven-dev bootstrap: customer-specific, never commit\n${missing.join('\n')}\n`);
  log(`${have ? 'updated ' : 'created '} .gitignore (+${missing.length} line${missing.length > 1 ? 's' : ''})`);
}

function ensureClaudeMd(workspaceRoot, repoRoot, log) {
  const file = path.join(workspaceRoot, 'CLAUDE.md');
  if (fs.existsSync(file)) return log('exists   CLAUDE.md (left untouched)');
  const body = fs.readFileSync(path.join(TEMPLATES, 'CLAUDE.md.template'), 'utf-8')
    .replace(/\{\{REPO_DIR\}\}/g, path.relative(workspaceRoot, repoRoot) || '.');
  fs.writeFileSync(file, body);
  log('created  CLAUDE.md');
}

/** Link the repo's skills into <workspace>/.claude/skills (relative symlinks; never a copy). */
function ensureSkillLinks(workspaceRoot, repoRoot, log) {
  const skillsSrc = path.join(repoRoot, '.agents', 'skills');
  if (!fs.existsSync(skillsSrc)) return log(`skipped  .claude/skills (no skills folder at ${skillsSrc})`);
  const claudeDir = path.join(workspaceRoot, '.claude');
  const dest = path.join(claudeDir, 'skills');
  fs.mkdirSync(claudeDir, { recursive: true });
  const link = (target, at) => fs.symlinkSync(path.relative(path.dirname(at), target), at, process.platform === 'win32' ? 'junction' : 'dir');
  try {
    if (!fs.existsSync(dest) && !isLink(dest)) {
      link(skillsSrc, dest);
      return log('created  .claude/skills -> ' + path.relative(claudeDir, skillsSrc));
    }
    if (isLink(dest)) return log('exists   .claude/skills (link left untouched)');
    // A real skills folder already exists: add a link per missing skill, touch nothing else.
    let added = 0;
    for (const name of fs.readdirSync(skillsSrc)) {
      const at = path.join(dest, name);
      if (fs.existsSync(at) || isLink(at)) continue;
      link(path.join(skillsSrc, name), at);
      added += 1;
    }
    log(added ? `updated  .claude/skills (+${added} linked skill${added > 1 ? 's' : ''})` : 'exists   .claude/skills (all skills already present)');
  } catch (e) {
    log(`WARN     could not create the skills link (${e.code || e.message}).`);
    log(`         From the workspace root, tell Claude: "read ${path.relative(workspaceRoot, path.join(skillsSrc, 'workato-setup', 'SKILL.md'))} and follow it".`);
  }
}

function isLink(p) {
  try { return fs.lstatSync(p).isSymbolicLink(); } catch { return false; }
}

function bootstrap({ repoRoot, workspaceRoot, projectsDir, log = console.log } = {}) {
  const p = resolvePaths();
  repoRoot = repoRoot || p.repoRoot;
  workspaceRoot = workspaceRoot || p.workspaceRoot;
  projectsDir = projectsDir || p.projectsDir;
  log(`Workspace root: ${workspaceRoot}`);
  ensureDir(projectsDir, log, path.relative(workspaceRoot, projectsDir) + '/');
  ensureGitignore(workspaceRoot, log);
  ensureClaudeMd(workspaceRoot, repoRoot, log);
  ensureSkillLinks(workspaceRoot, repoRoot, log);
}

if (require.main === module) {
  bootstrap();
  console.log('\nNext: start Claude from the workspace root (`claude`) and say "start workato setup" (or /workato-setup).');
}

module.exports = { bootstrap };
