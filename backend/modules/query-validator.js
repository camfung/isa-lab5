class QueryValidator {
    constructor(query) {
        this.query = query.toLowerCase();
        this.tableName = null;
        this.allowSelect = true;
        this.allowInsert = true;
        this.allowUpdate = true;  // By default, updates are allowed
        this.allowDrop = true;    // By default, drops are allowed
    }

    assertTable(tableName) {
        this.tableName = tableName;
        return this;  // Return the instance to allow chaining
    }

    blockSelect() {
        this.allowSelect = false;
        return this;
    }

    blockInsert() {
        this.allowInsert = false;
        return this;
    }

    blockUpdate() {
        this.allowUpdate = false;  // Set the flag to block updates
        return this;  // Return the instance to allow chaining
    }

    blockDrop() {
        this.allowDrop = false;  // Set the flag to block drops
        return this;  // Return the instance to allow chaining
    }

    validate() {
        if (this.tableName) {
            if (!this.allowSelect && this.query.includes("select")) {
                throw new Error(`Selects are not allowed on table: ${this.tableName}`);
            }

            if (!this.allowInsert && this.query.includes("insert")) {
                throw new Error(`Inserts are not allowed on table: ${this.tableName}`);
            }

            if (!this.allowUpdate && this.query.includes("update")) {
                throw new Error(`Updates are not allowed on table: ${this.tableName}`);
            }

            if (!this.allowDrop && this.query.includes("drop")) {
                throw new Error(`Drops are not allowed on table: ${this.tableName}`);
            }
        } else {
            throw new Error("No table specified for validation.");
        }

        return true; // Return true if validation passes
    }
}

module.exports = QueryValidator;