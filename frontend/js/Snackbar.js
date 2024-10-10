class SnackBar {
	constructor(parentId, appear_time) {
		this.parentId = parentId || "snackbar"
		this.elementId = `snackbar-${this.parentId}`
		this.appear_time = appear_time || 30000
		this._makeSnackBar()
		this.snackbar = document.getElementById(this.parentId);
		this.snackbarMsg = document.getElementById(`${this.elementId}-msg`);
	}
	_makeSnackBar() {
		const snackbarDiv = document.createElement('div');
		snackbarDiv.id = this.elementId;

		const messageSpan = document.createElement('span');
		messageSpan.id = `snackbar-${this.parentId}-msg`;

		const closeButton = document.createElement('button');
		closeButton.classList.add('close-btn');
		closeButton.innerHTML = '&times;';
		closeButton.onclick = this.dismissSnackbar.bind(this);

		snackbarDiv.appendChild(messageSpan);
		snackbarDiv.appendChild(closeButton);

		document.getElementById(this.parentId).appendChild(snackbarDiv);
	}
	dismissSnackbar() {
		this.snackbar.style.opacity = '0';
		setTimeout(() => this.snackbar.style.visibility = 'hidden', 600);
	}

	showSnackbar(message, isError) {

		this.snackbarMsg.textContent = message;

		this.snackbar.style.opacity = '1';
		this.snackbar.style.visibility = 'visible';

		if (isError) {
			this.snackbar.className = "show error"
		} else {
			this.snackbar.className = "show success"
		}

		setTimeout(this.dismissSnackbar, this.appear_time);
	}

}
