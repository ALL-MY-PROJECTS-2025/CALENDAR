FROM nginx/nginx-prometheus-exporter:latest

ENV SCRAPE_URI="http://react-container:80/metrics"

EXPOSE 9113
ENTRYPOINT [ "/usr/bin/nginx-prometheus-exporter" ]
CMD [ "-nginx.scrape-uri=${SCRAPE_URI}" ] 