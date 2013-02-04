(function (namespace) {
	var ApiModel = namespace.ApiModel = can.Model({
		cache: {},
		makeRequest: function () {
			var self = this;
			var url = [this.url].concat(can.makeArray(arguments)).join('/');
			var deferred = can.Deferred();
			var cache = this.cache;

			if (cache[url]) {
				deferred.resolve(cache[url]);
			} else {
				can.ajax({
					dataType: 'jsonp',
					url: url
				}).then(function (response) {
					var error = self.errorCheck && self.errorCheck(response);
					if(error) {
						deferred.reject(error);
					} else {
						cache[url] = response;
						deferred.resolve(response);
					}
				});
			}

			return deferred;
		},
		makeParameters: function (params) {
			return '?' + can.route.param(params);
		}
	}, {});

	var MeetupModel = namespace.MeetupModel = ApiModel({
		url: 'https://api.meetup.com',
		apiKey: 'e1d87f794c310476744591e2c216b',
		errorCheck: function(response) {
			if(response.code || response.status) {
				return {
					who: 'Meetup',
					message: response.problem + ': ' + response.details,
					fallback: 'http://www.meetup.com/YYC-js'
				};
			}
			return false;
		},
		findAll: function (options) {
			var key = this.apiKey,
				parameters = this.makeParameters(can.extend({
					key: key,
					sign: true
				}, options));
			return this.makeRequest('2', this.type, parameters).pipe(function (data) {
				return data.results;
			});
		},
		findOne: function (options) {
			return this.findAll(options).pipe(function (data) {
				return data[0];
			});
		}
	}, {});

	var GitHubModel = namespace.GitHubModel = ApiModel({
		id: 'url',
		url: 'https://api.github.com'
	}, {});

	namespace.GitHubContent = GitHubModel({
		findAll: function (options) {
			return this.makeRequest('repos', options.user, options.repository, 'contents', options.path)
				.pipe(function (result) {
					return result.data;
				});
		},
		findAllWithContent: function (options) {
			var deferred = this.findAll(options);
			deferred.then(function (models) {
				models.each(function (content) {
					can.ajax({
						url: content.attr('url'),
						beforeSend: function (xhr) {
							xhr.setRequestHeader('Accept', 'application/vnd.github-blob.raw');
						}
					}).then(function (markdown) {
							content.attr('content', markdown);
						});
				});
			});
			return deferred;
		}
	}, {});

	namespace.GitHubProject = ApiModel({
		url: 'https://api.github.com',
		findAll: function (options) {
			return this.makeRequest('users', options.user, 'repos' + this.makeParameters({
				sort: 'updated'
			}));
		},
		findAllWithReadme: function (options) {
			var deferred = this.findAll(options);
			deferred.then(function (models) {
				models.each(function (project) {
					can.ajax({
						url: project.attr('url') + '/readme',
						beforeSend: function (xhr) {
							xhr.setRequestHeader('Accept', 'application/vnd.github-blob.raw');
						}
					}).then(function (markdown) {
							project.attr('readme', markdown);
						});
				});
			});
			return deferred;
		},
		findOne: function (options) {
			return this.makeRequest(['repos', options.user, options.name]).pipe(function (response) {
				return response.data;
			});
		}
	}, {});

	var MeetupGroup = namespace.MeetupGroup = MeetupModel({
		type: 'groups'
	}, {});

	var MeetupMeetups = namespace.MeetupMeetups = MeetupModel({
		type: 'events',
		findAllWithHosts: function (options) {
			var deferred = can.Deferred();
			this.findAll(can.extend({ fields: 'event_hosts' }, options)).then(function (meetups) {
				meetups.each(function (meetup) {
					var memberIds = $.map(meetup.attr('event_hosts'),function (data) {
						return data.member_id;
					}).join(',');

					MeetupMembers.findAll({
						member_id: memberIds
					}).done(function (members) {
							meetup.attr('hosts', members);
							deferred.resolve(meetups);
						});
				});
			});

			return deferred;
		}
	}, {});

	var MeetupMembers = namespace.MeetupMembers = MeetupModel({
		type: 'members'
	}, {});
})(window);