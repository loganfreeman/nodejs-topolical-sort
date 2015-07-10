var Graph = require('../graph.js').Graph;

var InvalidGraphError = require('../graph.js').InvalidGraphError;
var _ = require('lodash');

var Promise = require('bluebird');

var expect = require('chai').expect,
	should = require('chai').should();

describe('Graph', function() {
	it('should construct graph', function() {
		var g = new Graph();
		g.set('a', 'b', 3);
		g.get('a', 'b').should.be.eq(3);
		g.set('a', 'b', 4);
		g.get('a', 'b').should.be.eq(4);
		g.del('a', 'b');
		expect(g.get('a', 'b')).to.be.eq(undefined);
	})

	it('should construct triangle from array', function() {
		var g = new Graph({
			a: ['b', 'c'],
			c: ['b'],
		});

		g.degree('b').should.be.eq(2);
		g.degree('a').should.be.eq(2);
		g.degree('c').should.be.eq(2);

		g.order().should.be.eq(3);

		g.size().should.be.eq(3);

		var nodes = [];

		g.dfs('a', function(v) {
			nodes.push(v);
		});

		expect(nodes.join(' ')).to.be.eq('a c b');

		nodes = [];

		g.dfsRecursive('a', function(v) {
			nodes.push(v);
		})

		expect(nodes.join(' ')).to.be.eq('a b c');

	})

	it('should build weighted graph from object', function() {
		var g = new Graph({
			a: {
				b: 2
			},
			b: {
				c: 3
			},
		});

		g.get('a', 'b').should.be.eq(2);
		g.get('b', 'a').should.be.eq(2);
		g.get('c', 'b').should.be.eq(3);
		g.get('b', 'c').should.be.eq(3);


		g.order().should.be.eq(3);

		g.size().should.be.eq(2);

		g.degree('b').should.be.eq(2);
		g.degree('a').should.be.eq(1);
		g.degree('c').should.be.eq(1);


	})

	it('should create directed edges', function() {
		var g = new Graph();
		g.dir('a', 'b');
		g.has('a', 'b').should.be.eq(true);
		g.has('b', 'a').should.be.eq(false);


		expect(g.adj('a')['b']).to.be.eq(true);

		expect(g.adj('b')['a']).to.be.eq(undefined);

		expect(g.indegree('a')).to.be.eq(0);

		expect(g.indegree('b')).to.be.eq(1);
	})

	it('should detect cycle', function(done) {
		var g = new Graph();
		// g.debug();
		g.dir('b', 'a'); // a <= b
		g.dir('b', 'c'); // b => c
		g.dir('c', 'd'); // c => d
		g.dir('d', 'b'); // d => b

		Promise.resolve()
			.then(function() {
				g.is_cycle('b')
			})
			.catch(InvalidGraphError, function(e) {
				expect(e.message).to.be.eq('Cycle detected');
				done();
			})
	})

	it('should detect cycle by topological sort', function(done) {
		var g = new Graph();
		// g.debug();
		g.dir('b', 'a'); // a <= b
		g.dir('b', 'c'); // b => c
		g.dir('c', 'd'); // c => d
		g.dir('d', 'b'); // d => b

		Promise.resolve()
			.then(function() {
				g.topologicalSort()
			})
			.catch(InvalidGraphError, function(e) {
				expect(e.message).to.be.eq('graph has at least one cycle');
				done();
			})
	})

	it('should topological sort', function() {
		var g = new Graph();

		g.dir(5, 2);
		g.dir(5, 0);
		g.dir(4, 0);
		g.dir(4, 1);
		g.dir(2, 3);
		g.dir(3, 1);

		expect(g.indegree(5)).to.be.eq(0);
		expect(g.order()).to.be.eq(6);


		var sorted = g.topologicalSort();
		expect(sorted.join(' ')).to.be.eq('5 4 2 0 3 1');
	})


	it('should sort by dependency', function() {
		var g = new Graph();

		g.addVertex('KittenService');

		g.dir('Cyberportal', 'Leetmeme');

		g.dir('Ice', 'Cyberportal');

		g.dir('KittenService', 'CamelCaser');

		g.dir('Leetmeme', 'Fraudstream');

		g.addVertex('Ice');

		var sorted = g.topologicalSort().join(' ');


		expect(sorted).to.be.eq('KittenService Ice CamelCaser Cyberportal Leetmeme Fraudstream');

	})

	it('should be rejected', function(done) {
		var g = new Graph();

		g.addVertex('KittenService');

		g.dir('Cyberportal', 'Leetmeme');

		g.dir('Ice', 'Cyberportal');

		g.dir('KittenService', 'CamelCaser');

		g.dir('Leetmeme', 'Fraudstream');

		g.dir('Fraudstream', 'Cyberportal');



		Promise.resolve()
			.then(function() {
				var sorted = g.topologicalSort().join(' ');
				return sorted
			})
			.catch(InvalidGraphError, function(e) {
				expect(e.message).to.be.eq('graph has at least one cycle');
				done()
			})

	})
})