$(function() {
	var Blog = can.Control({
		init: function() {
			this.element.html(can.view('views/blog.mustache', {}));
		}
	});

	var Meetups = can.Control({
		init: function() {
			var el = this.element;
			var options = {
				page: 3,
				status: 'upcoming',
				// text_format: 'plain'
			};
			MeetupMeetups.findAll(options).done(function(response) {

				var upcoming = response.attr('results');

				for (var index in upcoming){
					if (index === 'time'){
						upcoming.attr('start', new Date(upcoming.time));
						upcoming.attr('date', upcoming.attr('start').toLocaleDateString());
					}

					if (index === 'duration'){
						var date = new Date();
						upcoming.attr('end', date.setDate(upcoming.start.getDate() + upcoming.duration));
					}
				}

				console.log(upcoming);

				el.html(can.view('views/meetups.mustache', {
					upcoming: upcoming
				}));
			});
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
			var el = this.element;
			MeetupGroup.findAll().done(function(response) {

				var group = response.attr('results')[0];

				// Meetup gives the description with <p> tags, WTF. Need to strip them off
				var description = group.description.substring(3, group.description.length - 4);
				// var description = $('.description').html(group.description);

				el.html(can.view('views/about.mustache', {
					description: description,
					members: group.members
				}));
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