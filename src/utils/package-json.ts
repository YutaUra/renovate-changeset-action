import { z } from "zod";

export const packageJsonSchema = z
  .object({
    dependencies: z.record(z.string()).default({}),
    devDependencies: z.record(z.string()).default({}),
    name: z.string(),
    private: z.boolean().default(false),
  })
  .strip();
