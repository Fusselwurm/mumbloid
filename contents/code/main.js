var
	layout = new LinearLayout(plasmoid),
	label  = new Label(),
	userlist = [],
	/**
	 * channelid => composite channelname
	 */
	channels = [],
	populateUserList = function (channel, path) {
		var newpath = (path ? (path + '.') : '') + channel.name;

		if (channel.users) {
			userlist = userlist.concat(channel.users);
		}
		if (channel.channels) {
			channel.channels.forEach(function (chnl) {
				populateUserList(chnl, newpath);
			});
		}
		channel.fullname = newpath;
		channels[channel.id] = channel;
	},
	refreshView = function (dataString) {
		var 
			data,
			s = '';

		try {
			data = JSON.parse(dataString)
		} catch (e) {
			data = {
				root : {}
			};
			/*TEST*/
			throw e;
			/*TEST*/
		}

		channels = [];
		userlist = [];
		populateUserList(data.root, '');

		s += channels.map(function (chnl) {
			var
				channelusers = userlist.filter(function (usr) {
					return usr.channel === chnl.id;
				});

			if (!channelusers.length) {
				return '';
			}


			return '\n\n' + chnl.fullname + ':\n' + channelusers.map(function (usr) {

				var attrs = [];


				if (usr.selfMute) {
					attrs.push('mute');
				}
				if (usr.selfDead) {
					attrs.push('deaf');
				}

				return '\t' + usr.name + ': ' + attrs.join('|');
			}).join('\n');
		}).join('');

		if (!s) {
			if (userlist.length) {
				s = 'WTF';
			} else {
				s = 'no users';
			}
		}

		/*TEST*/
		/*
		var x = '';
		for (var n in label) {
			try {

				x = label[n];
				s += '\n' + n + ': ';
				s += x;
			} catch (e) {
				s += '###ERROR###';
			}
		}
		*/
		/*TEST*/


		label.text = s;
	},
	getData = function () {

		var
			httpJob = plasmoid.getUrl("http://gronom.de:5000/1"),
			responseBody = '';

		print('refreshing...');

		httpJob.data.connect(function (job, data) {

			if (job != httpJob) {
				return;
			}

			if (!data.length) {
				return;
			}
			responseBody += data.toUtf8();
		});

		httpJob.finished.connect(function (job) {
			if (job != httpJob) {
				return;
			}
			print('got response with length ' + responseBody.length + '.... refreshing view...');
			refreshView(responseBody);
		});
	},
	timer = new QTimer();

layout.addItem(label);

getData();
timer.timeout.connect(getData);
timer.start(15 * 1000);
