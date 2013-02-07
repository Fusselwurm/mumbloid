var layout = new LinearLayout(plasmoid);

var label = new Label();
layout.addItem(label);

label.text = '';
;
/*
for (var n in plasmoid) {
	names.push(n);
}

names = names.sort();

label.text = names.join('\n');


label.text = plasmoid.getOwnPropertyNames().join(',');

 */
var httpJob = plasmoid.getUrl("http://nagios.plista.com/map/nag.php");

httpJob.data.connect(function (job, data) {
	if (job == httpJob) {
		print("we have our job");
		if (data.length) {
			label.text += data.toUtf8();
			output.append(data.toUtf8())
		}
	}
});

httpJob.finished.connect(function (job) {
	if (job == httpJob) {
		print("ende");
	}
	label.text
});