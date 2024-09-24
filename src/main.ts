import { resolve } from "node:path";
import * as core from "@actions/core";
import { run } from "./run.js";

const main = async (): Promise<void> => {
  await run({
    diff: core
      .getInput("diff", { required: true })
      .split(" ")
      .map((v) => resolve(v.replace(/^'|'$/g, ""))),
    message: core.getInput("message", { required: true }),
    dryRun: core.getBooleanInput("dry-run"),
    workingDirectory: core.getInput("working-directory"),
    pnpmWorkspaces: core.getBooleanInput("pnpm-workspaces"),
    setupGitUser: core.getBooleanInput("setup-git-user"),
    commitMessage: core.getInput("commit-message"),
  });
};

main().catch((e: Error) => {
  core.setFailed(e);
  console.error(e);
});
