FROM python:3.7-alpine
WORKDIR /code
ENV FLASK_APP=portfolio
ENV FLASK_RUN_HOST=0.0.0.0
RUN apk add --no-cache gcc musl-dev linux-headers postgresql-dev
COPY requirements.txt requirements.txt
COPY database-init.sql /docker-entrypoint-initdb.d/
RUN pip install -r requirements.txt
EXPOSE 5000
COPY . .
RUN pip install -e .
CMD ["sh" , "./init-db.sh"]