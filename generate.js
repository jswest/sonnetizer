const distance = require("euclidean-distance");
const fs = require("fs");
const path = require("path");
const yargs = require("yargs");

const argv = yargs.argv;

const lines = require(path.resolve("./", "texts", `${argv.text}-lines.json`));
const map = require(path.resolve("./", "texts", `${argv.text}-map.json`))
	.map((m, i) => {
		return { m: m, i: i };
	})
	.filter((d) => d.m.length > 0)
	.filter((d) => {
		return lines[d.i].line.split(" ").slice(-1)[0].length > 3;
	})
	.filter((d) => {
		const num = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
		for (const n of num) {
			if (lines[d.i].line.indexOf(n) > -1) {
				return false;
				break;
			}
		}
		if (lines[d.i].line.indexOf("dlt") > -1) {
			return false;
		}
		return true;
	})
	.map((d, index, arr) => {
		return {
			i: d.i,
			m: d.m.filter((i) => arr.find((mm) => mm.i === i)),
		};
	})
	.filter((d) => d && d.m.length > 0);

const rando = (l) => {
	return Math.floor(Math.random() * l);
};

const getClosestLineIndices = (index) => {
	const distances = {};
	lines.forEach((line, jndex) => {
		if (map.find((m) => +m.i === +jndex)) {
			distances[jndex] = distance(
				lines[index].embedding,
				lines[map.find((m) => +m.i === +jndex).i].embedding
			);
		}
	});
	return Object.keys(distances)
		.map((jndex) => {
			return {
				index: jndex,
				distance: distances[jndex],
			};
		})
		.sort((a, b) => (a > b ? 1 : -1))
		.slice(1, 20)
		.map((d) => d.index);
};

const getClosestRhymingLine = (index) => {
	const distances = {};
	const rhymers = map.find((m) => +m.i === +index).m;
	rhymers.forEach((rhymer) => {
		distances[rhymer] = distance(
			lines[index].embedding,
			lines[rhymer].embedding
		);
	});
	return Object.keys(distances)
		.map((rhymer) => {
			return {
				line: lines[rhymer].line,
				distance: distances[rhymer],
			};
		})
		.sort((a, b) => (a > b ? 1 : -1))
		.slice(0, 10)
		.map((d) => d.line);
};

const baseIndex = argv.line || map[Math.floor(Math.random() * map.length)].i;
const closests = getClosestLineIndices(baseIndex);
let cidx = [];
for (let i = 0; i < 20; i++) {
	cidx.push(i);
}

getCouplet = (index) => {
	const l = lines[closests[index]].line;
	const lp = getClosestRhymingLine(closests[index]);
	const ll = lp[rando(lp.length - 1)];
	return { line: l, rhyme: ll };
};

const ap = getClosestRhymingLine(baseIndex);
const a = {
	line: lines[baseIndex].line,
	rhyme: ap[rando(ap.length)],
};
const b = getCouplet(cidx.splice(rando(cidx.length - 1), 1)[0]);
const c = getCouplet(cidx.splice(rando(cidx.length - 1), 1)[0]);
const d = getCouplet(cidx.splice(rando(cidx.length - 1), 1)[0]);
const e = getCouplet(cidx.splice(rando(cidx.length - 1), 1)[0]);
const f = getCouplet(cidx.splice(rando(cidx.length - 1), 1)[0]);
const g = getCouplet(cidx.splice(rando(cidx.length - 1), 1)[0]);

const sonnet = [
	a.line,
	b.line,
	a.rhyme,
	b.rhyme,
	"",
	c.line,
	d.line,
	c.rhyme,
	d.rhyme,
	"",
	e.line,
	f.line,
	e.rhyme,
	f.rhyme,
	"",
	g.line,
	g.rhyme,
	"",
];

console.log(sonnet.join("\n"));
