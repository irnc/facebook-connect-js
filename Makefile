.PHONY: fetch-current list

fetch-current:
	@wget -nc http://connect.facebook.net/en_US/all.js && \
	VERSION=`head -n 1 all.js | cut -d, -f 3 | cut -d: -f 2 | tr -d ' '` && \
	mv all.js facebook-connect-js-$$VERSION.js && \
	echo "Fetched $$VERSION"

list:
	@for i in *.js; do \
		echo -n $$i "\t"; \
		date --date=@`head -n 1 $$i | sed -r 's/^\/\*([0-9]+).*$$/\1/'` +'%Y-%m-%d %H:%M:%S'; \
	done
