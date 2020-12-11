FROM nginx:latest

COPY config/nginx /etc/nginx
COPY public /usr/share/nginx/public
