// @flow

if (window.YT_ok) {
    alert('reload');
    window.reload();
}

export default function get(): any {
    if (!window.YT_ok) {
        throw new Error('Youtube not ready yet');
    }
    return window.YT;
};

let onLoadCallbacks = [];

window.onYouTubeIframeAPIReady = function() {
    window.YT_ok = true;

    console.log('YT LOADED', onLoadCallbacks);

    if (onLoadCallbacks) {
        for (let callback of onLoadCallbacks) {
            callback();
        }

        onLoadCallbacks = null;
    }
};

export function onLoad(callback: Function) {
    if (window.YT_ok) {
        callback();
    } else if (onLoadCallbacks) {
        onLoadCallbacks.push(callback);
    } else {
        throw 1;
    }
}
