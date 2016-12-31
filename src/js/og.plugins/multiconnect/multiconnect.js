import EventEmitter from 'events';

/**
 * An OpenGroup multichat plugin.
 */
class MultiConnect extends EventEmitter {

    /**
     * @param group.
     * @param config.
     * @constructor
     */
    constructor (group, config = {}) {
        super();
        this.config = {};
        Object.assign(this.config, config);
        this.group = group;
        //
        // this.channeledConnections = {};
        //
        // this.group.on('newConnection', (newConnection) => {
        //     this.newConnection = newConnection;
        //
        //     this.group.connections.forEach((connection) => {
        //         if (connection != newConnection) {
        //             setTimeout(function () {
        //                 connection.sendMessage({
        //                     identifier: 'AutoConnect',
        //                     command: 'sendOffer',
        //                     doYouKnowGuid: newConnection.peer.identity.guid
        //                 })
        //             }, 200);
        //         }
        //     });
        // });
        //
        // this.group.on('message', (message, connection) => {
        //     if (message.identifier && message.identifier === 'AutoConnect') {
        //
        //         // Left person.
        //         if (message.command && message.command === 'sendOffer') {
        //             var iKnowGuid = false;
        //
        //             this.group.connections.forEach(function (myConnection) {
        //                 if (myConnection.peer.identity.guid == message.doYouKnowGuid) {
        //                     iKnowGuid = true;
        //                 }
        //             });
        //
        //             if (!iKnowGuid) {
        //                 this.preparedConnection = this.group.add({
        //                     type: 'OgEasyWebRtc',
        //                     config: {
        //                         signaler: {
        //                             type: 'OgEasyWebRtcSignalerManuel',
        //                             config: {
        //                                 role: 'initiator',
        //                             }
        //                         }
        //                     }
        //                 });
        //
        //                 this.preparedConnection.signaler.on('createdOffer', (data) => {
        //                     this.preparedConnectionCallback = data.callback;
        //                     connection.sendMessage({
        //                         identifier: 'AutoConnect',
        //                         command: 'passThroughOffer',
        //                         offer: btoa(JSON.stringify(data.offer.toJSON()))
        //                     });
        //                 });
        //             }
        //         }
        //
        //         // Middleman
        //         if (message.command && message.command === 'passThroughOffer') {
        //             this.channeledConnections[connection.peer.identity.guid] = connection;
        //
        //             this.newConnection.sendMessage({
        //                 identifier: 'AutoConnect',
        //                 command: 'createAnswer',
        //                 offer: message.offer,
        //                 guid: connection.peer.identity.guid
        //             });
        //         }
        //
        //         // Right person.
        //         if (message.command && message.command === 'createAnswer') {
        //             var offer = JSON.parse(atob(message.offer));
        //             var newGroupConnection = this.group.add({
        //                 type: 'OgEasyWebRtc',
        //                 config: {
        //                     signaler: {
        //                         type: 'OgEasyWebRtcSignalerManuel',
        //                         config: {
        //                             role: 'answerer',
        //                             offer: offer,
        //                         }
        //                     }
        //                 }
        //             });
        //
        //             newGroupConnection.signaler.on('createdAnswer', (data) => {
        //                 connection.sendMessage({
        //                     identifier: 'AutoConnect',
        //                     command: 'passThroughAnswer',
        //                     answer: btoa(JSON.stringify(data.answer.toJSON())),
        //                     guid: message.guid
        //                 });
        //             });
        //         }
        //
        //         // Middleman
        //         if (message.command && message.command === 'passThroughAnswer') {
        //             this.channeledConnections[message.guid].sendMessage({
        //                 identifier: 'AutoConnect',
        //                 command: 'acceptAnswer',
        //                 answer: message.answer
        //             });
        //         }
        //
        //         // Left person
        //         if (message.command && message.command === 'acceptAnswer') {
        //             var answer = JSON.parse(atob(message.answer));
        //             this.preparedConnectionCallback(answer);
        //         }
        //     }
        // });
    }

}

export default MultiConnect;