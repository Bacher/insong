let youtubePlayer;

function onYouTubeIframeAPIReady() {
    youtubePlayer = new YT.Player('player', {
        width:      '640',
        height:     '360',
        videoId:    '253vLj037K4',
        events:     {
            'onReady':       event => {
                //event.target.playVideo();
            },
            'onStateChange': event => {
                //event.data === YT.PlayerState.PLAYING
                //youtubePlayer.stopVideo()
            },
        },
        playerVars: {
            controls:       1,
            disablekb:      1,
            fs:             0,
            loop:           0,
            showinfo:       0,
            modestbranding: 1,
            rel:            0,
        },
    });
}

// let playing = false;
//
// document.addEventListener('keydown', e => {
//     if (e.which === 32) {
//         playing = !playing;
//
//         if (playing) {
//             youtubePlayer.playVideo();
//         } else {
//             youtubePlayer.pauseVideo();
//         }
//     }
// });
