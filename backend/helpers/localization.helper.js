const Dictionary = require('../lang/en/en.json');

class LocalizationHelper {
    static _localizationAttribute = "data-i18n";

    // Public methods
    static localizeElements() {
        const elements = document.querySelectorAll(`[${this._localizationAttribute}]`);
        elements.forEach(element => {
            const path = element.getAttribute(this._localizationAttribute);
            const localizedString = this.getTranslation(path);

            if (localizedString) {
                element.textContent = localizedString;
            } else {
                const errorMsg = LocalizationHelper.getTranslation("ErrorMessages.LocalizationNotFound", [path]);
                console.error(errorMsg);
            }
        });
    }

    static getTranslation(key, args) {
        // Starts at the Dictionary level and drills down to the desired key until obj is the value of the key
        const templateStr = key.split('.').reduce((obj, key) => obj && obj[key], Dictionary);
        if (!templateStr) {
            return null;
        }

        if (!args) {
            return templateStr;
        }

        // Replace placeholders with corresponding values from args array
        return templateStr.replace(/%\d+/g, match => {
            const index = parseInt(match.slice(1), 10);
            return args[index] !== undefined ? args[index] : '%0';
        });
    }
}

module.exports = LocalizationHelper;