
export function toTime(_seconds) {
    const seconds = Math.round(_seconds);

    const minutes = Math.floor(seconds / 60);

    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return hours + ':' + nn(Math.floor(minutes % 60)) + ':' + nn(seconds % 60);
    } else {
        return Math.floor(minutes % 60) + ':' + nn(seconds % 60);
    }
}

export function nn(val) {
    const v = val.toString();

    if (v.length === 1) {
        return '0' + v;
    } else {
        return v;
    }
}

export  function nnn(val) {
    const v = val.toString();

    if (v.length === 1) {
        return '00' + v;
    } else if (v.length === 2) {
        return '0' + v;
    } else {
        return v;
    }
}

export function toTimeMs(seconds) {
    const ms       = Math.round(seconds * 1000);
    const msString = nnn(ms % 1000);
    const sec      = Math.floor(seconds);
    let mins       = Math.floor(sec / 60);
    let hours      = 0;

    if (mins >= 60) {
        hours = Math.floor(mins / 60);
        mins = mins % 60;
    }

    const rest = ':' + nn(sec % 60) + '.' + msString;

    if (hours) {
        return hours + ':' + nn(mins) + rest;
    } else {
        return mins + rest;
    }
}

export function timeMsToSeconds(string: string): ?number {
    const match = string.match(/^(?:(\d+):)?(\d{1,2}):(\d\d?)(?:\.(\d{1,3}))?$/);

    if (match) {
        const msS = match[4];
        let ms = parseInt(msS, 10);

        if (msS.length === 1) {
            ms *= 100;
        }

        if (msS.length === 2) {
            ms *= 10;
        }

        const hours = match[1] ? parseInt(match[1], 10) : 0;

        return hours * 60 * 60 + parseInt(match[2], 10) * 60 + parseInt(match[3], 10) + ms / 1000;

    } else {
        return null;
    }
}
