#!/bin/sh

while ! ping -c1 database:5432 &>/dev/null
        do echo "Waiting for database..."
done

if [ ! -d "migrations" ]; then
  printf "Database initialization...\r\n"
  flask db init
fi

ping -c1 database:5432

flask db migrate
flask db upgrade
flask run