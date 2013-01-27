$(function() {
	var Blog = can.Control({
		init: function() {
			this.element.html(can.view('views/blog.mustache', {}));
		}
	});

	var Meetups = can.Control({
		init: function() {
			var el = this.element;
			can.view('views/meetups.mustache', {
				upcoming: MeetupMeetups.findAll({
					group_urlname: 'yyc-js',
					status: 'upcoming',
				})
			}).done(function(frag) {
				el.html(frag);
			});
		}
	});

	var Projects = can.Control({
		init: function() {
			var el = this.element;
			can.view('views/projects.mustache', {
				projects: GitHubProject.findAll({ user: 'yycjs' })
			}).done(function(frag) {
				el.html(frag);
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
				el.html(group);
			});
		}
	});

	var Router = can.Control({
		defaults: {
			mappings: {
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
			} else {
				this.options.state.attr('type', '');
				this.element.html(can.view('views/index.mustache', {}));
			}
		}
	});

	can.route(':type');
	can.route.ready(false);
	new Router('#content');
	can.route.ready(true);
});