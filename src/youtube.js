// @flow

export default function get(): any {
    return window.YT;
};

let onLoadCallbacks = [];

window.onYouTubeIframeAPIReady = function() {
    if (onLoadCallbacks) {
        for (let callback of onLoadCallbacks) {
            callback();
        }

        onLoadCallbacks = null;
    }
};

export function onLoad(callback: Function) {
    if (window.YT) {
        callback();
    } else if (onLoadCallbacks) {
        onLoadCallbacks.push(callback);
    } else {
        throw 1;
    }
}
