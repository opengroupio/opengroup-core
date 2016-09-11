/**
 * A Peer is an object to construct a p2p connection.
 *
 * @param config, may hold iceServers.
 * @constructor
 */
class Peer {
  constructor (config) {
    this.config = { 'iceServers': [{ 'url': 'stun:23.21.150.121' }] };
    Object.assign(this.config, config);
    this.oneSdpIsComplete = false;
    /* global RTCPeerConnection */
    this.webrtcConnection = new RTCPeerConnection(this.config, {});
    this.webrtcConnection.peer = this;
    this.webrtcConnection.onicecandidate = this.onIceCandidate;
  }

  /**
   * The first step of creating a connection between peers.
   * It needs to be done at the initiator.
   * The datachannel is created here and is sent over the line.
   *
   * @param callback A function that will run after a successful offer with candidates has been made.
   * @returns IDP offer.
   */
  getOffer (callback) {
    if (typeof callback === 'function') { this.oneSdpIsComplete = callback; }

    this.dataChannel = this.webrtcConnection.createDataChannel('opengroup', {});
    this.dataChannel.peer = this;

    this.dataChannel.onopen = this.onDataChannelOpen;
    this.dataChannel.onmessage = this.onDataChannelMessage;
    this.dataChannel.onclose = this.onDataChannelClose;
    this.dataChannel.onerror = this.onDataChannelError;

    return this.webrtcConnection.createOffer()
    .then((offer) => {
      return this.webrtcConnection.setLocalDescription(offer);
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
   * @returns IDP answer.
   */
  getAnswer (offer, callback) {
    if (typeof callback === 'function') { this.oneSdpIsComplete = callback; }

    this.webrtcConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.dataChannel.peer = this;

      this.dataChannel.onmessage = this.onDataChannelMessage;
      this.dataChannel.onopen = this.onDataChannelOpen;
      this.dataChannel.onclose = this.onDataChannelClose;
    };

    this.offer = new RTCSessionDescription(offer);
    this.setIdFromSdpFingerprint(this.offer);
    this.webrtcConnection.setRemoteDescription(this.offer);

    return this.webrtcConnection.createAnswer()
    .then((answer) => {
      return this.webrtcConnection.setLocalDescription(answer);
    })
    .catch(() => console.log('error while creating an answer'));
  }

  /**
   * The third step of creating a connection between peers.
   * It needs to be done at the initiator.
   *
   * @param answer The IDP answer
   * @param callback A function that will run after the peers successfully connect.
   * @returns The promise of setRemoteDescription.
   */
  acceptAnswer (answer, callback) {
    if (typeof callback === 'function') { this.oneConnected = callback; }
    this.answer = new RTCSessionDescription(answer);
    this.setIdFromSdpFingerprint(this.answer);
    return this.webrtcConnection.setRemoteDescription(this.answer);
  }

  /**
   * Sets the Id of this Peer to the fingerprint recieved in the sdp.
   *
   * @param sdpObject An sdpObject.
   */
  setIdFromSdpFingerprint (sdpObject) {
    var sdpSplitted = sdpObject.sdp.split('fingerprint:');
    var fingerprintAndRest = sdpSplitted[1].split('\n');
    this.id = fingerprintAndRest[0].trim();
  }

  /**
   * When candidates are added to the IDP.
   * Interesting is the deletion of the oneSdpIsComplete.
   * This makes the abstraction easy to use.
   * Higher up you can simply use peer.getOffer(function (offer) {})
   *
   * @param event The event
   */
  onIceCandidate (event) {
    if (event.candidate == null) {
      if (typeof this.peer.oneSdpIsComplete === 'function') {
        this.peer.oneSdpIsComplete(this.localDescription);
        delete this.peer.oneSdpIsComplete;
      }
    }
  }

  /**
   * The event callback when the webRTC datachannel is opened.
   * This function starts the signaling of all the other connected peers to the newly connected peer.
   *
   * @param e Event with the webRTC data.
   */
  onDataChannelOpen (e) {
    if (typeof this.peer.oneConnected === 'function') {
      this.peer.oneConnected();
      delete this.peer.oneConnected;
    }
  }

  /**
   * The event callback when the webRTC datachannel receives a message.
   * @param e Event with the webRTC data.
   */
  onDataChannelMessage (e) {
    var data = JSON.parse(e.data);
    console.log(data);
  }

  /**
   * The event callback when the webRTC datachannel closes.
   * @param e Event with the webRTC data.
   */
  onDataChannelClose (e) {
    this.status = 'offline';
    console.log('data channel close', e);
  };

  /**
   * The event callback when the webRTC datachannel receives an error.
   * @param err The error.
   */
  onDataChannelError (err) {
    console.log(err);
  }
}

export default Peer;
