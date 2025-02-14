FROM prom/mysqld-exporter:latest

USER root
COPY .my.cnf /etc/mysqld-exporter/.my.cnf
RUN chown nobody:nobody /etc/mysqld-exporter/.my.cnf && \
    chmod 600 /etc/mysqld-exporter/.my.cnf

USER nobody

EXPOSE 9104

ENTRYPOINT [ "/bin/mysqld_exporter" ] 