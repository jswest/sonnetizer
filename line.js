require("@tensorflow/tfjs-node");
const fs = require("fs");
const path = require("path");
const ProgressBar = require("progress");
const rhymer = require("rhyme");
const syllable = require("syllable");
const { UMAP } = require("umap-js");
const use = require("@tensorflow-models/universal-sentence-encoder");

const argv = require("yargs").argv;

(async () => {
	try {
		console.log("Spltting the text into possible lines.");
		const words = fs
			.readFileSync(path.resolve(__dirname, "texts/", `${argv.text}.txt`))
			.toString()
			.toLowerCase()
			.replace(/\s\s+/g, " ")
			.split(" ")
			.map((word) => word.replace(/[^A-Za-z]/g, ""))
			.filter((word) => word);
		const lines = [];
		for (let i = 0; i < words.length; i++) {
			const base = words[i];
			const putative = [base];
			let count = syllable(base);
			let j = 1;
			while (count < 10 && i + j < words.length) {
				putative.push(words[i + j]);
				count += syllable(words[i + j]);
				j++;
			}
			if (count === 10) {
				lines.push(putative.join(" "));
			}
		}

		console.log("Embedding the lines as vectors.");
		const model = await use.load();
		let embeddings = await model.embed(lines);
		embeddings = await embeddings.array();

		console.log("Reducing the vectors to smaller vectors.");
		const umap = new UMAP({ nComponents: 3 });
		const reduced = umap.fit(embeddings);

		console.log("Finding rhymes.");
		const map = [];
		let bar = new ProgressBar(":bar", { total: lines.length });
		rhymer((rhyme) => {
			for (let i = 0; i < lines.length; i++) {
				map[i] = [];
				const possible = rhyme
					.rhyme(lines[i].split(" ").slice(-1)[0])
					.map((word) => word.toLowerCase());
				for (let j = 0; j < lines.length; j++) {
					if (i !== j) {
						if (
							possible.indexOf(lines[j].split(" ").slice(-1)[0]) >
							-1
						) {
							map[i].push(j);
						}
					}
				}
				bar.tick();
			}
			fs.writeFileSync(
				path.resolve(__dirname, "texts", `${argv.text}-map.json`),
				JSON.stringify(map)
			);
			fs.writeFileSync(
				path.resolve(__dirname, "texts", `${argv.text}-lines.json`),
				JSON.stringify(
					lines.map((line, i) => {
						return {
							line: line,
							embedding: reduced[i],
						};
					})
				)
			);
		});
	} catch (error) {
		console.log(error);
	}
})();
