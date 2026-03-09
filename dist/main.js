// src/main.ts
import "source-map-support/register.js";
import { resolve as resolve3 } from "path";
import * as core2 from "@actions/core";

// src/run.ts
import { readFile as readFile3, writeFile } from "fs/promises";
import { join, resolve as resolve2 } from "path";
import * as core from "@actions/core";
import { match } from "ts-pattern";

// src/utils/build-pnpm-workspace-tree.ts
import { readFile } from "fs/promises";
import { resolve } from "path";
import { glob } from "glob";

// src/utils/package-json.ts
import { z } from "zod";
var packageJsonSchema = z.object({
  dependencies: z.record(z.string()).default({}),
  devDependencies: z.record(z.string()).default({}),
  name: z.string(),
  private: z.boolean().default(false)
}).strip();

// src/utils/build-pnpm-workspace-tree.ts
var getAllDependencies = (allDependencies, packagesTree, packageName) => {
  const pkg = packagesTree[packageName];
  if (!pkg) throw new Error(`Package ${packageName} not found in workspace`);
  if (allDependencies[packageName]) {
    return allDependencies[packageName] ?? [];
  }
  if (pkg.dependsOn.length === 0) {
    allDependencies[packageName] = [];
    return [];
  }
  allDependencies[packageName] = Array.from(
    /* @__PURE__ */ new Set([
      ...pkg.dependsOn,
      ...pkg.dependsOn.flatMap(
        (dep) => getAllDependencies(allDependencies, packagesTree, dep)
      )
    ])
  );
  return allDependencies[packageName] ?? [];
};
var buildPnpmWorkspaceTree = async (workspace) => {
  const packages = await Promise.all(
    workspace.packages.map(async (packagePath) => {
      const files = await glob(`${packagePath}/package.json`);
      return await Promise.all(
        files.map(async (packageJsonPath) => {
          const packageJson = packageJsonSchema.parse(
            JSON.parse(await readFile(packageJsonPath, "utf-8"))
          );
          return {
            dependencies: Object.fromEntries(
              Object.entries(packageJson.dependencies).filter(
                ([_, v]) => v.startsWith("workspace:")
              )
            ),
            devDependencies: Object.fromEntries(
              Object.entries(packageJson.devDependencies).filter(
                ([_, v]) => v.startsWith("workspace:")
              )
            ),
            isPrivate: packageJson.private,
            name: packageJson.name,
            path: packageJsonPath
          };
        })
      );
    })
  ).then((v) => v.flat());
  const packagesTree = Object.fromEntries(
    packages.map((pkg) => {
      return [
        pkg.name,
        {
          dependsOn: [
            ...Object.keys(pkg.dependencies),
            ...Object.keys(pkg.devDependencies)
          ],
          dir: resolve(pkg.path, ".."),
          isPrivate: pkg.isPrivate
        }
      ];
    })
  );
  const allDependencies = {};
  return Object.fromEntries(
    Object.entries(packagesTree).map(([name, pkg]) => {
      return [
        name,
        {
          ...pkg,
          dependsOn: getAllDependencies(allDependencies, packagesTree, name)
        }
      ];
    })
  );
};

// src/utils/read-pnpm-workspace.ts
import { readFile as readFile2 } from "fs/promises";
import yaml from "js-yaml";
import { z as z2 } from "zod";
var workspaceSchema = z2.object({
  packages: z2.array(z2.string())
});
var readPnpmWorkspace = async (workspaceFilePath) => {
  return workspaceSchema.parse(
    yaml.load(await readFile2(workspaceFilePath, "utf-8"))
  );
};

// src/run.ts
var run = async (inputs) => {
  const packages = await match(inputs.pnpmWorkspace).with(true, async () => {
    const workspaceYaml = await readPnpmWorkspace("pnpm-workspace.yaml");
    core.info(`workspaceYaml: ${workspaceYaml}`);
    return await buildPnpmWorkspaceTree(workspaceYaml);
  }).with(false, async () => {
    const pkg = packageJsonSchema.parse(
      JSON.parse(await readFile3("package.json", "utf-8"))
    );
    return {
      [pkg.name]: {
        dependsOn: [],
        dir: resolve2("."),
        isPrivate: pkg.private
      }
    };
  }).exhaustive();
  const changedPackages = Object.entries(packages).filter(([_, { dir }]) => {
    return inputs.diff.some((d) => d.startsWith(`${dir}/`));
  }).map(([name]) => name);
  const affectedPackages = Object.entries(packages).filter(
    ([name, { dependsOn, isPrivate }]) => changedPackages.some((cp) => cp === name || dependsOn.includes(cp)) && !isPrivate
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
    `${inputs.message.replace(/\s/g, "-").replace(/\//g, "_").toLowerCase()}.md`
  );
  const changeset = `---
${affectedPackages.map(([name]) => `"${name}": patch`).join("\n")}
---

${inputs.message}`;
  if (!inputs.dryRun) {
    await writeFile(filename, changeset);
  } else {
    core.info("dry run");
    core.info(`write file \u2192 ${filename}`);
    core.info("=".repeat(40));
    core.info(changeset);
    core.info("=".repeat(40));
  }
};

// src/main.ts
var getString = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
};
var getBoolean = (name) => {
  const value = getString(name);
  if (["true", "1"].includes(value)) return true;
  if (["false", "0"].includes(value)) return false;
  return value.length > 0;
};
var main = async () => {
  await run({
    diff: getString("diff").split(" ").map((v) => resolve3(v.replace(/^'|'$/g, ""))),
    message: getString("message"),
    dryRun: getBoolean("dry_run"),
    pnpmWorkspace: getBoolean("pnpm_workspace")
  });
};
main().catch((e) => {
  core2.setFailed(e);
  console.error(e);
});
//# sourceMappingURL=main.js.map