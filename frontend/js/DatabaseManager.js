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

			let table;
			if (response.status == 400) {
				table = await response.text()
			} else {
				const result = await response.json();
				table = this.generateTable(result);
			}

			document.getElementById("insertResponse").innerHTML = table;
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
		} catch (error) {
			snackbar.showSnackbar(messages.)
		}
	}

	async onRead(query) {
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
	}

	generateTable(data) {
		// Create a table element
		let table = '<table class="table table-bordered table-striped table-hover">';
		table += `
                <thead class="table-dark">
                    <tr>
			<th>Id</th>
                        <th>Name</th>
                        <th>Date of Birth</th>
                    </tr>
                </thead>
                <tbody>
            `;

		// Loop through the data and create table rows
		data.forEach((item, index) => {
			table += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td>${item.dateOfBirth}</td>
                    </tr>
                `;
		});

		table += `
                </tbody>
            </table>
            `;
		return table;
	}
}
// Usage
const dbManager = new DatabaseManager("http://localhost:3000/api/");

// Example usage: Attach the event listeners to the form/buttons
document.getElementById("insertForm").addEventListener("submit", (e) => dbManager.onInsertRecordSubmit(e));
document.getElementById("queryForm").addEventListener("submit", (e) => dbManager.onQuerySubmit(e));
