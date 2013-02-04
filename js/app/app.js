$(function () {
	/*Mustache Helpers*/
	can.Mustache.registerHelper('prettyDate', function (timestamp) {
		var date = new Date(timestamp);

		return date.toLocaleDateString();
	});

	can.Mustache.registerHelper('prettyTime', function (timestamp, duration) {
		var date = isNaN(parseInt(duration, 10)) ? new Date(timestamp) : new Date(timestamp + duration);

		return date.getHours() + ':' + date.getMinutes();
	});

	can.Mustache.registerHelper('markdown', function(markdown) {

	});

	var footer = $('footer');
	var loading = function (el) {
		footer.hide();
		return el.html(can.view('views/loading.mustache', {}));
	};
	var loaded = function (frag) {
		footer.show();
		return this.html(frag).hide().fadeIn();
	}
	var errorHandler = function(error) {
		this.html(can.view('views/error.mustache', error));
		footer.show();
	}

	var Index = can.Control({
		init: function () {
			var el = loading(this.element);
			can.view('views/index.mustache', {
				upcoming: MeetupMeetups.findAllWithHosts({
					group_urlname: 'yyc-js',
					status: 'upcoming',
					page: 1
				})
			}).done(can.proxy(loaded, el));
		}
	});

	var Blog = can.Control({
		init: function () {
			var el = loading(this.element);
			can.view('views/blog.mustache', {
				posts: GitHubContent.findAllWithContent({
					user: 'yycjs',
					repository: 'yycjs.github.com',
					path: 'blog'
				})
			}).done(function (frag) {
				el.html(frag);
			})
		}
	});

	var Meetups = can.Control({
		init: function () {
			var el = loading(this.element);
			can.view('views/meetups.mustache', {
				upcoming: MeetupMeetups.findAllWithHosts({
					group_urlname: 'yyc-js',
					status: 'upcoming',
					page: 2
				}),
				past: MeetupMeetups.findAll({
					group_urlname: 'yyc-js',
					status: 'past',
					fields: 'event_hosts',
					page: 10,
					desc: true
				})
			}).then(can.proxy(loaded, el), can.proxy(errorHandler, el));
		}
	});

	var Projects = can.Control({
		init: function () {
			var el = loading(this.element);
			can.view('views/projects.mustache', {
				projects: GitHubProject.findAllWithReadme({ user: 'yycjs' })
			}).done(can.proxy(loaded, el));
		}
	});

	var About = can.Control({
		init: function () {
			var el = loading(this.element);
			MeetupGroup.findOne({
				group_urlname: 'yyc-js'
			}).then(function(group) {
				MeetupMembers.findAll({
					group_urlname: 'yyc-js'
				}).then(function(members) {
					group.attr('memberList', members);
					loaded.call(el, can.view('views/about.mustache', {
						group: group
					}));
				}, can.proxy(errorHandler, el));
			}, can.proxy(errorHandler, el));
		}
	});

	var Router = can.Control({
		defaults: {
			mappings: {
				index: Index,
				blog: Blog,
				meetups: Meetups,
				projects: Projects,
				about: About
			},
			state: can.route
		}
	}, {
		init: function () {
			this.element.html(can.view('views/index.mustache', {}));
		},
		'{state} type': function (cls, ev, val) {
			if (this.current && this.current.element) {
				this.current.destroy();
			}
			if (this.options.mappings[val]) {
				this.current = new this.options.mappings[val](this.element);
			}
		}
	});

	can.route(':type', { type: 'index' });
	can.route.ready(false);
	new Router('#content');
	can.route.ready(true);
});