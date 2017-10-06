// @flow

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
    if (window.YT && window.YT.Player) {
        callback();
    } else if (onLoadCallbacks) {
        onLoadCallbacks.push(callback);
    } else {
        throw new Error();
    }
}
