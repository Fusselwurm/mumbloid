var
	layout = new LinearLayout(plasmoid),
	label  = new Label(),
	refreshView = function (dataString) {
		var
			lines = [],
			statusMap = {
				1: 'OK',
				2: 'WARN',
				3: 'ERROR',
				4: 'UNKNOWN'
			};
		Array.prototype.forEach.call(dataString, function (character, idx) {
			// filter ctrl chars
			if ('<>'.indexOf(character) !== -1) {
				return;
			}
			lines.push('p' + (idx + 100) + ': ' + (statusMap[character] || 'WTF'));
		});
		label.text = lines.join('\n');
	},
	getData = function () {

		var
			httpJob = plasmoid.getUrl("http://nagios.plista.com/map/nag.php"),
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
			print('got response: ' + responseBody + '. refreshing view...');
			refreshView(responseBody);
		});
	},
	timer = new QTimer();

layout.addItem(label);

getData();
timer.timeout.connect(getData);
timer.start(5000);