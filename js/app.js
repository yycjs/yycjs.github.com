$(function() {
	var Blog = can.Control({
		init: function() {
			this.element.html(can.view('views/blog.mustache', {}));
		}
	});

	var Meetups = can.Control({
		init: function() {
			this.element.html(can.view('views/meetups.mustache', {}));
		}
	});

	var Projects = can.Control({
		init: function() {
			var el = this.element;
			GitHubProject.findAll({ user: 'yycjs' }).done(function(projects) {
				el.html(can.view('views/projects.mustache', {
					projects: projects
				}));
			});
		}
	});

	var About = can.Control({
		init: function() {
			this.element.html(can.view('views/about.mustache', {}));
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
		'{state} type': function(cls, ev, val) {
			if(this.current) {
				this.current.destroy();
			}
			if(this.options.mappings[val]) {
				this.current = new this.options.mappings[val](this.element);
			} else {
				this.options.state.attr('type', '');
			}
		}
	});

	can.route(':type');
	can.route.ready(false);
	new Router('#content');
	can.route.ready(true);
});