FROM prom/prometheus:latest

COPY prometheus.yml /etc/prometheus/
USER root
RUN chown nobody:nobody /etc/prometheus/prometheus.yml && \
    chmod 644 /etc/prometheus/prometheus.yml
USER nobody

EXPOSE 9090

ENTRYPOINT [ "/bin/prometheus" ]
CMD        [ "--config.file=/etc/prometheus/prometheus.yml", \
             "--storage.tsdb.path=/prometheus", \
             "--web.enable-lifecycle" ] 