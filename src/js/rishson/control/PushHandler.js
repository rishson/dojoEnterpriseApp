define([
	"dojo/_base/lang",	// mixin, hitch
	"dojo/_base/declare",	// declare
	"dojo/topic",	// publish/subscribe
	"dojox/cometd"
], function (lang, declare, topic, cometd) {
	/**
	 * @class
	 * @name rishson.control.Dispatcher
	 * @description This class is the conduit for all client server communication.
	 */
	return declare('rishson.control.PushHandler', null, {

		/**
		 * @field
		 * @name rishson.control.PushHandler.connected
		 * @type {boolean}
		 * @description are we connected to the server
		 */
		connected: false,

		/**
		 * @field
		 * @name rishson.control.PushHandler.url
		 * @type {string}
		 * @description the url of the server
		 */
		url: '',

		/**
		 * @constructor
		 * @param {string} url the url to connect to
		 */
		constructor: function (url, apps) {
			var i = 0,
				l = apps.length,
				app,
				appId;

			this.url = url;
			cometd.configure({
				url: url,
				logLevel: 'debug'
			});

			//for each app that needs websocket, setup a listener and
			for  (i; i < l; i += 1) {
				app = apps[i];
				if (app.websocket) {
					appId = app.id;
					//setup a websocket listener on the baseurl for the application
						cometd.addListener("/" + appId, lang.hitch(this, function _handle (message, appId) {
							this._handlePushMessage(message, appId);
						}, appId
					));
				}
			}

			cometd.addListener('/handshake', this._handshake);
			cometd.addListener('/connect', this._manageConnectionStatus);
			cometd.handshake();
		},

		/**
		 * @function
		 * @name rishson.control.PushHandler._manageConnectionStatus
		 * @description manage the connection status with the Bayeux server
		 * @param {object} message a message from the server
		 * @private
		 */
		_manageConnectionStatus: function (message) {
			var wasConnected;

			if (cometd.isDisconnected()) {
				this.connected = false;
				this._connectionClosed();
				return;
			}

			wasConnected = this.connected;
			this.connected = message.successful === true;
			if (!wasConnected && this.connected) {
				this._connectionEstablished();
			} else if (wasConnected && !this.connected) {
				this._connectionBroken();
			}
		},

		/**
		 * @function
		 * @name rishson.control.PushHandler._manageConnectionStatus
		 * @description invoked when first contacting the server and when the server has lost the state of this client
		 * @param {object} handshake a handshake response message from the server
		 * @private
		 */
		_handshake: function (handshake) {
			if (handshake.successful === true) {
				cometd.batch(function() {
					cometd.subscribe('/handshake', function (message) {
						console.debug("Server Says: " + message.data.greeting);
					});
					// Publish on a service channel since the message is for the server only
					cometd.publish('/handshake', {hello: 'World'});
				});
			}
		},

		/**
		 * @function
		 * @name rishson.control.PushHandler._connectionEstablished
		 * @description invoked when first contacting the server and when the server has lost the state of this client
		 * MUST BE IDEMPOTENT.
		 * @private
		 */
		_connectionEstablished : function () {
			console.debug("Connection established");
		},

		/**
		 * @function
		 * @name rishson.control.PushHandler._connectionBroken
		 * @description invoked when first contacting the server and when the server has lost the state of this client
		 * @private
		 */
		_connectionBroken : function () {
			console.debug("Connection broken");
		},

		/**
		 * @function
		 * @name rishson.control.PushHandler._connectionClosed
		 * @description invoked when first contacting the server and when the server has lost the state of this client
		 * @private
		 */
		_connectionClosed : function () {
			console.debug("Connection closed");
		},

		/**
		 * @function
		 * @name rishson.control.PushHandler._handlePushMesssage
		 * @description invoked when a message is received from the server
		 * @param {object} message a message from the server
		 * @param {string} appID the id of the application that the message is intended for
		 * @private
		 */
		_handlePushMessage : function (message, appId) {
			//other centralised push message handling processing can go here
			topic.publish("/" + appId + "/push", message);
		}
	});
})