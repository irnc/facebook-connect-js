/**
 * This file contains an un-obfuscated version of a script injected into
 * <a href="https://s-static.ak.facebook.com/xd_localstorage/v2">
 * `xd_localstorage/v2` page</a>.
 *
 * It is formated using Eclipse Shift+Ctrl+F shortcut. Logic are not changed,
 * comments added, variables & function names guessed from its body.
 *
 * @author Pavel Zubkou
 * @copyright Facebook
 */

(function() {
	if (!(window.postMessage && window.localStorage && window.JSON))
		return;

	var g = {
		setItems : function(event, items) {
			if (!allowed({write : 1}, event.origin))
				return false;

			var length = items.length;
			var result = [];

			for ( var j = 0; j < length; j++) {
				var item = items[j];
				result[j] = setItem(item.key, item.value, item.expireIn, item.acl);
			}
			return result;
		},
		getItem : function(event, item, i) {
			var k = getItem(event, item);
			if (i)
				if (item.substring(0, 9) == 'LoginInfo')
					d(item, k != null);
			return k;
		}
	};

	/**
	 * event.data is JSON, e.g. {"method":"getItem","params":["LoginInfo_199145693495958",true],"returnCb":"f3dd4c12e"}
	 */
	function receiveMessage(event) {
		var data = event.data;

		if (typeof data == 'string')
			data = JSON.parse(data);

		if (data && g[data.method]) {
			var params = data.params || [];

			params.splice(0, 0, event);

			postback(event, data.returnCb, g[data.method].apply(null, params));
		}
	}

	function postback(event, returnCallback, data) {
		if (returnCallback)
			event.source.postMessage({
				cb : returnCallback,
				data : data
			}, event.origin);
	}

	function setItem(key, value, expireIn, acl) {
		if (!key)
			return false;

		var j = {
			v : value,
			a : acl
		};

		if (expireIn)
			j.e = (new Date()).getTime() + expireIn * 1000;

		j = JSON.stringify(j);

		try {
			localStorage[key] = j;
		} catch (k) {
			return false;
		}

		return true;
	}

	function getItem(event, key) {
		var value = localStorage.getItem(key);
		if (!value)
			return null;

		var value = JSON.parse(value);
		if (!value || !allowed({read : 1}, event.origin, value.a))
			return null;

		var j = value.e && value.e < (new Date()).getTime();
		if (j || (value.a && value.a.readOnce))
			localStorage.removeItem(key);

		return j ? null : value.v;
	}

	function stripSchema(uri) {
		return (uri && uri.indexOf('://') != -1) ? uri.substr(uri.indexOf('://') + 3) : uri;
	}

	function allowed(permissions, eventOrigin, acl) {
		var eventOrigin = stripSchema(origin);
		var aclDomain = acl ? stripSchema(acl.domain) : null;
		var fromFacebook = eventOrigin.match(/\.facebook\.com$/);

		if (permissions.write && !fromFacebook)
			return false;

		if (permissions.read && !(fromFacebook || eventOrigin == aclDomain))
			return false;

		return true;
	}

	function d(k, i) {
		var j = {
			app_id : k.split('_')[1],
			cached : i,
			event_type : 'view',
			time : Math.round((new Date()).getTime())
		};
		var l = JSON.parse(localStorage.getItem('_log')) || {
			a : {
				uid : j.user_id,
				readOnce : true
			},
			v : []
		};
		l.v.push(j);
		localStorage.setItem('_log', JSON.stringify(l));
	}

	/**
	 * @link https://developer.mozilla.org/en/DOM/window.postMessage
	 */
	addEventListener('message', receiveMessage, false);
})();