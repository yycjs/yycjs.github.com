(function(namespace) {
	var meetupKey = 'e1d87f794c310476744591e2c216b';
	var ApiModel = namespace.ApiModel = can.Model({
		makeRequest: function() {
			var url = [this.url].concat(can.makeArray(arguments)).join('/');
			return can.ajax({
				dataType: 'jsonp',
				url: url
			});
		},
		makeParameters: function(params) {
			var result = [];
			can.each(params, function(value, key) {
				result.push(key + '=' + value);
			});
			return '?' + result.join('&');
		}
	}, {});

	namespace.GitHubProject = ApiModel({
		url: 'https://api.github.com',
		findAll: function(options) {
			return this.makeRequest('users', options.user, 'repos?sort=updated&callback=?');
		},
		findOne: function(options) {
			return this.makeRequest(['repos', options.user, options.name]).pipe(function(response) {
				return response.data;
			});
		}
	}, {});

	namespace.MeetupGroup = ApiModel({
		url: 'https://api.meetup.com',
		findAll: function(options) {
			var parameters = this.makeParameters(can.extend({
				key: meetupKey,
				sign: true
			}, options));
			return this.makeRequest('2', 'groups', parameters);
		},
		findOne: function(options) {
			return this.findAll(options).pipe(function(data) {
				return data.results[0];
			});
		}
	}, {});

	namespace.MeetupMeetups = ApiModel({
		url: 'https://api.meetup.com',
		findAll: function(options) {
			var parameters = this.makeParameters(can.extend({
				key: meetupKey,
				sign: true
			}, options));
			return this.makeRequest('2', 'events', parameters).pipe(function(data) {
				return data.results;
			});
		},
		findOne: function(options) {
			//
		}
	}, {});
})(window);