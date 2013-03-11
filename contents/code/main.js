var
	// havent figured out how to create menu, so change here
	config = {
		cvpurl: "http://gronom.de:5000/1",
		interval: 60
	},

	layout = new LinearLayout(plasmoid),
	labelMain  = new Label(),
	editCvpUrl = new LineEdit(),
	/*
	 * users as cvp returns them
	 */
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
		var x = '', tmp = '', cfg = [];
		for (var n in plasmoid) {
			try {

				x = plasmoid[n];
				tmp = '\n' + n + ': ';
				tmp += x;
			} catch (e) {
				tmp += '###ERROR###';
			}
			cfg.push(tmp);
		}
		cfg = cfg.sort();
		*/
		/*TEST*/


		labelMain.text = s;
		//labelMain.text = cfg.join();
	},
	getData = function (fn) {

		var
			httpJob = plasmoid.getUrl(config.cvpurl),
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
			fn(responseBody);
		});
	},
	timer = new QTimer();

editCvpUrl.text = config.cvpurl;
layout.orientation = 2; // should be QtVertical
layout.addItem(editCvpUrl);
layout.addItem(labelMain);

getData(refreshView);

timer.timeout.connect(function () {
	getData(refreshView);
});
timer.start(config.interval * 1000);
