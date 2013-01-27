(function(namespace) {
	namespace.GitHubProject = can.Model({
		url: 'https://api.github.com',
		findAll: function(options) {
			return can.ajax({
				dataType: 'jsonp',
				url: [this.url, 'users', options.user, 'repos?sort=updated&callback=?'].join('/')
			});
		},
		findOne: function(options) {
			return can.ajax({
				dataType: 'jsonp',
				url: [this.url, 'repos', options.user, options.name].join('/')
			});
		}
	}, {});

	namespace.MeetupGroup = can.Model({
		url: 'https://api.meetup.com',
		findAll: function(options) {
			return can.ajax({
				dataType: 'jsonp',
				url: [this.url, '2', 'groups', '?key=e1d87f794c310476744591e2c216b&sign=true&group_urlname=YYC-js'].join('/')
			});
		}
	}, {});

	namespace.MeetupMeetups = can.Model({
		url: 'https://api.meetup.com',
		findAll: function(options) {
			var urlOptions = '';

			for (var key in options){
				urlOptions += key.toString() + '=' + options[key] + '&';
			}

			// Remove the last '&'
			urlOptions = '&' + urlOptions.substring(0, urlOptions.length - 1);

			return can.ajax({
				dataType: 'jsonp',
				url: [this.url, '2', 'events', '?key=e1d87f794c310476744591e2c216b&sign=true&group_urlname=YYC-js' + urlOptions].join('/')
			});
		},
		findOne: function(options) {
			return can.ajax({
				dataType: 'jsonp',
				url: [this.url, '2', 'repos'].join('/')
			});
		}
	}, {});
})(window);