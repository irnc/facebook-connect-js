.PHONY: fetch-current

fetch-current:
	@wget -nc http://connect.facebook.net/en_US/all.js && \
	VERSION=`head -n 1 all.js | cut -d, -f 3 | cut -d: -f 2 | tr -d ' '` && \
	mv all.js facebook-connect-js-$$VERSION.js && \
	echo "Fetched $$VERSION"
