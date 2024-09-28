import "source-map-support/register.js";

import { resolve } from "node:path";
import * as core from "@actions/core";
import { run } from "./run.js";

const getString = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
};
const getBoolean = (name: string) => {
  const value = getString(name);
  if (["true", "1"].includes(value)) return true;
  if (["false", "0"].includes(value)) return false;
  return value.length > 0;
};

const main = async (): Promise<void> => {
  await run({
    diff: getString("diff")
      .split(" ")
      .map((v) => resolve(v.replace(/^'|'$/g, ""))),
    message: getString("message"),
    dryRun: getBoolean("dry_run"),
    pnpmWorkspace: getBoolean("pnpm_workspace"),
    setupGitUser: getBoolean("setup_git_user"),
    commitMessage: getString("commit_message"),
  });
};

main().catch((e: Error) => {
  core.setFailed(e);
  console.error(e);
});
