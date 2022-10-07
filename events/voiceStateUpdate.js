module.exports = {
	name: 'voiceStateUpdate',
	once: false,
	execute(oldState, newState) {
        console.log(`Old channel: ${oldState.channelId} - New channel: ${newState.channelId}`);

        connected = global.customChannelList.find(elem => elem.channelId == newState.channelId);
        if(connected?.timeoutRef) {
            console.log('custom connect detected');
            clearTimeout(connected.timeoutRef);
        }

        disconnected = global.customChannelList.find(elem => elem.channelId == oldState.channelId);
        if(disconnected) {
            console.log('custom disconnect detected');
            oldState.guild.channels.fetch(disconnected.channelId)
                .then(voiceChannel => {
                    if(voiceChannel?.members?.size == 0) {
                        disconnected.timeoutRef = disconnected.initiateDeletion(voiceChannel);
                    }
                })
                .catch(() => {});

        }

    },
};
