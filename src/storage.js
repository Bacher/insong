// @flow

const KEY = '_insong';

class Storage {

    _data: Object;
    _delayedSave: boolean;

    constructor() {
        const json = window.localStorage.getItem(KEY);

        if (json) {
            this._data = JSON.parse(json);
        } else {
            this._data = {};
        }

        this._delayedSave = false;
    }

    get(key: string, def?: ?any): any {
        const value = this._data[key];

        if (value === undefined) {
            return def;
        } else {
            return value;
        }
    }

    set(key: string, value: any) {
        this._data[key] = value;

        if (!this._delayedSave) {
            this._delayedSave = true;

            setTimeout(() => {
                this._save();
            }, 10);
        }
    }

    _save() {
        this._delayedSave = false;
        const json = JSON.stringify(this._data);
        window.localStorage.setItem(KEY, json);
    }

    save() {
        this._save();
    }

}

const instance = new Storage();

export default instance;
