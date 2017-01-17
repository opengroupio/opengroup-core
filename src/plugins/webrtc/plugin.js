import Plugin from 'OpenGroup/core/Plugin';
import OgWebRtc from './OgWebRtc.js';

/**
 * An OpenGroup webrtc plugin.
 */
class WebRtc extends Plugin {

    name = 'webrtc';
    config = {};

    /**
     * @param group.
     * @param config.
     * @constructor
     */
    constructor (group, config = {}) {
        super();
        Object.assign(this.config, config);
        group.connectionTypes['og-webrtc'] = OgWebRtc;
    }

    connectionButtons () {
        return [
            {
                'title': 'Invite a friend',
                'callback': () => {
                    alert('test')
                }
            },
            {
                'title': 'I received a code',
                'callback': () => {
                    alert('test')
                }
            }
        ];
    }
}

export default WebRtc;