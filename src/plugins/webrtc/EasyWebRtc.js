import EventEmitter from 'events';

/**
 * EasyWebRtc is an object to easily construct a p2p connection.
 */
class EasyWebRtc extends EventEmitter {

    /**
     * @param config, may hold iceServers.
     * @constructor
     */
    constructor (config) {
        super();
        this.config = {
            'iceServers': [{
                urls: 'turn:connect.opengroup.io',
                username: 'lorem',
                credential: 'ipsum'
            }, {
                urls: ['stun:connect.opengroup.io']
            }]
        };

        this.constraints = {};

        Object.assign(this.config, config);
        /* global RTCPeerConnection */
        this.RtcPeerConnection = new RTCPeerConnection(this.config, this.constraints);
        this.RtcPeerConnection.easyWebRtc = this;
        this.RtcPeerConnection.onicecandidate = this.onIceCandidate;
    }

    /**
     * The first step of creating a connection between peers.
     * It needs to be done at the initiator.
     * The datachannel is created here and is sent over the line.
     *
     * @param callback A function that will run after a successful offer with candidates has been made.
     */
    getOffer (callback) {
        if (typeof callback === 'function') {
            this.once('sdpComplete', callback);
        }

        this.dataChannel = this.RtcPeerConnection.createDataChannel('opengroup', {});
        this.dataChannel.easyWebRtc = this;

        this.dataChannel.onopen = this.onDataChannelOpen;
        this.dataChannel.onmessage = this.onDataChannelMessage;
        this.dataChannel.onclose = this.onDataChannelClose;
        this.dataChannel.onerror = this.onDataChannelError;

        this.RtcPeerConnection.createOffer()
        .then((offer) => {
            return this.RtcPeerConnection.setLocalDescription(offer);
        })
        .catch(() => console.log('error while creating an offer'));
    }

    /**
     * The second step of creating a connection between peers.
     * It needs to be done at the second peer.
     * The datachannel is received here.
     *
     * @param offer The IDP offer from the getOffer function.
     * @param callback A function that will run after a successful answer with candidates has been made.
     * @returns IDP answer as a Promise.
     */
    getAnswer (offer, callback = false) {
        if (typeof callback === 'function') {
            this.once('sdpComplete', callback);
        }

        this.RtcPeerConnection.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this.dataChannel.easyWebRtc = this;

            this.dataChannel.onmessage = this.onDataChannelMessage;
            this.dataChannel.onopen = this.onDataChannelOpen;
            this.dataChannel.onclose = this.onDataChannelClose;
            this.dataChannel.onerror = this.onDataChannelError;
        };

        this.offer = new RTCSessionDescription(offer);
        this.RtcPeerConnection.setRemoteDescription(this.offer);

        return this.RtcPeerConnection.createAnswer()
        .then((answer) => {
            return this.RtcPeerConnection.setLocalDescription(answer);
        })
        .catch(() => console.log('error while creating an answer'));
    }

    /**
     * The third step of creating a connection between peers.
     * It needs to be done at the initiator.
     *
     * @param answer The IDP answer
     * @returns The promise of setRemoteDescription.
     */
    acceptAnswer (answer) {
        this.answer = new RTCSessionDescription(answer);
        return this.RtcPeerConnection.setRemoteDescription(this.answer);
    }

    /**
     * Send a message to the peer.
     * This will mostly be called from the group to broadcast something to all peers.
     *
     * @param message The things you want to send over.
     */
    sendMessage (message) {
        if (typeof this.dataChannel !== 'undefined' && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(message));
        } else {
            this.once('connected', () => {
                this.sendMessage(message);
            });
        }
    }

    /**
     * When candidates are added to the IDP.
     * This makes the abstraction easy to use.
     * Higher up you can simply use peer.getOffer(function (offer) {})
     *
     * @param event The event
     */
    onIceCandidate (event) {
        if (event.candidate) {
            this.easyWebRtc.emit('sdpComplete', this.localDescription);
        }
    }

    /**
     * The event callback when the webRTC datachannel is opened.
     * This function starts the signaling of all the other connected peers to the newly connected peer.
     *
     * @param event Event with the webRTC data.
     */
    onDataChannelOpen (event) {
        this.easyWebRtc.emit('connected', event);
    }

    /**
     * The event callback when the webRTC datachannel receives a message.
     * @param event Event with the webRTC data.
     */
    onDataChannelMessage (event) {
        if (event.data) {
            // TODO If the message is to long if breaks in firefox.
            let data = JSON.parse(event.data);
            this.easyWebRtc.emit('message', data);
        }
    }

    /**
     * The event callback when the webRTC datachannel closes.
     * @param event Event with the webRTC data.
     */
    onDataChannelClose (event) {
        this.easyWebRtc.emit('closed', event);
    };

    /**
     * The event callback when the webRTC datachannel receives an error.
     * @param error The error.
     */
    onDataChannelError (error) {
        this.easyWebRtc.emit('error', error);
    }
}

export default EasyWebRtc;
