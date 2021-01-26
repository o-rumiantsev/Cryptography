openssl req -x509 -newkey rsa:4096 -keyout config/nginx/ssl/localhost.key -out config/nginx/ssl/localhost.crt -days 365

# more secure key and cert
openssl genpkey -algorithm ED25519 -outform PEM -out config/nginx/ssl/localhost.ed25519.key
openssl req -key config/nginx/ssl/localhost.ed25519.key -new -x509 -days 365 -out config/nginx/ssl/localhost.ed25519.crt

openssl ecparam -name prime256v1 -genkey -out localhost.key
openssl req -key localhost.key -new -out localhost.csr
openssl x509 -req -days 365 -in localhost.csr -signkey localhost.key -out localhost.crt