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
})(window);