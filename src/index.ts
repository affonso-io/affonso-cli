import { createProgram } from "./cli.js";
import { handleError } from "./lib/errors.js";

const program = createProgram();

program.parseAsync(process.argv).catch((err) => {
	const opts = program.opts();
	handleError(err, opts.json);
});
