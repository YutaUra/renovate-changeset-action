import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import * as core from "@actions/core";
import { exec } from "@actions/exec";
import { match } from "ts-pattern";
import { buildPnpmWorkspaceTree } from "./utils/build-pnpm-workspace-tree";
import { packageJsonSchema } from "./utils/package-json";
import { readPnpmWorkspace } from "./utils/read-pnpm-workspace";

type Inputs = {
  diff: string[];
  message: string;
  dryRun: boolean;
  pnpmWorkspace: boolean;
  setupGitUser: boolean;
  commitMessage: string;
};

export const run = async (inputs: Inputs): Promise<void> => {
  const packages = await match(inputs.pnpmWorkspace)
    .with(true, async () => {
      const workspaceYaml = await readPnpmWorkspace("pnpm-workspace.yaml");
      core.info(`workspaceYaml: ${workspaceYaml}`);
      return await buildPnpmWorkspaceTree(workspaceYaml);
    })
    .with(false, async () => {
      const pkg = packageJsonSchema.parse(
        JSON.parse(await readFile("package.json", "utf-8")),
      );
      return {
        [pkg.name]: {
          dependsOn: [],
          dir: resolve("."),
          isPrivate: pkg.private,
        },
      };
    })
    .exhaustive();

  const changedPackages = Object.entries(packages)
    .filter(([_, { dir }]) => {
      return inputs.diff.some((d) => d.startsWith(`${dir}/`));
    })
    .map(([name]) => name);
  const affectedPackages = Object.entries(packages).filter(
    ([name, { dependsOn, isPrivate }]) =>
      changedPackages.some((cp) => cp === name || dependsOn.includes(cp)) &&
      !isPrivate,
  );

  core.info(`diff: ${JSON.stringify(inputs.diff)}`);
  core.info(`packages: ${packages}`);
  core.info(`changedPackages: ${changedPackages}`);
  core.info(`affectedPackages: ${affectedPackages}`);

  if (affectedPackages.length === 0) {
    core.info("no affected packages");
    return;
  }
  const filename = join(
    ".changeset",
    `${inputs.message.replace(/\s/g, "-").replace(/\//g, "_").toLowerCase()}.md`,
  );
  const changeset = `---
${affectedPackages.map(([name]) => `"${name}": patch`).join("\n")}
---

${inputs.message}`;

  if (!inputs.dryRun) {
    await writeFile(filename, changeset);

    if (inputs.setupGitUser) {
      core.info("setting git user");
      await exec("git", ["config", "user.name", "github-actions[bot]"]);
      await exec("git", [
        "config",
        "user.email",
        "github-actions[bot]@users.noreply.github.com",
      ]);
    }

    await exec("git", ["add", filename]);
    await exec("git", ["commit", "-m", inputs.commitMessage]);
    await exec("git", ["push"]);
  } else {
    core.info("dry run");
    core.info(`write file → ${filename}`);
    core.info("=".repeat(40));
    core.info(changeset);
    core.info("=".repeat(40));
    core.info(`exec $ git add ${filename}`);
    core.info(`exec $ git commit -m "${inputs.commitMessage}"`);
    core.info("exec $ git push");
  }
};
