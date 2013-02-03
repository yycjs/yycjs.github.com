$(function() {
	var loading = function(el) {
		return el.html(can.view('views/loading.mustache', {}));
	};

	var Index = can.Control({
		init: function() {
			var el = loading(this.element);
			can.view('views/index.mustache', {
				upcoming: MeetupMeetups.findAll({
					group_urlname: 'yyc-js',
					status: 'upcoming',
					page: 1
				})
			}).done(function(frag) {
				el.html(frag).hide().fadeIn();
			});
		}
	});

	var Blog = can.Control({
		init: function() {
			this.element.html(can.view('views/blog.mustache', {}));
		}
	});

	var Meetups = can.Control({
		init: function() {
			var el = loading(this.element);
			can.view('views/meetups.mustache', {
				upcoming: MeetupMeetups.findAll({
					group_urlname: 'yyc-js',
					status: 'upcoming',
					page: 2
				}),
				past: MeetupMeetups.findAll({
					group_urlname: 'yyc-js',
					status: 'past',
					page: 10,
					desc: true
				})
			}).done(function(frag) {
				el.html(frag).hide().fadeIn();
			});
		}
	});

	var Projects = can.Control({
		init: function() {
			var el = loading(this.element);
			can.view('views/projects.mustache', {
				projects: GitHubProject.findAll({ user: 'yycjs' })
			}).done(function(frag) {
				el.html(frag).hide().fadeIn();
			});
		}
	});

	var About = can.Control({
		init: function() {
			var el = this.element;
			can.view('views/about.mustache', {
				group: MeetupGroup.findOne({
					group_urlname: 'yyc-js'
				})
			}).done(function(group) {
				el = el.html(group).find('.members');
				loading(el);
				can.view('views/members.mustache', {
					members: MeetupMembers.findAll({
						group_urlname: 'yyc-js'
					})
				}).done(function(frag) {
					el.html(frag).hide().fadeIn();
				});
			});
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
		init: function() {
			this.element.html(can.view('views/index.mustache', {}));
		},
		'{state} type': function(cls, ev, val) {
			if(this.current && this.current.element) {
				this.current.destroy();
			}
			if(this.options.mappings[val]) {
				this.current = new this.options.mappings[val](this.element);
			}
		}
	});

	can.route('', {type: 'index'});
	can.route(':type');
	can.route.ready(false);
	new Router('#content');
	can.route.ready(true);
});