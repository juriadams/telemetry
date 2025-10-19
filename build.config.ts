import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineBuildConfig } from "obuild/config";

const dir = dirname(fileURLToPath(import.meta.url));

export default defineBuildConfig({
	entries: [
		{
			type: "bundle",
			input: ["src/index.ts"],
			rolldown: {
				resolve: {
					alias: {
						"@": resolve(dir, "src"),
					},
				},
			},
		},
	],
});
