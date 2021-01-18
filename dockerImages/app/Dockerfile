FROM nginx:1.19.2

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    curl \
    jq \
    procps \
    && rm -r /var/lib/apt/lists/*

ADD bootstrap.sh /bootstrap.sh
RUN chmod +x /bootstrap.sh

ADD default.conf /etc/nginx/conf.d

EXPOSE 3000

CMD [ "sh", "-c", "sh /bootstrap.sh && nginx -g 'daemon off;'" ]