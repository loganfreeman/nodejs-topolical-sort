#!/usr/bin/env node

var Graph = require('./graph.js').Graph;

var InvalidGraphError = require('./graph.js').InvalidGraphError;


var fs = require('fs');

var _ = require('lodash');

var assert = require('assert');

var colors = require('colors');

var format = require('string-format');

format.extend(String.prototype);

var argv = require('optimist')
	.usage('Usage: $0 -f [file]')
	.demand('f')
	.alias('f', 'file')
	.describe('f', 'Load a file')
	.argv;


var data = fs.readFileSync(argv.file, 'utf8').split(/\r?\n/);

var g = new Graph;

function isEmpty(str) {
	return str.replace(/^\s+|\s+$/g, '').length == 0;
}

for (var i in data) {
	var words = data[i].split(':');

	words = _.filter(words, function(word) {
		return !isEmpty(word);
	}).map(function(word){
		return word.trim();
	})
	assert(words.length <= 2, 'each line can contain at most two words');
	if (words.length == 1) {
		g.addVertex(words[0]);
		console.log('g.addVertex("{}")'.format(words[0]));
	} else if (words.length == 2) {
		g.dir(words[1], words[0]);
		console.log('g.dir("{}", "{}")'.format(words[1], words[0]));
	}



}


var sorted = g.topologicalSort().join(' ');

console.log(sorted.green);