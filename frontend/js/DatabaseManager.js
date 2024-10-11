const snackbar = new SnackBar()
class DatabaseManager {
	constructor(url) {
		this.url = url;
	}

	async onInsertRecordSubmit(event) {
		event.preventDefault();
		try {
			const response = await fetch(this.url + "insertrecords", {
				method: "POST",
			});

			document.getElementById("insertResponse").innerHTML = await response.text();
			snackbar.showSnackbar(messages.insertSuccessful)
		} catch (error) {
			console.log(error)
		}
	}

	async onQuerySubmit(event) {
		event.preventDefault();
		try {
			const query = document.getElementById("sqlQuery").value;

			if (query.toLowerCase().includes("insert")) {
				await this.onInsert(query);
			} else if (query.toLowerCase().includes("select")) {
				await this.onRead(query);
			} else {
				snackbar.showSnackbar(messages.naughtynaughty, true)
			}

		} catch (error) {
			console.log("error parsing query: ", error)
			snackbar.showSnackbar(messages.queryError, true)
		}
	}

	async onInsert(query) {
		try {
			const requestBody = {
				query: query
			};
			const response = await fetch(this.url + "query", {
				method: "POST",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			});
			const result = await response.text();
			document.getElementById("queryResponse").innerHTML = result;
			snackbar.showSnackbar(messages.insertSuccessful, false)
		} catch (error) {
			snackbar.showSnackbar(messages.insertError, true)
		}
	}

	async onRead(query) {
		try {
			const urlObj = new URL(this.url + "query");
			const params = new URLSearchParams();
			params.append('query', query);
			urlObj.search = params;
			const requestUrl = urlObj.toString();

			const response = await fetch(requestUrl, {
				method: "GET",
			});

			const result = await response.json();
			const table = this.generateTable(result);
			document.getElementById("queryResponse").innerHTML = table;
			snackbar.showSnackbar(messages.readSuccessful, false)
		} catch (error) {
			snackbar.showSnackbar(messages.readError, true)
		}
	}

	generateTable(data) {
		// Check if the data is able to be displayed in the table or empty
		if (!Array.isArray(data)) {
			return `Invalid data returned from database`;
		} else if (data.length === 0) {
			// NOTE: Currently hard coded for patient table
			const emptyTable = `
				<table class="table table-bordered table-striped table-hover">
					<thead class="table-dark">
						<tr>
							<th>patientId</th>
							<th>name</th>
							<th>dateOfBirth</th>
						</tr>
					</thead>
				</table>
			`
			return emptyTable;
		}

		const headers = Object.keys(data[0]);

		// Create a table element
		let table = '<table class="table table-bordered table-striped table-hover">';
		table += `
                <thead class="table-dark">
                    <tr>`

		headers.forEach((header) => {
			table += `<th>${header}</th>`;
		});

		table += `  </tr>
                </thead>
                <tbody>
            `;

		// Loop through the data and create table rows
		data.forEach((item) => {
			table += `<tr>`;

			headers.forEach((header) => {
				table += `<td>${item[header]}</td>`;
			});

			table += '</tr>';
		});

		table += `
                </tbody>
            </table>
            `;
		return table;
	}
}

const main = () => {
	// Initialize front end string localization
	LocalizationHelper.localizeElements();

	// Init db manager
	const dbManager = new DatabaseManager("http://localhost:3000/api/");

	// Attach the event listeners to the form/buttons
	document.getElementById("insertForm").addEventListener("submit", async (e) => dbManager.onInsertRecordSubmit(e));
	document.getElementById("queryForm").addEventListener("submit", async (e) => dbManager.onQuerySubmit(e));
}

main()